import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
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
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
