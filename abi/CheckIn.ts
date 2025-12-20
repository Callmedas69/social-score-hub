export const CHECKIN_ADDRESS = "0xD6D76eE65319f72d398BB5EAbA042f70D88CD618" as const;

export const CHECKIN_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "initialOwner", type: "address" },
      { name: "defaultToken", type: "address" },
      { name: "defaultAmount", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "COOLDOWN",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "STREAK_WINDOW",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addRewardToken",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "canUserCheckIn",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "canCheckIn", type: "bool" },
      { name: "timeRemaining", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "checkIn",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAllActiveRewards",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRewardTokensCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTokenBalance",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserStats",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "firstCheckIn", type: "uint256" },
      { name: "lastCheckIn", type: "uint256" },
      { name: "totalCheckIns", type: "uint256" },
      { name: "currentStreak", type: "uint256" },
      { name: "longestStreak", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "reactivateToken",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeRewardToken",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "rewardTokens",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateRewardAmount",
    inputs: [
      { name: "index", type: "uint256" },
      { name: "newAmount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "userStats",
    inputs: [{ name: "", type: "address" }],
    outputs: [
      { name: "firstCheckIn", type: "uint256" },
      { name: "lastCheckIn", type: "uint256" },
      { name: "totalCheckIns", type: "uint256" },
      { name: "currentStreak", type: "uint256" },
      { name: "longestStreak", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "willReceiveRewards",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawTokens",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "CheckedIn",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
      { name: "totalCheckIns", type: "uint256", indexed: false },
      { name: "currentStreak", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      { name: "previousOwner", type: "address", indexed: true },
      { name: "newOwner", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "RewardAmountUpdated",
    inputs: [
      { name: "index", type: "uint256", indexed: true },
      { name: "newAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RewardClaimed",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RewardTokenAdded",
    inputs: [
      { name: "token", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "index", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RewardTokenRemoved",
    inputs: [{ name: "index", type: "uint256", indexed: true }],
  },
  {
    type: "error",
    name: "CooldownNotElapsed",
    inputs: [{ name: "timeRemaining", type: "uint256" }],
  },
  {
    type: "error",
    name: "InvalidTokenIndex",
    inputs: [{ name: "index", type: "uint256" }],
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address" }],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address" }],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address" }],
  },
  {
    type: "error",
    name: "TokenAlreadyExists",
    inputs: [{ name: "token", type: "address" }],
  },
  {
    type: "error",
    name: "TokenNotActive",
    inputs: [{ name: "index", type: "uint256" }],
  },
  {
    type: "error",
    name: "ZeroAddress",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroAmount",
    inputs: [],
  },
] as const;
