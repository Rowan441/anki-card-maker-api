import { useState, useEffect } from "react";
import Button from "./ui/Button";
import { DecksService } from "../services/AnkiApiServices";
import type { Deck, DeckCreatePayload } from "../models/Deck";

interface DeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (deck: Deck) => void;
}

export default function DeckModal({
  isOpen,
  onClose,
  onDeckCreated,
}: DeckModalProps) {
  const [name, setName] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("pa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setName("");
      setSourceLanguage("en");
      setTargetLanguage("pa");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Deck name is required");
      return;
    }

    setLoading(true);
    try {
      const payload: DeckCreatePayload = {
        name: name.trim(),
        source_language: sourceLanguage,
        target_language: targetLanguage,
      };
      const newDeck = await DecksService.create(payload);
      onDeckCreated(newDeck);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deck");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg shadow-lg p-4 w-full max-w-md border border-default">
        <h2 className="text-lg font-semibold text-default mb-3">
          Create New Deck
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-default mb-1">
              Deck Name
            </label>
            <input
              type="text"
              className="border input-default px-2 py-1 rounded text-sm w-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Punjabi Vocabulary"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-default mb-1">
              Source Language (Your language)
            </label>
            <select
              className="border input-default px-2 py-1 rounded text-sm w-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="pa">Punjabi</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-default mb-1">
              Target Language (Learning)
            </label>
            <select
              className="border input-default px-2 py-1 rounded text-sm w-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              <option value="pa">Punjabi</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-xs px-2 py-1 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              disabled={loading}
            >
              Create Deck
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
