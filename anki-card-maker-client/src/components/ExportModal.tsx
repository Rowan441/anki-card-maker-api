import { useState } from "react";
import JSZip from "jszip";

import type { Note } from "../models/Note";

type Props = {
  notes: Note[];
};

export default function ExportModal({ notes }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const mediaFiles = notes.flatMap((note) =>
    [note.imageFile, note.pronunciationFile].filter(Boolean)
  );

  const handleExport = async () => {
    const headers = [
      "Gurmukhi",
      "Transliteration",
      "English",
      "Synonyms",
      "Gender",
      "Word Class",
      "Pronunciation",
      "Image",
      "Image Source",
      "Translation Source",
      "Notes",
      "Tags",
    ];

    const rows = notes.map((note) => [
      note.target_text,
      note.romanization ?? "",
      note.source_text,
      note.synonyms ?? "",
      note.gender ?? "",
      note.wordClass ?? "",
      note.pronunciationFile
        ? `[sound:audio_${note.target_text.replace(
            /[^A-Za-z\u0A00-\u0A7F]+/g,
            ""
          )}_${note.pronunciationFile.name}]`
        : "",
      note.imageFile
        ? `<img src="image_${note.target_text.replace(
            /[^A-Za-z\u0A00-\u0A7F]+/g,
            ""
          )}_${note.imageFile.name}">`
        : "",
      note.imageSource ?? "",
      note.translationSource ?? "",
      note.notes ?? "",
      note.tags?.join("::") ?? "",
    ]);

    const tsv = [headers, ...rows]
      .map((row) => row.map((cell) => cell.replace(/\t/g, " ")).join("\t"))
      .join("\n");

    // Create a ZIP file with media and .tsv file
    const zip = new JSZip();

    // Add TSV to ZIP
    zip.file("anki-notes.tsv", tsv);

    // Collect promises for image and audio fetching
    const mediaPromises = notes.map(async (note) => {
      if (note.imageFile) {
        const imageBlob = new Blob([note.imageFile], {
          type: note.imageFile.type,
        });
        zip.file(
          `image_${note.target_text.replace(/[^A-Za-z\u0A00-\u0A7F]+/g, "")}_${
            note.imageFile.name
          }`,
          imageBlob
        );
      }

      if (note.pronunciationFile) {
        zip.file(
          `audio_${note.target_text.replace(/[^A-Za-z\u0A00-\u0A7F]+/g, "")}_${
            note.pronunciationFile.name
          }`,
          note.pronunciationFile
        );
      }
    });

    await Promise.all(mediaPromises);

    // Generate the ZIP and download
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    // Execute download
    const link = document.createElement("a");
    link.href = url;
    link.download = "anki-export.zip";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={() => setIsOpen(true)}
      >
        Export Notes
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow space-y-4">
            <h2 className="text-lg font-bold">Export Summary</h2>
            <p>
              <strong>Total cards:</strong> {notes.length}
            </p>
            <p>
              <strong>Media files:</strong> {mediaFiles.length}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                onClick={() => {
                  handleExport();
                  setIsOpen(false);
                }}
              >
                Download .TSV
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
