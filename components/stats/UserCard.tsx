"use client";

import { useAccount } from "wagmi";
import { useSocialScores } from "@/hooks/useSocialScores";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function LoadingSkeleton() {
  return (
    <Card className="rounded-none">
      <CardContent>
        <div className="flex items-center gap-3">
          <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-36" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserCard() {
  const { address } = useAccount();
  const { neynar } = useSocialScores();

  if (neynar.isLoading) {
    return <LoadingSkeleton />;
  }

  const user = neynar.data;

  // No Farcaster account linked - show wallet only
  if (!user || !user.fid) {
    return (
      <Card className="rounded-none">
        <CardContent>
          <div className="flex items-center gap-3">
            {/* Gradient ring PFP */}
            <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {address ? address.slice(2, 4).toUpperCase() : "?"}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400 italic">
                No Farcaster account linked
              </p>
              {address && (
                <span className="inline-block px-2 py-0.5 text-[10px] bg-gray-100 rounded-full font-mono text-gray-600 mt-1">
                  {truncateAddress(address)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-none">
      <CardContent>
        <div className="flex items-center gap-3">
          {/* PFP with gradient ring */}
          <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex-shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-white">
              {user.pfp_url ? (
                <img
                  src={user.pfp_url}
                  alt={user.display_name || user.username || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {(user.display_name || user.username || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {user.display_name || user.username}
            </h3>
            {user.username && (
              <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            )}
            {/* Pill badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-full">
                FID: {user.fid}
              </span>
              {address && (
                <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full font-mono">
                  {truncateAddress(address)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
