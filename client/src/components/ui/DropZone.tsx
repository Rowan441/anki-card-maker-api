import { useDropzone } from "react-dropzone";

interface DropZoneProps {
  onDrop: (files: File[]) => void;
  accept: Record<string, string[]>;
  icon?: React.ReactNode;
  multiple?: boolean;
}

export default function DropZone({
  onDrop,
  accept,
  icon,
  multiple = false,
}: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-3 w-full border-2 border-dashed rounded-md text-center cursor-pointer transition ${
        isDragActive
          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950"
          : "border-gray-500 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        {icon || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-blue-400 dark:text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V8m0 0l-4 4m4-4l4 4m5 4V8m0 0l-4 4m4-4l4 4"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
