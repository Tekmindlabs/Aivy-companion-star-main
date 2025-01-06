"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Share2 } from "lucide-react";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: string;
}

export function ShareDialog({
  isOpen,
  onClose,
  contentId,
  contentType,
}: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) return;

    setIsSharing(true);
    try {
      const response = await fetch("/api/knowledge/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          contentId,
          contentType,
          permissions: { read: true, write: canEdit },
        }),
      });

      if (!response.ok) throw new Error("Failed to share content");

      onClose();
    } catch (error) {
      console.error("Error sharing content:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address..."
              type="email"
              className="flex-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit"
              checked={canEdit}
              onCheckedChange={(checked) => setCanEdit(checked as boolean)}
            />
            <label
              htmlFor="edit"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Allow editing
            </label>
          </div>
          <Button onClick={handleShare} disabled={isSharing} className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            {isSharing ? "Sharing..." : "Share"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}