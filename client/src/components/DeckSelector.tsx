import type { Deck } from "../models/Deck";

interface DeckSelectorProps {
  decks: Deck[];
  selectedDeckId: number | null;
  onDeckChange: (deckId: number) => void;
  onCreateDeck: () => void;
  loading?: boolean;
}

export default function DeckSelector({
  decks,
  selectedDeckId,
  onDeckChange,
  onCreateDeck,
  loading = false,
}: DeckSelectorProps) {
  const selectedDeck = decks.find((d) => d.id === selectedDeckId);

  return (
    <div className="w-full mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
      <label className="block text-lg font-semibold text-default mb-3">
        Select Deck:
      </label>
      <select
        className="w-full border-2 input-default px-4 py-3 rounded-lg text-lg font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900"
        value={selectedDeckId ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "create") {
            onCreateDeck();
          } else {
            onDeckChange(Number(value));
          }
        }}
        disabled={loading}
      >
        {loading && <option value="">Loading...</option>}
        {!loading && decks.length === 0 && (
          <option value="">No decks available</option>
        )}
        {decks.map((deck) => (
          <option key={deck.id} value={deck.id}>
            {deck.name} ({deck.source_language} → {deck.target_language})
          </option>
        ))}
        <option value="create">+ Create New Deck</option>
      </select>
      {selectedDeck && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
          {selectedDeck.source_language} → {selectedDeck.target_language}
        </div>
      )}
    </div>
  );
}
