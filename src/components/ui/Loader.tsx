import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: number;
  text?: string;
  show?: boolean;
  fullScreen?: boolean;
}

export function Loader({ 
  className, 
  size = 24, 
  text, 
  show = true,
  fullScreen = false
}: LoaderProps) {
  if (!show) return null;
  
  return (
    <div 
      className={cn(
        fullScreen 
          ? "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          : "inline-flex items-center justify-center",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div 
          className="relative"
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          {/* Animated gradient ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin"
            style={{
              borderImage: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899) 1',
              animationDuration: '1.2s',
              animationTimingFunction: 'cubic-bezier(0.5, 0, 0.5, 1)',
            }}
          />
        </div>
        
        {text && (
          <p className="text-sm font-medium text-muted-foreground">
            {text}
          </p>
        )}
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
