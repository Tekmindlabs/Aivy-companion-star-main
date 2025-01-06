"use client";

import { Badge } from "@/components/ui/badge";
import { Tag as TagIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagDialog } from "./tag-dialog";
import { useState } from "react";

interface TagListProps {
  tags: { id: string; name: string }[];
  onTagsChange?: (tags: { id: string; name: string }[]) => void;
  editable?: boolean;
}

export function TagList({ tags, onTagsChange, editable = false }: TagListProps) {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map((tag) => (
        <Badge key={tag.id} variant="secondary">
          <TagIcon className="h-3 w-3 mr-1" />
          {tag.name}
        </Badge>
      ))}
      {editable && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            onClick={() => setIsTagDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Tag
          </Button>
          <TagDialog
            isOpen={isTagDialogOpen}
            onClose={() => setIsTagDialogOpen(false)}
            existingTags={tags}
            onTagsChange={onTagsChange}
          />
        </>
      )}
    </div>
  );
}