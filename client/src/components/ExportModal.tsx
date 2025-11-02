import { useState } from "react";
import JSZip from "jszip";
import type { Note } from "../models/Note";
import Button from "./ui/Button";
import { handleError } from "../utils/errorHandler";

interface ExportModalProps {
  notes: Note[];
}

export default function ExportModal({ notes }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate a unique hash for media filenames based on card content
  const generateHash = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex.substring(0, 12); // Use first 12 chars for shorter filenames
  };

  const exportToAnki = async () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().getTime();
      const mediaZip = new JSZip();
      let tsvContent = "";

      for (const note of notes) {
        // Generate unique hash for this card
        const cardId = await generateHash(
          `${note.target_text}-${note.romanization}-${note.source_text}`
        );

        const fields: string[] = [];

        // Field 1: Target text (Gurmukhi)
        fields.push((note.target_text || "").replace(/\t/g, " ").replace(/\n/g, "<br>"));

        // Field 2: Romanization
        fields.push((note.romanization || "").replace(/\t/g, " ").replace(/\n/g, "<br>"));

        // Field 3: Source text (English)
        fields.push((note.source_text || "").replace(/\t/g, " ").replace(/\n/g, "<br>"));

        // Field 4: Audio
        let audioField = "";
        if (note.audio_url) {
          const audioFileName = `${cardId}_audio.mp3`;
          try {
            const response = await fetch(note.audio_url);
            const blob = await response.blob();
            mediaZip.file(audioFileName, blob);
            audioField = `[sound:${audioFileName}]`;
          } catch (err) {
            handleError(err, "ExportModal - Audio Fetch", {
              silent: true,
              showToast: false
            });
          }
        }
        fields.push(audioField);

        // Field 5: Image
        let imageField = "";
        if (note.image_url) {
          const imageExt = note.image_url.toLowerCase().includes(".png") ? "png" : "jpg";
          const imageFileName = `${cardId}_image.${imageExt}`;
          try {
            const response = await fetch(note.image_url);
            const blob = await response.blob();
            mediaZip.file(imageFileName, blob);
            imageField = `<img src="${imageFileName}">`;
          } catch (err) {
            handleError(err, "ExportModal - Image Fetch", {
              silent: true,
              showToast: false
            });
          }
        }
        fields.push(imageField);

        tsvContent += fields.join("\t") + "\n";
      }

      // Download TSV file
      const tsvBlob = new Blob([tsvContent], { type: "text/tab-separated-values;charset=utf-8" });
      const tsvUrl = URL.createObjectURL(tsvBlob);
      const tsvLink = document.createElement("a");
      tsvLink.href = tsvUrl;
      tsvLink.download = `anki_cards_${timestamp}.tsv`;
      tsvLink.click();
      URL.revokeObjectURL(tsvUrl);

      // Download media zip file
      const mediaBlob = await mediaZip.generateAsync({ type: "blob" });
      const mediaUrl = URL.createObjectURL(mediaBlob);
      const mediaLink = document.createElement("a");
      mediaLink.href = mediaUrl;
      mediaLink.download = `anki_media_${timestamp}.zip`;
      mediaLink.click();
      URL.revokeObjectURL(mediaUrl);

      setIsModalOpen(false);
    } catch (error) {
      handleError(error, "ExportModal", {
        toastMessage: "Failed to export cards. Please try again."
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="success"
        size="md"
        onClick={() => setIsModalOpen(true)}
        disabled={notes.length === 0}
      >
        Export to Anki ({notes.length} cards)
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold text-default mb-4">
              Export to Anki
            </h2>
            <p className="text-default mb-2">
              This will export {notes.length} card{notes.length !== 1 ? "s" : ""} as 2 files:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mb-4 space-y-1">
              <li><strong>TXT file</strong> - Tab-separated card data with media references</li>
              <li><strong>Media ZIP</strong> - Contains all audio and image files</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              <strong>Import instructions:</strong><br/>
              1. Extract the media ZIP to your Anki collection.media folder<br/>
              2. Import the TXT file into Anki using File → Import
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsModalOpen(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                size="md"
                onClick={exportToAnki}
                loading={isExporting}
              >
                Export
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
