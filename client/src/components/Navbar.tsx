import { useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // todo: allow upgrade from anonymous to google account

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
                {/* Only show logout button for Google users, not anonymous */}
                {user.type === "google" && (
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
