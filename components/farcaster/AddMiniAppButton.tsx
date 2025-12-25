"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFarcasterActions } from "@/hooks/useFarcasterActions";

interface AddMiniAppButtonProps {
  variant?: "default" | "icon";
  className?: string;
}

export function AddMiniAppButton({ variant = "default", className }: AddMiniAppButtonProps) {
  const { addMiniApp } = useFarcasterActions();

  const handleAdd = async () => {
    await addMiniApp();
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleAdd}
        className={`flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${className}`}
        aria-label="Add to Farcaster"
      >
        <Plus className="w-4 h-4 text-gray-600" />
      </button>
    );
  }

  return (
    <Button
      onClick={handleAdd}
      size="sm"
      variant="outline"
      className={`gap-1.5 rounded-full text-xs ${className}`}
    >
      <Plus className="w-3.5 h-3.5" />
      Add to Farcaster
    </Button>
  );
}
