/**
 * Validates Ethereum address format
 * @param address - The address to validate
 * @returns true if valid 0x-prefixed 40 character hex address
 */
export function isValidAddress(address: string | undefined | null): address is `0x${string}` {
  return !!address && /^0x[a-fA-F0-9]{40}$/.test(address);
}
