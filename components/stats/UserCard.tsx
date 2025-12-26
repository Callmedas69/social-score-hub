"use client";

import { useSocialScores } from "@/hooks/useSocialScores";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-[64px_1fr] gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserCard() {
  const { neynar } = useSocialScores();

  if (neynar.isLoading) {
    return <LoadingSkeleton />;
  }

  const user = neynar.data;

  // No Farcaster account linked
  if (!user || !user.fid) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-gray-400 italic text-center">
            No Farcaster account linked to this wallet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-[64px_1fr] gap-4 items-center">
          {/* Left: PFP */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {user.pfp_url ? (
              <img
                src={user.pfp_url}
                alt={user.display_name || user.username || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {(user.display_name || user.username || "?").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Right: User Details */}
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {user.display_name || user.username}
            </h3>
            {user.username && (
              <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">FID: {user.fid}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
