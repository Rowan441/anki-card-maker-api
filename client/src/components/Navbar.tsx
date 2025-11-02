import { useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { handleError } from "../utils/errorHandler";
import { initiateGoogleAuth } from "../utils/googleAuth";

export default function Navbar() {
  const { user, logout, refreshAuth } = useAuth();
  const navigate = useNavigate();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleUpgradeAccount = () => {
    setIsUpgrading(true);

    // Open Google OAuth popup with upgrade flag
    // The backend will detect upgrade=true param and merge the anonymous account
    initiateGoogleAuth({
      isUpgrade: true,
      onSuccess: async () => {
        // Refresh auth state from the server
        await refreshAuth();
        setIsUpgrading(false);
      },
      onError: (error) => {
        handleError(error, "Navbar - Upgrade Account", {
          toastMessage: "Failed to upgrade account. Please try again.",
        });
        setIsUpgrading(false);
      },
      onPopupClosed: () => {
        setIsUpgrading(false);
      },
    });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Anki Card Maker
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user.type === "google" && user.email ? user.email : "Anonymous User"}
                </span>
                {user.type === "anonymous" ? (
                  <button
                    onClick={handleUpgradeAccount}
                    disabled={isUpgrading}
                    aria-label={isUpgrading ? "Upgrading account in progress" : "Upgrade to a Google account to save your data"}
                    aria-busy={isUpgrading}
                    className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpgrading ? "Upgrading..." : "Upgrade Account"}
                  </button>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
