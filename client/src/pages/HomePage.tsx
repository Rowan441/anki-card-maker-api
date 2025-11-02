import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import DeckSelector from "../components/DeckSelector";
import DeckModal from "../components/DeckModal";
import WordListTable from "../components/WordListTable";
import { OnlineStatusProvider } from "../provider/OnlineStatusProvider";
import { DecksService } from "../services/AnkiApiServices";
import type { Deck } from "../models/Deck";

export default function HomePage() {
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);

  // Load selected deck ID from localStorage and fetch decks
  useEffect(() => {
    async function initializeDecks() {
      setLoadingDecks(true);
      try {
        const fetchedDecks = await DecksService.index();
        setDecks(fetchedDecks);

        // Try to restore selected deck from localStorage
        const savedDeckId = localStorage.getItem("selectedDeckId");
        if (savedDeckId && fetchedDecks.some((d) => d.id === Number(savedDeckId))) {
          setSelectedDeckId(Number(savedDeckId));
        } else if (fetchedDecks.length > 0) {
          // Select first deck by default
          setSelectedDeckId(fetchedDecks[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch decks:", err);
      } finally {
        setLoadingDecks(false);
      }
    }
    initializeDecks();
  }, []);

  // Save selected deck ID to localStorage
  useEffect(() => {
    if (selectedDeckId !== null) {
      localStorage.setItem("selectedDeckId", selectedDeckId.toString());
    }
  }, [selectedDeckId]);

  const handleDeckCreated = (newDeck: Deck) => {
    setDecks((prev) => [...prev, newDeck]);
    setSelectedDeckId(newDeck.id);
  };

  return (
    <OnlineStatusProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar />
        <div className="p-4">
          <div className="mb-3">
            <DeckSelector
              decks={decks}
              selectedDeckId={selectedDeckId}
              onDeckChange={setSelectedDeckId}
              onCreateDeck={() => setIsDeckModalOpen(true)}
              loading={loadingDecks}
            />
          </div>
          {selectedDeckId !== null && (
            <WordListTable
              deck={decks.find(d => d.id === selectedDeckId)!}
            />
          )}
        </div>
        <DeckModal
          isOpen={isDeckModalOpen}
          onClose={() => setIsDeckModalOpen(false)}
          onDeckCreated={handleDeckCreated}
        />
      </div>
    </OnlineStatusProvider>
  );
}
