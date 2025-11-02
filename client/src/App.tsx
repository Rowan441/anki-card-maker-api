import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            // Base toast styles
            className: 'bg-white dark:!bg-gray-600 text-gray-900 dark:!text-white',
            duration: 4000,
            style: {
              padding: '16px',
              borderRadius: '8px',
            },
            // Success styles
            success: {
              className: 'bg-green-50 dark:!bg-gray-600 text-green-900 dark:!text-white',
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            // Error styles
            error: {
              className: 'bg-red-50 dark:!bg-gray-600 text-red-900 dark:!text-white',
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            // Loading styles
            loading: {
              className: 'bg-blue-50 dark:!bg-gray-600 text-blue-900 dark:!text-white',
              iconTheme: {
                primary: '#3b82f6',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
