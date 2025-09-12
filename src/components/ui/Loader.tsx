import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: number;
  text?: string;
  show?: boolean;
}

export function Loader({ className, size = 32, text, show = true }: LoaderProps) {
  if (!show) return null;
  
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center ", className)}>
      <div className="p-6  flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary" size={size} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
}

// Global loader component that connects to Redux
import { useAppSelector } from "@/app/hooks";

export function GlobalLoader() {
  const { isLoading, loadingText } = useAppSelector((state) => state.loader);
  
  return <Loader show={isLoading} text={loadingText} />;
}
