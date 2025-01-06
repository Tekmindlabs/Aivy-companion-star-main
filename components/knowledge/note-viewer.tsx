"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Share2, Tag } from "lucide-react";
import { TagList } from "./tag-list";
import { ShareDialog } from "./share-dialog";
import { formatDistanceToNow } from "date-fns";

interface NoteViewerProps {
  note: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    tags: { id: string; name: string }[];
  };
  onEdit: () => void;
}

export function NoteViewer({ note, onEdit }: NoteViewerProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{note.title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsShareDialogOpen(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        Created {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
      </div>

      <TagList tags={note.tags} />

      <div className="prose dark:prose-invert mt-6 max-w-none">
        {note.content}
      </div>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        contentId={note.id}
        contentType="note"
      />
    </Card>
  );
}