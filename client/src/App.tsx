import { useState } from "react";
import "./App.css";
import LoginModal from "./components/LoginModal";
import WordFrequencyAnalyzer from "./components/WordFrequencyAnalyzer";
import WordListTable from "./components/WordListTable";
import DarkModeToggle from "./components/DarkModeToggle";
import { OnlineStatusProvider } from "./provider/OnlineStatusProvider";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <OnlineStatusProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="fixed top-4 right-4 z-50">
          <DarkModeToggle />
        </div>
        <LoginModal isLoggedIn={isLoggedIn} onLogin={handleLogin} />
        {/* <WordFrequencyAnalyzer /> */}
        <WordListTable />
      </div>
    </OnlineStatusProvider>
  );
}

export default App;
