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
import type { Note, NoteResponseApi, NoteUploadApi } from "../models/Note";
import AudioField from "./table/AudioField";

import DropdownMenu from "./ui/DropdownMenu";
import Button from "./ui/Button";
import { transliterate } from "../utils/transliterate";
import { translateText } from "../utils/AmazonTranslate";
import AutofillColumnButton from "./ui/AutocompleteButton";
import {
  AudioService,
  NotesService,
  TranslationService,
} from "../services/AnkiApiServices";
import { useOnlineStatus } from "../provider/OnlineStatusProvider";

const API_BASE = import.meta.env.VITE_API_URL;
const DECK_ID = 3;

export default function WordListTable() {
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
        const fetchedNotes = await NotesService.index({ deck_id: 3 });
        setNotes(fetchedNotes);
      } catch (err) {
        // handle error if needed
      } finally {
        setLoadingTableRows(false);
      }
    }
    fetchNotes();
  }, []);

  const [newEntry, setNewEntry] = useState<Partial<Note>>({
    target_text: "",
    romanization: "",
    source_text: "",
  });
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
  const newInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      NotesService.delete({ deck_id: DECK_ID, id }).catch((err) => {
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
    const newNote = await NotesService.create({ deck_id: 3, payload: uploadNote }).catch((err) => {
      console.error("Failed to create note:", err);
      return;
    });
    if (newNote) {
      setNotes((prev) => [...prev, newNote]);
      setNewEntry({ target_text: "", romanization: "", source_text: "" });
    }

  };

  const autoCompleteNote = async (note: Note) => {
    if (!note.source_text) {
      note.source_text = await TranslationService.translate({
        text: note.target_text,
        source_language: "pa",
        target_language: "en",
      }).then((res) => res.text);
    }
    if (!note.target_text) {
      if (note.source_text) {
        note.target_text = await TranslationService.translate({
          text: note.source_text,
          source_language: "en",
          target_language: "pa",
        }).then((res) => res.text);
      }
    }
    if (!note.romanization) {
      note.romanization = transliterate(note.target_text, "gurmukhi", "iso");
    }
    return note;
  };

  const handleKeyDown = (
    keyEvent: KeyboardEvent,
    colIndex: number,
    rowIndex?: number
  ) => {
    if (keyEvent.key !== "Enter") return;
    if (!rowIndex && rowIndex !== 0) {
      // If rowIndex is not provided, it means we are in the new entry row
      handleAddRow();
      newInputRefs.current[colIndex]?.focus();
      return;
    }
    const next = inputRefs.current[rowIndex + 1]?.[colIndex];
    if (next) {
      next.focus();
    } else {
      newInputRefs.current[colIndex]?.focus();
    }
  };

  const columns: ColumnDef<Note>[] = useMemo(
    () => [
      {
        header: "Gurmukhi",
        accessorKey: "target_text",
        cell: ({ row, getValue }) => (
          <input
            ref={(el) => {
              if (!inputRefs.current[row.index])
                inputRefs.current[row.index] = [];
              inputRefs.current[row.index][0] = el;
            }}
            className="border p-1 rounded w-full"
            value={getValue() as string}
            onKeyDown={(e) => handleKeyDown(e, 0, row.index)}
            onChange={(e) =>
              handleUpdate(row.original.id, { target_text: e.target.value })
            }
            onBlur={(e) => {
              handleUpdate(row.original.id, { target_text: e.target.value });
              NotesService.update({
                deck_id: DECK_ID,
                id: row.original.id,
                payload: { target_text: e.target.value },
              });
            }}
          />
        ),
      },
      {
        header: "Transliteration",
        accessorKey: "romanization",
        cell: ({ row, getValue }) => (
          <input
            ref={(el) => {
              if (!inputRefs.current[row.index])
                inputRefs.current[row.index] = [];
              inputRefs.current[row.index][1] = el;
            }}
            className="border p-1 rounded w-full"
            value={getValue() as string}
            onKeyDown={(e) => handleKeyDown(e, 1, row.index)}
            onChange={(e) =>
              handleUpdate(row.original.id, { romanization: e.target.value })
            }
            onBlur={(e) => {
              handleUpdate(row.original.id, { target_text: e.target.value });
              NotesService.update({
                deck_id: DECK_ID,
                id: row.original.id,
                payload: { romanization: e.target.value },
              });
            }}
          />
        ),
      },
      {
        header: "English",
        accessorKey: "source_text",
        cell: ({ row, getValue }) => (
          <input
            ref={(el) => {
              if (!inputRefs.current[row.index])
                inputRefs.current[row.index] = [];
              inputRefs.current[row.index][2] = el;
            }}
            className="border p-1 rounded w-full"
            value={getValue() as string}
            onKeyDown={(e) => handleKeyDown(e, 2, row.index)}
            onChange={(e) =>
              handleUpdate(row.original.id, { source_text: e.target.value })
            }
            onBlur={(e) => {
              handleUpdate(row.original.id, { target_text: e.target.value });
              NotesService.update({
                deck_id: DECK_ID,
                id: row.original.id,
                payload: { romanization: e.target.value },
              });
            }}
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
                deck_id: DECK_ID,
                id: row.original.id,
                payload: { audio: file },
              });
              handleUpdate(row.original.id, {
                audio_url: updatedNote.audio_url,
              });
            }}
            onTrim={async (start, end) => {
              const updatedNote = await NotesService.trim({
                deck_id: 3,
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
                deck_id: DECK_ID,
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
                deck_id: DECK_ID,
                id: row.original.id,
                payload: { image: file },
              });
              handleUpdate(row.original.id, {
                image_url: updatedNote.image_url,
              });
            }}
            onDelete={async () => {
              await NotesService.update({
                deck_id: DECK_ID,
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
          <>
            <input
              type="checkbox"
              className="h-4 w-4 m-2"
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
          </>
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="h-6 w-6"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
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
    <div className="bg-white p-4 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Word List Table</h1>
      {isOnline ? (
        "online :)"
      ) : (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
          You are currently offline. Some features may be unavailable.
        </div>
      )}
      <table className="table-auto w-full border bg-gray-300">
        <thead>
          <tr>
            <th colSpan={1} className="p-2 border bg-gray-50">
              <AutofillColumnButton
                column="target_text"
                table={table}
                notes={notes}
                setNotes={(notes) => {
                  notes.forEach((autofilledNote) => {
                    handleUpdate(autofilledNote.id, autofilledNote);
                    NotesService.update({
                      deck_id: DECK_ID,
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
            <th colSpan={1} className="p-2 border bg-gray-50">
              <AutofillColumnButton
                column="romanization"
                table={table}
                notes={notes}
                setNotes={(notes) => {
                  notes.forEach((autofilledNote) => {
                    handleUpdate(autofilledNote.id, autofilledNote);
                    NotesService.update({
                      deck_id: DECK_ID,
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
            <th colSpan={1} className="p-2 border bg-gray-50">
              <AutofillColumnButton
                column="source_text"
                table={table}
                notes={notes}
                setNotes={(notes) => {
                  notes.forEach((autofilledNote) => {
                    handleUpdate(autofilledNote.id, autofilledNote);
                    NotesService.update({
                      deck_id: DECK_ID,
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
            <th colSpan={1} className="p-2 border bg-gray-50">
              <AutofillColumnButton
                column="audio"
                table={table}
                notes={notes}
                setNotes={(notes) => {
                  notes.forEach((autofilledNote) => {
                    handleUpdate(autofilledNote.id, autofilledNote);
                    NotesService.update({
                      deck_id: DECK_ID,
                      id: autofilledNote.id,
                      payload: {
                        audio: autofilledNote.audioFile,
                      },
                    });
                  });
                }}
                autofillLogic={async (note) => {
                  const updatedNote = await NotesService.tts({
                    deck_id: DECK_ID,
                    id: note.id,
                  });
                  return {
                    ...note,
                    audio_url: updatedNote.audio_url,
                  };
                }}
              />
            </th>
            <th colSpan={columns.length - 3}></th>
            <th colSpan={1} className="p-2 border bg-gray-50">
              <Button
                variant="error"
                size="md"
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
                <th key={header.id} className="border bg-gray-100">
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
              className={row.getIsSelected() ? "bg-blue-50" : ""}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-2 my-2 border">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-gray-100">
            <td className="p-2 border">
              <input
                ref={(el) => {
                  newInputRefs.current[0] = el;
                }}
                className="border p-1 rounded w-full"
                placeholder="Gurmukhi"
                value={newEntry.target_text}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, target_text: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, 0)}
              />
            </td>
            <td className="p-2 border">
              <input
                ref={(el) => {
                  newInputRefs.current[1] = el;
                }}
                className="border p-1 rounded w-full"
                placeholder="Transliteration"
                value={newEntry.romanization}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, romanization: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, 1)}
              />
            </td>
            <td className="p-2 border">
              <input
                ref={(el) => {
                  newInputRefs.current[2] = el;
                }}
                className="border p-1 rounded w-full"
                placeholder="English"
                value={newEntry.source_text}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, source_text: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, 2)}
              />
            </td>
            <td className="p-2 border">
              <AudioField
                audio={newEntry.audioFile}
                onFileUpload={(file) => {
                  setNewEntry({
                    ...newEntry,
                    audioFile: file,
                  });
                }}
                onTrim={async (start, end) => {
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
            <td className="p-2 border">
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

            <td className="p-2 border text-center" colSpan={2}>
              <Button
                variant="primary"
                size="md"
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

      <div className="mt-4">
        <ExportModal notes={notes} />
      </div>
    </div>
  );
}
