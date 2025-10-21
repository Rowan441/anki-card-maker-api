import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "error" | "warning" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
  secondary: "bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700",
  error: "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
  warning: "bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-gray-900 dark:text-white",
  success: "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-xs px-2 py-1",
  md: "px-3 py-1",
  lg: "px-5 py-2",
};

export default function Button({
  variant,
  size = "sm",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "text-white rounded transition-colors duration-200 ease-in-out relative";
  const disabledStyles = "disabled:cursor-not-allowed disabled:opacity-60";
  const loadingStyles = loading ? "cursor-wait opacity-75" : "";

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${loadingStyles} ${className}`.trim();

  return (
    <button className={combinedClassName} disabled={disabled} {...props}>
      {loading && (
        <svg
          className="animate-spin h-4 w-4 absolute inset-0 m-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      <span className={loading ? "invisible" : ""}>{children}</span>
    </button>
  );
}
