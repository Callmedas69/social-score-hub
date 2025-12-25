"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFarcasterActions } from "@/hooks/useFarcasterActions";

const STORAGE_KEY = "add-miniapp-dismissed";

export function AddMiniAppModal() {
  const [open, setOpen] = useState(false);
  const { addMiniApp } = useFarcasterActions();

  useEffect(() => {
    // Check if user has dismissed the modal before
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Small delay for better UX after page load
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAdd = async () => {
    const success = await addMiniApp();
    if (success) {
      localStorage.setItem(STORAGE_KEY, "true");
      setOpen(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xs rounded-2xl">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-bold mb-0 pb-0">
            Add MiniApp
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-o pt-0">
            for quick access
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            TrustCheck
          </Button>
          <Button variant="ghost" onClick={handleDismiss} className="text-xs">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
