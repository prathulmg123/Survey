import * as React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type FileWithPreview = File & {
  preview: string;
};

interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: FileWithPreview[];
  onChange?: (files: FileWithPreview[]) => void;
  accept?: DropzoneOptions["accept"];
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
}

export function FileUpload({
  value = [],
  onChange,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 1,
  multiple = false,
  disabled = false,
  className,
  ...props
}: FileUploadProps) {
  const [files, setFiles] = React.useState<FileWithPreview[]>([]);
  const [rejected, setRejected] = React.useState<{ file: File; errors: { code: string; message: string }[] }[]>([]);

  React.useEffect(() => {
    return () => {
      // Revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (disabled) return;

      // Handle accepted files
      const mappedAccepted = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const newFiles = multiple ? [...files, ...mappedAccepted].slice(0, maxFiles) : mappedAccepted;
      setFiles(newFiles);
      onChange?.(newFiles);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        setRejected((prev) => [...prev, ...rejectedFiles]);
      }
    },
    [disabled, files, maxFiles, multiple, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple,
    disabled,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const removeRejected = (index: number) => {
    setRejected((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps({
          className: cn(
            "relative rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "hover:border-primary/50",
            disabled && "cursor-not-allowed opacity-60",
            className
          ),
        })}
        {...props}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-sm text-gray-600">
            <span className="relative rounded-md bg-transparent font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
              Upload a file
            </span>{" "}or drag and drop
          </div>
          <p className="text-xs text-muted-foreground">
            {Object.entries(accept)
              .map(([_, exts]) => exts.map((ext) => ext.replace(".", "")).join(", "))
              .join(", ")}{" "}
            (max {maxSize / 1024 / 1024}MB)
          </p>
        </div>
      </div>

      {/* Accepted files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded files</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={file.name}
                className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-2 text-sm"
              >
                <div className="flex items-center space-x-2">
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rejected files */}
      {rejected.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-destructive">Rejected files</h4>
          <ul className="space-y-2">
            {rejected.map(({ file, errors }, i) => (
              <li key={file.name} className="text-sm text-destructive">
                <div className="flex items-center justify-between">
                  <span>{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => removeRejected(i)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
                <ul className="ml-4 list-disc text-xs">
                  {errors.map((e) => (
                    <li key={e.code}>{e.message}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
