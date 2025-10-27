import { useState, useEffect } from "react";
import "./App.css";
import LoginModal from "./components/LoginModal";
import WordListTable from "./components/WordListTable";
import DarkModeToggle from "./components/DarkModeToggle";
import DeckSelector from "./components/DeckSelector";
import DeckModal from "./components/DeckModal";
import { OnlineStatusProvider } from "./provider/OnlineStatusProvider";
import { DecksService } from "./services/AnkiApiServices";
import type { Deck } from "./models/Deck";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(true);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

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
        <div className="fixed top-4 right-4 z-50">
          <DarkModeToggle />
        </div>
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
          <LoginModal isLoggedIn={isLoggedIn} onLogin={handleLogin} />
          {selectedDeckId !== null && <WordListTable deckId={selectedDeckId} />}
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

export default App;
