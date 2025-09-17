import { cn } from "@/lib/utils";

interface PageLoaderProps {
  message?: string;
  className?: string;
  spinnerClassName?: string;
}

export function PageLoader({
  message = "Loading...",
  className = "",
  spinnerClassName = "",
}: PageLoaderProps) {
  return (
    <div className={cn("h-[calc(100vh-4rem)] flex items-center justify-center", className)}>
      <div className="text-center">
        <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto", spinnerClassName)}></div>
        <p className="mt-2 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
