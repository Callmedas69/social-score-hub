// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title HelloOnchain - Daily check-in with multi-token rewards and daily cap
/// @notice Users check in once per cooldown period and auto-claim all active token rewards
/// @dev Includes global daily claim cap to control reward distribution budget
contract HelloOnchain is Ownable {
    using SafeERC20 for IERC20;

    struct UserStats {
        uint256 firstCheckIn;
        uint256 lastCheckIn;
        uint256 totalCheckIns;
        uint256 currentStreak;
        uint256 longestStreak;
    }

    struct TokenReward {
        IERC20 token;
        uint256 amount;
        bool active;
    }

    mapping(address => UserStats) public userStats;
    TokenReward[] public rewardTokens;

    // Configurable cooldown (default 24 hours)
    uint256 public cooldownPeriod;
    uint256 public constant STREAK_WINDOW = 48 hours;
    uint256 public constant MIN_COOLDOWN = 5 minutes;
    uint256 public constant MAX_COOLDOWN = 7 days;

    // Daily claim cap
    uint256 public dailyClaimCap;      // 0 = unlimited
    uint256 public dailyClaimCount;    // Claims today
    uint256 public currentDayStart;    // Day boundary timestamp

    event CheckedIn(
        address indexed user,
        uint256 timestamp,
        uint256 totalCheckIns,
        uint256 currentStreak
    );
    event RewardClaimed(address indexed user, address indexed token, uint256 amount);
    event RewardTokenAdded(address indexed token, uint256 amount, uint256 index);
    event RewardTokenRemoved(uint256 indexed index);
    event RewardAmountUpdated(uint256 indexed index, uint256 newAmount);
    event DailyClaimCapUpdated(uint256 newCap);
    event CooldownPeriodUpdated(uint256 newPeriod);
    event DailyCapReached(uint256 timestamp, uint256 claimCount);

    error CooldownNotElapsed(uint256 timeRemaining);
    error TokenAlreadyExists(address token);
    error InvalidTokenIndex(uint256 index);
    error TokenNotActive(uint256 index);
    error ZeroAddress();
    error ZeroAmount();
    error InvalidCooldown(uint256 provided, uint256 min, uint256 max);

    /// @notice Constructor with configurable parameters
    /// @param initialOwner Address of the contract owner
    /// @param defaultToken Initial reward token (address(0) to skip)
    /// @param defaultAmount Reward amount per check-in
    /// @param _dailyClaimCap Maximum claims per day (0 = unlimited)
    /// @param _cooldownPeriod Cooldown between check-ins in seconds
    constructor(
        address initialOwner,
        address defaultToken,
        uint256 defaultAmount,
        uint256 _dailyClaimCap,
        uint256 _cooldownPeriod
    ) Ownable(initialOwner) {
        if (_cooldownPeriod < MIN_COOLDOWN || _cooldownPeriod > MAX_COOLDOWN) {
            revert InvalidCooldown(_cooldownPeriod, MIN_COOLDOWN, MAX_COOLDOWN);
        }

        dailyClaimCap = _dailyClaimCap;
        cooldownPeriod = _cooldownPeriod;
        currentDayStart = block.timestamp;

        if (defaultToken != address(0) && defaultAmount > 0) {
            _addRewardToken(IERC20(defaultToken), defaultAmount);
        }
    }

    /// @notice Check in and auto-claim all available rewards
    function helloOnchain() external {
        UserStats storage stats = userStats[msg.sender];

        uint256 timeSinceLastCheckIn = block.timestamp - stats.lastCheckIn;

        if (stats.lastCheckIn != 0 && timeSinceLastCheckIn < cooldownPeriod) {
            revert CooldownNotElapsed(cooldownPeriod - timeSinceLastCheckIn);
        }

        // First check-in ever
        if (stats.firstCheckIn == 0) {
            stats.firstCheckIn = block.timestamp;
            stats.currentStreak = 1;
        }
        // Within streak window - streak continues
        else if (timeSinceLastCheckIn <= STREAK_WINDOW) {
            stats.currentStreak++;
        }
        // Missed streak window - reset streak
        else {
            stats.currentStreak = 1;
        }

        // Update longest streak if current is higher
        if (stats.currentStreak > stats.longestStreak) {
            stats.longestStreak = stats.currentStreak;
        }

        stats.lastCheckIn = block.timestamp;
        stats.totalCheckIns++;

        emit CheckedIn(msg.sender, block.timestamp, stats.totalCheckIns, stats.currentStreak);

        _distributeRewards(msg.sender);
    }

    /// @notice Set daily claim cap
    /// @param _cap New cap (0 = unlimited)
    function setDailyClaimCap(uint256 _cap) external onlyOwner {
        dailyClaimCap = _cap;
        emit DailyClaimCapUpdated(_cap);
    }

    /// @notice Set cooldown period
    /// @param _seconds New cooldown in seconds
    function setCooldownPeriod(uint256 _seconds) external onlyOwner {
        if (_seconds < MIN_COOLDOWN || _seconds > MAX_COOLDOWN) {
            revert InvalidCooldown(_seconds, MIN_COOLDOWN, MAX_COOLDOWN);
        }
        cooldownPeriod = _seconds;
        emit CooldownPeriodUpdated(_seconds);
    }

    /// @notice Add a new reward token
    /// @param token ERC20 token address
    /// @param amount Reward amount per check-in
    function addRewardToken(IERC20 token, uint256 amount) external onlyOwner {
        _addRewardToken(token, amount);
    }

    /// @notice Remove a reward token (sets to inactive)
    /// @param index Index of the token in rewardTokens array
    function removeRewardToken(uint256 index) external onlyOwner {
        if (index >= rewardTokens.length) revert InvalidTokenIndex(index);
        if (!rewardTokens[index].active) revert TokenNotActive(index);

        rewardTokens[index].active = false;
        emit RewardTokenRemoved(index);
    }

    /// @notice Update reward amount for existing token
    /// @param index Index of the token in rewardTokens array
    /// @param newAmount New reward amount
    function updateRewardAmount(uint256 index, uint256 newAmount) external onlyOwner {
        if (index >= rewardTokens.length) revert InvalidTokenIndex(index);
        if (newAmount == 0) revert ZeroAmount();

        rewardTokens[index].amount = newAmount;
        emit RewardAmountUpdated(index, newAmount);
    }

    /// @notice Reactivate a previously removed token
    /// @param index Index of the token to reactivate
    function reactivateToken(uint256 index) external onlyOwner {
        if (index >= rewardTokens.length) revert InvalidTokenIndex(index);

        rewardTokens[index].active = true;
        emit RewardTokenAdded(
            address(rewardTokens[index].token),
            rewardTokens[index].amount,
            index
        );
    }

    /// @notice Owner withdraws tokens from contract
    /// @param token Token address to withdraw
    /// @param amount Amount to withdraw
    function withdrawTokens(IERC20 token, uint256 amount) external onlyOwner {
        token.safeTransfer(msg.sender, amount);
    }

    /// @notice Get remaining daily claims
    /// @return remaining Claims left today (returns dailyClaimCap if unlimited)
    function getRemainingDailyClaims() external view returns (uint256 remaining) {
        if (dailyClaimCap == 0) {
            return type(uint256).max; // Unlimited
        }

        uint256 currentCount = _getCurrentDayClaimCount();
        if (currentCount >= dailyClaimCap) {
            return 0;
        }
        return dailyClaimCap - currentCount;
    }

    /// @notice Check if daily cap is reached
    /// @return reached True if cap reached
    function isDailyCapReached() external view returns (bool reached) {
        if (dailyClaimCap == 0) return false;
        return _getCurrentDayClaimCount() >= dailyClaimCap;
    }

    /// @notice Get daily claim stats
    /// @return cap Current daily cap (0 = unlimited)
    /// @return claimed Claims made today
    /// @return remaining Claims remaining today
    function getDailyClaimStats() external view returns (
        uint256 cap,
        uint256 claimed,
        uint256 remaining
    ) {
        cap = dailyClaimCap;
        claimed = _getCurrentDayClaimCount();

        if (cap == 0) {
            remaining = type(uint256).max;
        } else if (claimed >= cap) {
            remaining = 0;
        } else {
            remaining = cap - claimed;
        }
    }

    /// @notice Get total number of reward tokens (active + inactive)
    /// @return count Total count
    function getRewardTokensCount() external view returns (uint256) {
        return rewardTokens.length;
    }

    /// @notice Get all active reward tokens
    /// @return tokens Array of active token rewards
    function getAllActiveRewards() external view returns (TokenReward[] memory) {
        uint256 activeCount = 0;

        for (uint256 i = 0; i < rewardTokens.length; i++) {
            if (rewardTokens[i].active) {
                activeCount++;
            }
        }

        TokenReward[] memory activeRewards = new TokenReward[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < rewardTokens.length; i++) {
            if (rewardTokens[i].active) {
                activeRewards[currentIndex] = rewardTokens[i];
                currentIndex++;
            }
        }

        return activeRewards;
    }

    /// @notice Check contract balance for specific token
    /// @param token Token address
    /// @return balance Current balance
    function getTokenBalance(IERC20 token) external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /// @notice Get user check-in statistics
    /// @param user Address to query
    /// @return firstCheckIn Timestamp of first check-in
    /// @return lastCheckIn Timestamp of last check-in
    /// @return totalCheckIns Total check-ins
    /// @return currentStreak Current consecutive days
    /// @return longestStreak Best streak achieved
    function getUserStats(address user) external view returns (
        uint256 firstCheckIn,
        uint256 lastCheckIn,
        uint256 totalCheckIns,
        uint256 currentStreak,
        uint256 longestStreak
    ) {
        UserStats memory stats = userStats[user];
        return (
            stats.firstCheckIn,
            stats.lastCheckIn,
            stats.totalCheckIns,
            stats.currentStreak,
            stats.longestStreak
        );
    }

    /// @notice Check if user can check in
    /// @param user Address to query
    /// @return canCheckIn True if eligible
    /// @return timeRemaining Seconds until next check-in
    function canUserCheckIn(address user) external view returns (bool canCheckIn, uint256 timeRemaining) {
        UserStats memory stats = userStats[user];

        if (stats.lastCheckIn == 0) {
            return (true, 0);
        }

        uint256 timeSinceLastCheckIn = block.timestamp - stats.lastCheckIn;

        if (timeSinceLastCheckIn >= cooldownPeriod) {
            return (true, 0);
        }

        return (false, cooldownPeriod - timeSinceLastCheckIn);
    }

    /// @notice Check which rewards user will receive on check-in
    /// @param user Address to query
    /// @return availableRewards Array of tokens with sufficient balance
    function willReceiveRewards(address user) external view returns (TokenReward[] memory) {
        // Check if user can check in
        if (!_canCheckIn(user)) {
            return new TokenReward[](0);
        }

        // Check if daily cap would be reached
        if (dailyClaimCap > 0 && _getCurrentDayClaimCount() >= dailyClaimCap) {
            return new TokenReward[](0);
        }

        uint256 availableCount = 0;

        for (uint256 i = 0; i < rewardTokens.length; i++) {
            if (rewardTokens[i].active &&
                rewardTokens[i].token.balanceOf(address(this)) >= rewardTokens[i].amount) {
                availableCount++;
            }
        }

        TokenReward[] memory available = new TokenReward[](availableCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < rewardTokens.length; i++) {
            if (rewardTokens[i].active &&
                rewardTokens[i].token.balanceOf(address(this)) >= rewardTokens[i].amount) {
                available[currentIndex] = rewardTokens[i];
                currentIndex++;
            }
        }

        return available;
    }

    /// @dev Get current day's claim count (handles day rollover)
    function _getCurrentDayClaimCount() internal view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        uint256 storedDay = currentDayStart / 1 days;

        if (today > storedDay) {
            return 0; // New day, count resets
        }
        return dailyClaimCount;
    }

    /// @dev Internal function to add reward token
    function _addRewardToken(IERC20 token, uint256 amount) internal {
        if (address(token) == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        // Check if token already exists and is active
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            if (address(rewardTokens[i].token) == address(token) && rewardTokens[i].active) {
                revert TokenAlreadyExists(address(token));
            }
        }

        uint256 index = rewardTokens.length;
        rewardTokens.push(TokenReward({
            token: token,
            amount: amount,
            active: true
        }));

        emit RewardTokenAdded(address(token), amount, index);
    }

    /// @dev Internal function to distribute rewards with daily cap
    function _distributeRewards(address user) internal {
        // Handle day rollover
        uint256 today = block.timestamp / 1 days;
        uint256 storedDay = currentDayStart / 1 days;

        if (today > storedDay) {
            dailyClaimCount = 0;
            currentDayStart = block.timestamp;
        }

        // Check daily cap (0 = unlimited)
        if (dailyClaimCap > 0 && dailyClaimCount >= dailyClaimCap) {
            emit DailyCapReached(block.timestamp, dailyClaimCount);
            return; // Cap reached, no rewards distributed
        }

        // Increment claim count
        dailyClaimCount++;

        // Distribute all active rewards
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            if (!rewardTokens[i].active) continue;

            IERC20 token = rewardTokens[i].token;
            uint256 amount = rewardTokens[i].amount;
            uint256 balance = token.balanceOf(address(this));

            if (balance >= amount) {
                token.safeTransfer(user, amount);
                emit RewardClaimed(user, address(token), amount);
            }
        }
    }

    /// @dev Internal helper to check if user can check in
    function _canCheckIn(address user) internal view returns (bool) {
        UserStats memory stats = userStats[user];

        if (stats.lastCheckIn == 0) {
            return true;
        }

        return (block.timestamp - stats.lastCheckIn) >= cooldownPeriod;
    }
}
