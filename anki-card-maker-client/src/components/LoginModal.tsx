import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

interface LoginModalProps {
  isLoggedIn: boolean;
  onLogin: () => void;
}

export default function LoginModal({ isLoggedIn, onLogin }: LoginModalProps) {
  const [open, setOpen] = useState(false);

  // Open modal automatically if user is not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setOpen(true);
    }
  }, [isLoggedIn]);

  const handleGoogleLogin = () => {
    const popup = window.open(
      `${API_BASE}/auth/google_oauth2`,
      "googleAuth",
      "width=500,height=600,scrollbars=yes,resizable=yes"
    );

    // const checkClosed = setInterval(() => {
    //   if (popup?.closed) {
    //     clearInterval(checkClosed);
    //     console.log("Popup closed by user");
    //   }
    // }, 1000);

    // Listen for messages from popup
    window.addEventListener("message", (event) => {
      if (event.origin !== API_BASE) return;

      if (event.data.token) {
        popup?.close();
        // clearInterval(checkClosed);
        setOpen(false);
        onLogin();
      }
    });
  };

  const handleGuestLogin = () => {
    onLogin();
    setOpen(false);
    throw new Error("Not implemented"); //TODO implement guest login
  };

  return !open ? null : (
    <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Sign in to continue
        </h2>

        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition shadow-xl mb-4"
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

        <button
          onClick={handleGuestLogin}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-medium transition shadow-xl mb-4"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
