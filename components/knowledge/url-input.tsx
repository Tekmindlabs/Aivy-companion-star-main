"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";

export function URLInput() {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/knowledge/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("URL processing failed");
      
      setUrl("");
      // Handle successful processing
    } catch (error) {
      console.error("URL processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL to save..."
        type="url"
        disabled={isProcessing}
      />
      <Button type="submit" disabled={isProcessing}>
        <Link className="h-4 w-4 mr-2" />
        {isProcessing ? "Processing..." : "Save URL"}
      </Button>
    </form>
  );
}