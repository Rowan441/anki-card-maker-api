const API_BASE = import.meta.env.VITE_API_URL;

interface GoogleAuthOptions {
  onSuccess: (email: string) => void;
  onError?: (error: Error) => void;
  onPopupClosed?: () => void;
  isUpgrade?: boolean;
}

export function initiateGoogleAuth(options: GoogleAuthOptions): () => void {
  const { onSuccess, onError, onPopupClosed, isUpgrade = false } = options;

  let popup: Window | null = null;
  let checkPopup: NodeJS.Timeout | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  const cleanup = () => {
    if (checkPopup) clearInterval(checkPopup);
    if (timeoutId) clearTimeout(timeoutId);
    window.removeEventListener("message", handleMessage);
  };

  const handleMessage = (event: MessageEvent) => {
    const apiOrigin = new URL(API_BASE).origin;
    if (event.origin !== apiOrigin) return;

    if (event.data.token && event.data.success) {
      popup?.close();
      const email = event.data.email;

      // Clear anonymous user ID when logging in with Google
      localStorage.removeItem("anonymousUserId");

      cleanup();
      onSuccess(email);
    }
  };

  window.addEventListener("message", handleMessage);

  const currentOrigin = window.location.origin;
  const upgradeParam = isUpgrade ? '&upgrade=true' : '';
  popup = window.open(
    `${API_BASE}/auth/google_oauth2?origin=${encodeURIComponent(currentOrigin)}${upgradeParam}`,
    "googleAuth",
    "width=500,height=600,scrollbars=yes,resizable=yes"
  );

  if (!popup) {
    cleanup();
    onError?.(new Error("Failed to open popup window"));
    return cleanup;
  }

  // Set timeout for authentication (5 minutes)
  timeoutId = setTimeout(() => {
    cleanup();
    popup?.close();
    onError?.(new Error("Authentication timeout - please try again"));
  }, 300000);

  // Monitor popup for closure
  checkPopup = setInterval(() => {
    if (popup?.closed) {
      cleanup();
      onPopupClosed?.();
    }
  }, 1000);

  // Return cleanup function
  return cleanup;
}