import { useState } from "react";
import { useDropzone } from "react-dropzone";
import Button from "../ui/Button";

type Props = {
  imageUrl?: string;
  onReplace: (file: File) => void;
  onDelete: () => void | Promise<void>;
};

export default function ImageField({ imageUrl, onReplace, onDelete }: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) onReplace(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
    "image/png": [],
    "image/jpeg": [],
  },
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt="Thumbnail"
            className="my-2 rounded-md max-h-16 max-w-16"
            onClick={() => setModalOpen(true)}
          />
          <div className="flex space-x-2 mb-2">
            <Button variant="error" size="sm" onClick={handleDelete} loading={isDeleting}>
              Delete
            </Button>
          </div>
        </>
      ) : (
        <div
          {...getRootProps()}
          className={`p-3 my-2 border-2 border-dashed rounded-md text-center cursor-pointer transition ${
            isDragActive && !imageUrl
              ? "border-blue-500 bg-blue-50"
              : "border-gray-500 hover:border-blue-400"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-400"
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
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <img
            src={imageUrl}
            alt="Full-size"
            className="max-w-[90%] max-h-[90%] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
