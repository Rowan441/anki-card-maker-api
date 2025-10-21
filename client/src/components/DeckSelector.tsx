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
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-default">Deck:</label>
      <select
        className="border input-default px-2 py-1 rounded text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
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
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {selectedDeck.source_language} → {selectedDeck.target_language}
        </span>
      )}
    </div>
  );
}
