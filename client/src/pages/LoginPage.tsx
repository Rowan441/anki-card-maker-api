import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DarkModeToggle from "../components/DarkModeToggle";
import { handleError } from "../utils/errorHandler";
import { initiateGoogleAuth } from "../utils/googleAuth";

const API_BASE = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    initiateGoogleAuth({
      onSuccess: (email) => {
        login("google", email);
        navigate("/");
      },
      onError: (error) => {
        handleError(error, "LoginPage - Google Login", {
          toastMessage: "Failed to open login popup. Please try again.",
        });
      },
    });
  };

  const handleAnonymousLogin = async () => {
    try {
      // Check if we have a stored anonymous user ID
      const storedUserId = localStorage.getItem("anonymousUserId");

      // Call anonymous login endpoint
      const response = await fetch(`${API_BASE}/auth/anonymous`, {
        method: "POST",
        credentials: "include", // Important: receive and store cookies
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: storedUserId // Send existing uid if we have one
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store the uid for future logins
        if (data.uid) {
          localStorage.setItem("anonymousUserId", data.uid.toString());
        }
        login("anonymous");
        navigate("/");
      } else {
        handleError(response.statusText, "LoginPage - Anonymous Login", {
          toastMessage: "Failed to log in anonymously. Please try again."
        });
      }
    } catch (error) {
      handleError(error, "LoginPage - Anonymous Login", {
        toastMessage: "Failed to log in anonymously. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md p-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6 relative">
          {/* Dark Mode Toggle */}
          <div className="absolute top-4 right-4">
            <DarkModeToggle />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to Anki Flashcard Maker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to create flashcards
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg
                className="w-8 h-8 border-white bg-white rounded border-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.94 0 7.16 1.62 9.37 3.74l6.9-6.9C36.46 2.36 30.72 0 24 0 14.64 0 6.64 5.42 2.64 13.36l8.07 6.26C12.65 13.46 17.89 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.5 24.5c0-1.5-.15-2.95-.43-4.35H24v8.24h12.65c-.55 2.94-2.2 5.43-4.7 7.1l7.4 5.74C43.78 37.04 46.5 31.22 46.5 24.5z"
                />
                <path
                  fill="#4A90E2"
                  d="M9.71 28.62c-1.04-2.94-1.04-6.12 0-9.06l-8.07-6.26c-3.54 6.85-3.54 14.73 0 21.58l8.07-6.26z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 48c6.48 0 11.91-2.13 15.87-5.77l-7.4-5.74c-2.07 1.39-4.73 2.21-8.47 2.21-6.11 0-11.35-3.96-13.29-9.46l-8.07 6.26C6.64 42.58 14.64 48 24 48z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  or
                </span>
              </div>
            </div>

            <button
              onClick={handleAnonymousLogin}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Continue Anonymously
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
