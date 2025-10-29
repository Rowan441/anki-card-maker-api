// components/WordListTable.tsx

import {
  useState,
  useRef,
  useMemo,
  type KeyboardEvent,
  useEffect,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";

import ImageField from "./table/ImageField";
import ExportModal from "./ExportModal";
import type { Note, NoteUploadApi } from "../models/Note";
import AudioField from "./table/AudioField";

import Button from "./ui/Button";
import { transliterate } from "../utils/transliterate";
import AutofillColumnButton from "./ui/AutocompleteButton";
import {
  AudioService,
  NotesService,
  TranslationService,
} from "../services/AnkiApiServices";
import { useOnlineStatus } from "../provider/OnlineStatusProvider";

interface WordListTableProps {
  deckId: number;
}

export default function WordListTable({ deckId }: WordListTableProps) {
  const isOnline = useOnlineStatus();
  // Replace with your initial words data or import from a file
  const [notes, setNotes] = useState<Note[]>([] as Note[]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [loadingTableRows, setLoadingTableRows] = useState(true);
  const [isAddingRow, setIsAddingRow] = useState(false);
  

  // Fetch initial words from NotesService
  useEffect(() => {
    async function fetchNotes() {
      setLoadingTableRows(true);
      try {
        const fetchedNotes = await NotesService.index({ deck_id: deckId });
        setNotes(fetchedNotes);
      } catch (err) {
        // handle error if needed
      } finally {
        setLoadingTableRows(false);
      }
    }
    fetchNotes();
  }, [deckId]);

  const [newEntry, setNewEntry] = useState<Partial<Note>>({
    target_text: "",
    romanization: "",
    source_text: "",
  });
  const inputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[][]>([]);
  const newInputRefs = useRef<(HTMLInputElement | HTMLTextAreaElement | null)[]>([]);

  // Auto-resize textarea to fit content
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Auto-resize all textareas when notes data changes (for initial load and autofill)
  useEffect(() => {
    inputRefs.current.forEach((row) => {
      row.forEach((element) => {
        if (element instanceof HTMLTextAreaElement) {
          autoResizeTextarea(element);
        }
      });
    });
  }, [notes]);

  // Auto-resize new entry row textareas when newEntry changes
  useEffect(() => {
    newInputRefs.current.forEach((element) => {
      if (element instanceof HTMLTextAreaElement) {
        autoResizeTextarea(element);
      }
    });
  }, [newEntry]);

  const handleUpdate = async (
    id: number,
    updates: Partial<Note>
    // updateInDb: boolean = false
  ) => {
    // if (updateInDb) {
    //   try {
    //     const updatedNote = await NotesService.update({
    //       deck_id: 3,
    //       id: id,
    //       payload: {
    //         target_text: updates.target_text,
    //         romanization: updates.romanization,
    //         source_text: updates.source_text,
    //         audio: updates.pronunciationFile,
    //         image: updates.imageFile,
    //       } as NoteUploadApi,
    //     }).catch((err) => {
    //       console.error("Failed to update note with audio:", err);
    //     });
    //     if (updatedNote?.audioUrl) {
    //       updates.pronunciationFile = updatedNote.audioUrl;
    //     }
    //     if (updatedNote?.imageUrl) {
    //       updates.imageFile = updatedNote.imageUrl;
    //     }
    //   } catch (err) {
    //     console.error("Failed to update note:", err);
    //     //todo handle offline case and failed uploads
    //   }
    // }
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id !== id) return note;
        return { ...note, ...updates };
      })
    );
  };

  const handleBulkDelete = () => {
    const selectedIds = new Set(
      table.getSelectedRowModel().rows.map((row) => row.original.id)
    );
    table.resetRowSelection();
    setNotes((prev) => prev.filter((note) => !selectedIds.has(note.id)));
    selectedIds.forEach((id) => {
      NotesService.delete({ deck_id: deckId, id }).catch((err) => {
        console.error("Failed to delete note:", err);
      });
    });
  };

  const handleAddRow = async () => {
    const uploadNote: NoteUploadApi = {
      target_text: newEntry.target_text,
      source_text: newEntry.source_text,
      romanization: newEntry.romanization,
      audio: newEntry.audioFile,
      image: newEntry.imageFile
    };
    const newNote = await NotesService.create({ deck_id: deckId, payload: uploadNote }).catch((err) => {
      console.error("Failed to create note:", err);
      return;
    });
    if (newNote) {
      setNotes((prev) => [...prev, newNote]);
      setNewEntry({ target_text: "", romanization: "", source_text: "" });
    }

  };

  const handleKeyDown = (
    keyEvent: KeyboardEvent,
    colIndex: number,
  ) => {
    if (keyEvent.key !== "Enter") return;
    keyEvent.preventDefault(); // Prevent newline from being added
    handleAddRow();
    newInputRefs.current[colIndex]?.focus();
  };

  const columns: ColumnDef<Note>[] = useMemo(
    () => [
      {
        header: "Gurmukhi",
        accessorKey: "target_text",
        cell: ({ row, getValue }) => (
          <textarea
            ref={(el) => {
              if (!inputRefs.current[row.index])
                inputRefs.current[row.index] = [];
              inputRefs.current[row.index][0] = el as any;
            }}
            className="border input-default px-2 py-1 rounded text-sm w-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none overflow-hidden"
            value={getValue() as string}
            onChange={(e) => {
              autoResizeTextarea(e.target);
              handleUpdate(row.original.id, { target_text: e.target.value });
            }}
            onBlur={(e) => {
              handleUpdate(row.original.id, { target_text: e.target.value });
              NotesService.update({
                deck_id: deckId,
                id: row.original.id,
                payload: { target_text: e.target.value },
              });
            }}
            rows={1}
          />
        ),
      },
      {
        header: "Transliteration",
        accessorKey: "romanization",
        cell: ({ row, getValue }) => (
          <textarea
            ref={(el) => {
              if (!inputRefs.current[row.index])
                inputRefs.current[row.index] = [];
              inputRefs.current[row.index][1] = el as any;
            }}
            className="border input-default px-2 py-1 rounded text-sm w-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none overflow-hidden"
            value={getValue() as string}
            onChange={(e) => {
              autoResizeTextarea(e.target);
              handleUpdate(row.original.id, { romanization: e.target.value });
            }}
            onBlur={(e) => {
              handleUpdate(row.original.id, { romanization: e.target.value });
              NotesService.update({
                deck_id: deckId,
                id: row.original.id,
                payload: { romanization: e.target.value },
              });
            }}
            rows={1}
          />
        ),
      },
      {
        header: "English",
        accessorKey: "source_text",
        cell: ({ row, getValue }) => (
          <textarea
            ref={(el) => {
              if (!inputRefs.current[row.index])
                inputRefs.current[row.index] = [];
              inputRefs.current[row.index][2] = el as any;
            }}
            className="border input-default px-2 py-1 rounded text-sm w-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none overflow-hidden"
            value={getValue() as string}
            onChange={(e) => {
              autoResizeTextarea(e.target);
              handleUpdate(row.original.id, { source_text: e.target.value });
            }}
            onBlur={(e) => {
              handleUpdate(row.original.id, { source_text: e.target.value });
              NotesService.update({
                deck_id: deckId,
                id: row.original.id,
                payload: { source_text: e.target.value },
              });
            }}
            rows={1}
          />
        ),
      },
      {
        header: "Audio",
        accessorKey: "audio_url",
        cell: ({ row }) => (
          <AudioField
            audio={row.getValue("audio_url")}
            onFileUpload={async (file: File) => {
              const updatedNote = await NotesService.update({
                deck_id: deckId,
                id: row.original.id,
                payload: { audio: file },
              });
              handleUpdate(row.original.id, {
                audio_url: updatedNote.audio_url,
              });
            }}
            onTrim={async (start, end) => {
              const updatedNote = await NotesService.trim({
                deck_id: deckId,
                id: row.original.id,
                start: start.toString(),
                end: end.toString(),
              });

              handleUpdate(row.original.id, {
                audio_url: updatedNote.audio_url,
              });
            }}
            onDelete={async () => {
              await NotesService.update({
                deck_id: deckId,
                id: row.original.id,
                payload: { remove_audio: true },
              });
              handleUpdate(row.original.id, {
                audio_url: undefined,
                audioFile: undefined,
              });
            }}
          />
        ),
      },
      {
        header: "Image",
        accessorKey: "image_url",
        cell: ({ row }) => (
          <ImageField
            imageUrl={
              row.getValue("image_url")
            }
            onReplace={async (file) => {
              const updatedNote = await NotesService.update({
                deck_id: deckId,
                id: row.original.id,
                payload: { image: file },
              });
              handleUpdate(row.original.id, {
                image_url: updatedNote.image_url,
              });
            }}
            onDelete={async () => {
              await NotesService.update({
                deck_id: deckId,
                id: row.original.id,
                payload: { remove_image: true },
              });
              handleUpdate(row.original.id, {
                // imageFile: undefined,
                image_url: undefined,
              });
            }}
          />
        ),
      },
      {
        id: "select",
        header: ({ table }) => (
            <input
              type="checkbox"
              className="h-5 w-5 cursor-pointer"
              checked={table.getIsAllRowsSelected()}
              ref={(el) => {
                if (el)
                  el.indeterminate =
                    !table.getIsAllRowsSelected() &&
                    table.getIsSomeRowsSelected();
              }}
              onChange={table.getToggleAllRowsSelectedHandler()}
              title="Select all"
            />
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <input
              type="checkbox"
              className="h-5 w-5 cursor-pointer"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: notes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });

  return (
    <div className="bg-surface p-2 rounded-lg shadow-md transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-semibold text-default">Word List</h1>
        {!isOnline && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs px-2 py-1 rounded">
            Offline
          </div>
        )}
      </div>
      <div className="relative">
        {loadingTableRows && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading notes...</p>
            </div>
          </div>
        )}
        <table className="table-auto w-full border border-default bg-surface">
        <thead>
          <tr>
            <th colSpan={1} className="px-2 py-1 border border-default bg-surface-secondary">
              <AutofillColumnButton
                column="target_text"
                table={table}
                notes={notes}
                setNotes={(notes) => {
                  notes.forEach((autofilledNote) => {
                    handleUpdate(autofilledNote.id, autofilledNote);
                    NotesService.update({
                      deck_id: deckId,
                      id: autofilledNote.id,
                      payload: {
                        target_text: autofilledNote.target_text,
                      },
                    });
                  });
                }}
                autofillLogic={async (note) => {
                  const translated = await TranslationService.translate({
                    text: note.source_text || "",
                    source_language: "en",
                    target_language: "pa",
                  }).then((res) => res.text);
                  return {
                    ...note,
                    target_text: translated,
                  };
                }}
              />
            </th>
            <th colSpan={1} className="px-2 py-1 border border-default bg-surface-secondary">
              <AutofillColumnButton
                column="romanization"
                table={table}
                notes={notes}
                setNotes={(notes) => {
                  notes.forEach((autofilledNote) => {
                    handleUpdate(autofilledNote.id, autofilledNote);
                    NotesService.update({
                      deck_id: deckId,
                      id: autofilledNote.id,
                      payload: {
                        romanization: autofilledNote.romanization,
                      },
                    });
                  });
                }}
                autofillLogic={(note) => ({
                  ...note,
                  romanization: transliterate(
                    note.target_text || "",
                    "gurmukhi",
                    "iso"
                  ),
                })}
              />
            </th>
            <th colSpan={1} className="px-2 py-1 border border-default bg-surface-secondary">
              <AutofillColumnButton
                column="source_text"
                table={table}
                notes={notes}
                setNotes={(notes) => {
                  notes.forEach((autofilledNote) => {
                    handleUpdate(autofilledNote.id, autofilledNote);
                    NotesService.update({
                      deck_id: deckId,
                      id: autofilledNote.id,
                      payload: {
                        source_text: autofilledNote.source_text,
                      },
                    });
                  });
                }}
                autofillLogic={async (note) => {
                  const translated = await TranslationService.translate({
                    text: note.target_text || "",
                    source_language: "pa",
                    target_language: "en",
                  }).then((res) => res.text);
                  return {
                    ...note,
                    source_text: translated,
                  };
                }}
              />
            </th>
            <th colSpan={1} className="px-2 py-1 border border-default bg-surface-secondary">
              <AutofillColumnButton
                column="audio_url"
                table={table}
                notes={notes}
                setNotes={(notes) => {
                  notes.forEach((autofilledNote) => {
                    handleUpdate(autofilledNote.id, autofilledNote);
                    NotesService.update({
                      deck_id: deckId,
                      id: autofilledNote.id,
                      payload: {
                        audio: autofilledNote.audioFile,
                      },
                    });
                  });
                }}
                autofillLogic={async (note) => {
                  const updatedNote = await NotesService.tts({
                    deck_id: deckId,
                    id: note.id,
                  });
                  return {
                    ...note,
                    audio_url: updatedNote.audio_url,
                  };
                }}
              />
            </th>
            <th colSpan={1}></th>
            <th colSpan={1} className="px-2 py-1 border border-default bg-surface-secondary">
              <Button
                variant="error"
                size="sm"
                onClick={handleBulkDelete}
                disabled={table.getSelectedRowModel().rows.length === 0}
              >
                Delete
              </Button>
            </th>
          </tr>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-2 py-1 border border-default bg-surface-tertiary text-sm font-medium text-default">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={row.getIsSelected() ? "bg-blue-50 dark:bg-blue-950" : "hover:bg-gray-50 dark:hover:bg-gray-700"}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-2 py-1 border border-default">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-surface-secondary">
            <td className="px-2 py-1 border border-default">
              <textarea
                ref={(el) => {
                  newInputRefs.current[0] = el as any;
                }}
                className="border input-default px-2 py-1 rounded text-sm w-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none overflow-hidden"
                placeholder="Gurmukhi"
                value={newEntry.target_text}
                onChange={(e) => {
                  autoResizeTextarea(e.target);
                  setNewEntry({ ...newEntry, target_text: e.target.value });
                }}
                onKeyDown={(e) => handleKeyDown(e, 0)}
                rows={1}
              />
            </td>
            <td className="px-2 py-1 border border-default">
              <textarea
                ref={(el) => {
                  newInputRefs.current[1] = el as any;
                }}
                className="border input-default px-2 py-1 rounded text-sm w-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none overflow-hidden"
                placeholder="Transliteration"
                value={newEntry.romanization}
                onChange={(e) => {
                  autoResizeTextarea(e.target);
                  setNewEntry({ ...newEntry, romanization: e.target.value });
                }}
                onKeyDown={(e) => handleKeyDown(e, 1)}
                rows={1}
              />
            </td>
            <td className="px-2 py-1 border border-default">
              <textarea
                ref={(el) => {
                  newInputRefs.current[2] = el as any;
                }}
                className="border input-default px-2 py-1 rounded text-sm w-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none overflow-hidden"
                placeholder="English"
                value={newEntry.source_text}
                onChange={(e) => {
                  autoResizeTextarea(e.target);
                  setNewEntry({ ...newEntry, source_text: e.target.value });
                }}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                rows={1}
              />
            </td>
            <td className="px-2 py-1 border border-default">
              <AudioField
                audio={newEntry.audioFile}
                onFileUpload={(file) => {
                  setNewEntry({
                    ...newEntry,
                    audioFile: file,
                  });
                }}
                onTrim={async (start, end) => {
                  if (!newEntry.audioFile) return;
                  const res = await AudioService.trim({audio_file: newEntry.audioFile, start_ms: start.toString(), end_ms: end.toString()});
                  const trimmedBlob = await res.blob();
                  const trimmedFile = new File([trimmedBlob], "trimmed_audio.mp3", { type: "audio/mpeg" });

                  setNewEntry({
                    ...newEntry,
                    audioFile: trimmedFile,
                  })
                }}
                
                onDelete={() =>
                  setNewEntry({
                    ...newEntry,
                    audioFile: undefined,
                  })
                }
              />
            </td>
            <td className="px-2 py-1 border border-default">
              <ImageField
                imageUrl={
                  newEntry.image_url
                }
                onReplace={(file) => {
                  setNewEntry({
                    ...newEntry,
                    imageFile: file,
                    image_url: URL.createObjectURL(file),
                  });
                }}
                onDelete={() => {
                  if (newEntry.image_url) URL.revokeObjectURL(newEntry.image_url);
                  setNewEntry({
                    ...newEntry,
                    imageFile: undefined,
                    image_url: undefined,
                  })
                }}
              />
            </td>

            <td className="px-2 py-1 border border-gray-200 dark:border-gray-700 text-center" colSpan={2}>
              <Button
                variant="primary"
                size="sm"
                loading={isAddingRow}
                onClick={ async () => {
                  setIsAddingRow(true)
                  try {
                    if (newEntry.target_text || newEntry.source_text) await handleAddRow();
                    
                  } finally {
                    setIsAddingRow(false)
                  }
                }}
                disabled={!newEntry.target_text && !newEntry.source_text}
              >
                Add
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <div className="mt-2">
        <ExportModal notes={notes} />
      </div>
    </div>
  );
}
