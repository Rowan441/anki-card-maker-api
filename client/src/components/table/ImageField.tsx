import { useState } from "react";
import Button from "../ui/Button";
import DropZone from "../ui/DropZone";

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
        <DropZone
          onDrop={onDrop}
          accept={{
            "image/png": [],
            "image/jpeg": [],
          }}
        />
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
