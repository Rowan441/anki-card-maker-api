// components/AudioField.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Mirt from "react-mirt";
import "react-mirt/dist/css/react-mirt.css";
import { formatMs } from "../../utils/formatMs";
import { AudioService } from "../../services/AnkiApiServices";
import Button from "../ui/Button";
import DropZone from "../ui/DropZone";


interface AudioFieldProps {
  audio?: string | File;
  onFileUpload: (file: File) => void;
  onTrim: (start_ms: number, end_ms: number) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}

export default function AudioField({
  audio,
  onFileUpload,
  onTrim,
  onDelete,
}: AudioFieldProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);

  useEffect(() => {
    let canceled = false;

    const fetchAudio = async (audioUrl: string) => {
      const response = await fetch(`${audioUrl}`);
      const blob = await response.blob();
      return new File([blob], audioUrl.split("/").pop() || "audio", {
        type: blob.type,
      });
    };
    if (audio instanceof File) {
      // direct file upload, not saved to server yet
      if (canceled) return;
      setAudioFile(audio);
      setAudioUrl(URL.createObjectURL(audio));
    } else if (typeof audio === "string") {
      // audio URL from server
      fetchAudio(audio).then((newAudioFile) => {
        if (!canceled) {
          setAudioFile(newAudioFile);
          // TODO: we are using the downloaded audio as a url evn though is it already 
          // on the server, if we can use the server audio in our <audio> tag, then we
          // don't need to download the audio (unless the user wan't to trim it with <Mirt />)
          setAudioUrl(URL.createObjectURL(newAudioFile)); 
        } 
      });
    } else {
      // No audio present
      setAudioFile(null);
      setAudioUrl("");
    }

    return () => {
      canceled = true;
    };
  }, [audio]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [trimTimes, setTrimTimes] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) onFileUpload(file);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!audioFile) return;
    setTrimTimes({ start: 0, end: 0 });
    setIsEditing(true);
  };

  const handleTrim = async () => {
    setIsTrimming(true);
    try {
      if (audioFile) await onTrim(trimTimes.start, trimTimes.end);;
      setIsEditing(false);
    }
    finally {
      setIsTrimming(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {audioFile ? (
        <audio controls src={audioUrl} className="h-8" />
      ) : (
        <DropZone onDrop={onDrop} accept={{ "audio/*": [] }} />
      )}
      <div className="flex gap-2">
        {audioFile && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Replace
          </Button>
        )}
        {audioFile && (
          <>
            <Button variant="warning" size="sm" onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="error" size="sm" loading={isDeleting} onClick={handleDelete}>
              Delete
            </Button>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onFileUpload(file);
            e.target.value = "";
          }
        }}
      />
      {/* Modal for Trimming */}
      {isEditing && audioFile && (
        <div className="fixed inset-0 bg-opacity-100 flex justify-center items-center z-150">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl relative">
            <h3 className="text-lg font-semibold mb-3">Trim Audio</h3>
            <div className="text-md mb-3 text-left">
              Duration: {formatMs(trimTimes.end - trimTimes.start)}
            </div>
            <Mirt
              file={audioFile}
              onChange={({ start, end }) => {
                setTrimTimes({ start, end });
              }}
              options={{
                waveformColor: "#4B5563",
                fineTuningDelay: 400,
                fineTuningScale: 3,
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="md" loading={isTrimming} onClick={handleTrim}>
                Save Trimmed
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
