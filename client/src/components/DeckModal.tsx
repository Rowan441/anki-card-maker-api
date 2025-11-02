import { useState, useEffect } from "react";
import Button from "./ui/Button";
import { DecksService } from "../services/AnkiApiServices";
import type { Deck, DeckCreatePayload } from "../models/Deck";
import { handleError, showSuccessToast } from "../utils/errorHandler";

import CreatableSelect from 'react-select/creatable';
import { languageOptions } from "../data/languages";


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

  const getSelectedOption = (value: string) =>
    languageOptions.find(opt => opt.value === value) || { value, label: value };

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
      showSuccessToast(`Deck "${newDeck.name}" created successfully!`);
      onClose();
    } catch (err) {
      // Use new error handling for API errors (shows toast)
      handleError(err, "DeckCreation", {
        toastMessage: "Failed to create deck. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg shadow-lg p-4 w-full max-w-md border border-default">
        <h2 className="text-2xl font-semibold text-default mb-3">
          Create New Deck
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-lg font-medium text-default mb-1">
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
            <label className="block text-lg font-medium text-default mb-1">
              Source Language (Your language)
            </label>
            <CreatableSelect
              options={languageOptions}
              value={getSelectedOption(sourceLanguage)}
              onChange={(option) => setSourceLanguage(option?.value || "")}
              formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-default mb-1">
              Target Language (Learning)
            </label>
            <CreatableSelect
              options={languageOptions}
              value={getSelectedOption(targetLanguage)}
              onChange={(option) => setTargetLanguage(option?.value || "")}
              formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
            />
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
              size="md"
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
