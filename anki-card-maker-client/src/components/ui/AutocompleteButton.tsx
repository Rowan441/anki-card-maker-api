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
    setIsLoading(false);
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
      {`Autofill ${
        table.getSelectedRowModel().rows.length === 0
          ? "Empty Rows"
          : table.getSelectedRowModel().rows.length + " Row(s)"
      }`}
    </button>
  );
}
