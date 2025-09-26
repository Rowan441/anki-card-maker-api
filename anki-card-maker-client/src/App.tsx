import { useState } from "react";
import "./App.css";
import LoginModal from "./components/LoginModal";
import WordFrequencyAnalyzer from "./components/WordFrequencyAnalyzer";
import WordListTable from "./components/WordListTable";
import { OnlineStatusProvider } from "./provider/OnlineStatusProvider";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <OnlineStatusProvider>
      <>
        <LoginModal isLoggedIn={isLoggedIn} onLogin={handleLogin} />
        {/* <WordFrequencyAnalyzer /> */}
        <WordListTable />
      </>
    </OnlineStatusProvider>
  );  
}

export default App;
