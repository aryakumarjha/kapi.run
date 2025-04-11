"use client";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useCallback, useState } from "react";

export default function CopySession() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [setCopied]);

  return (
    <Button variant="outline" size="sm" onClick={handleCopyLink}>
      <Share2 className="mr-2 h-4 w-4" />
      {copied ? "Copied!" : "Share"}
    </Button>
  );
}
