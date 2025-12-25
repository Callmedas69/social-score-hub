export interface UserStats {
  firstCheckIn: bigint;
  lastCheckIn: bigint;
  totalCheckIns: bigint;
  currentStreak: bigint;
  longestStreak: bigint;
}

export interface FormattedUserStats {
  firstCheckIn: Date | null;
  lastCheckIn: Date | null;
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
}

export interface RewardToken {
  token: `0x${string}`;
  amount: bigint;
  active: boolean;
}

export interface CheckInStatus {
  canCheckIn: boolean;
  timeRemaining: bigint;
}

export interface TokenMetadata {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
}
