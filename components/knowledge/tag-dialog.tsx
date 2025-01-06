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
import { Tag as TagIcon } from "lucide-react";

interface TagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingTags: { id: string; name: string }[];
  onTagsChange?: (tags: { id: string; name: string }[]) => void;
}

export function TagDialog({
  isOpen,
  onClose,
  existingTags,
  onTagsChange,
}: TagDialogProps) {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      const response = await fetch("/api/knowledge/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTag.trim() }),
      });

      if (!response.ok) throw new Error("Failed to create tag");

      const tag = await response.json();
      onTagsChange?.([...existingTags, tag]);
      setNewTag("");
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag name..."
              className="flex-1"
            />
            <Button onClick={handleAddTag}>
              <TagIcon className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {existingTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-2 rounded-md bg-secondary"
              >
                <span>{tag.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    onTagsChange?.(existingTags.filter((t) => t.id !== tag.id));
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}