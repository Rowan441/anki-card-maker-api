// components/AudioField.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Mirt from "react-mirt";
import "react-mirt/dist/css/react-mirt.css";
import { formatMs } from "../../utils/formatMs";
import { AudioService } from "../../services/AnkiApiServices";

const API_BASE = import.meta.env.VITE_API_URL;

interface AudioFieldProps {
  audio?: string | File;
  onFileUpload: (file: File) => void;
  onTrim: (start_ms: number, end_ms: number) => void;
  onDelete: () => void;
}

export default function AudioField({
  audio,
  onFileUpload,
  onTrim,
  onDelete,
}: AudioFieldProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("asdasdf");

  useEffect(() => {
    let canceled = false;

    const fetchAudio = async (audioUrl: string) => {
      const response = await fetch(`${API_BASE}${audioUrl}`);
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
          setAudioUrl(audio);
        }
      });
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "audio/*": [] },
  });

  const handleEdit = () => {
    if (!audioFile) return;
    setTrimTimes({ start: 0, end: 0 });
    setIsEditing(true);
  };

  const handleTrim = async () => {
    if (!audioFile) return;
    onTrim(trimTimes.start, trimTimes.end);
    setIsEditing(false);
  };

  return (
    <div className="w-72">
      {audioFile ? (
        <div className="flex items-center gap-2 ">
          <audio controls src={audioUrl} className="h-8" />
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`p-3 my-2 border-2 border-dashed rounded-md text-center cursor-pointer transition ${
            isDragActive && !audioFile
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
      <div className="flex gap-2 mt-2">
        {audioFile && (
          <button
            onClick={() => inputRef.current?.click()}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
          >
            Replace
          </button>
        )}
        {audioFile && (
          <>
            <button
              onClick={handleEdit}
              className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
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
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleTrim}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                Save Trimmed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
