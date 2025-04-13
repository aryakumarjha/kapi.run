import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export function CopySession() {
  const pathname = usePathname();

  const handleCopy = () => {
    const url = `${window.location.origin}${pathname}`;
    navigator.clipboard.writeText(url);
    toast.success("Session link copied to clipboard");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      <Copy className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
