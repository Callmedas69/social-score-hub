"use client";

import { useAccount } from "wagmi";
import { RewardsList } from "@/components/rewards/RewardsList";
import { PendingRewards } from "@/components/rewards/PendingRewards";
import { Navigation } from "@/components/layout/Navigation";

export default function RewardsPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-gray-500">Connecting wallet...</p>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 p-4 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Rewards
        </h1>

        {/* Pending rewards section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Next Check-in Rewards
          </h2>
          <PendingRewards />
        </section>

        {/* Active rewards section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Active Reward Tokens
          </h2>
          <RewardsList />
        </section>
      </main>

      <Navigation />
    </div>
  );
}
