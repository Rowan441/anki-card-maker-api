import { useState, useRef, useEffect } from "react";

interface DropdownMenuProps {
  label: string;
  options: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }[];
}

export default function DropdownMenu({ label, options }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
          aria-expanded={open}
          aria-haspopup="true"
        >
          {label}
          <svg
            className="-mr-1 size-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div
          className="absolute z-10 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none transition ease-out duration-100"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1">
            {options.map((opt, idx) =>
              opt.disabled ? (
                <span
                  key={idx}
                  className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                  role="menuitem"
                >
                  {opt.label}
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => {
                    opt.onClick();
                    setOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  {opt.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
