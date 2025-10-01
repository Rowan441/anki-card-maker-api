import React from "react";
import type { Note } from "../../models/Note";
import type { Table } from "@tanstack/react-table";

interface AutofillColumnButtonProps {
  column: string;
  table: Table<Note>;
  notes: Note[];
  setNotes: (Notes: Note[]) => void;
  autofillLogic: (note: Note) => Promise<Note> | Note;
}

export default function AutofillColumnButton({
  column,
  table,
  notes,
  setNotes,
  autofillLogic,
}: AutofillColumnButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
    const operatingIds = (
      table.getSelectedRowModel().rows.length !== 0
        ? table.getSelectedRowModel().rows
        : table
            .getRowModel()
            .rows.filter((row: any) => !Boolean(row.getValue(column)))
    ).map((r) => r.original.id);

    const updatedNotes = await Promise.all(
      notes
        .filter((note) => operatingIds.includes(note.id))
        .map(async (note) => {
          return await autofillLogic(note);
        })
    );
    
    setNotes(updatedNotes);
    } finally { 
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleClick}
      className={`inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2
        text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50
        transition-colors duration-150
        ${isLoading ? "cursor-progress opacity-50" : ""}`}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 absolute inset-0 m-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {`Autofill ${
        table.getSelectedRowModel().rows.length === 0
          ? "Empty Rows"
          : table.getSelectedRowModel().rows.length + " Row(s)"
      }`}
    </button>
  );
}
