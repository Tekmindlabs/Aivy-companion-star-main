"use client";

import { Card } from "@/components/ui/card";
import { FileText, Link as LinkIcon, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SearchResult {
  id: string;
  type: "document" | "url" | "note";
  title: string;
  excerpt: string;
  createdAt: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onResultClick: (result: SearchResult) => void;
}

export function SearchResults({ results, onResultClick }: SearchResultsProps) {
  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4" />;
      case "url":
        return <LinkIcon className="h-4 w-4" />;
      case "note":
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card
          key={result.id}
          className="p-4 hover:bg-accent cursor-pointer transition-colors"
          onClick={() => onResultClick(result)}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              {getIcon(result.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{result.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{result.excerpt}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}