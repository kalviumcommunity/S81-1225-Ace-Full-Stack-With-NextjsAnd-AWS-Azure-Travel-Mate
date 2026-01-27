import React from "react";

/**
 * Button Component
 *
 * A versatile, accessible button component with multiple variants and sizes.
 *
 * @props
 * - label: string - The button text (required)
 * - onClick?: () => void - Click handler
 * - variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" - Visual style
 * - size?: "sm" | "md" | "lg" - Button size
 * - disabled?: boolean - Disable the button
 * - loading?: boolean - Show loading spinner
 * - icon?: React.ReactNode - Optional icon to display
 * - fullWidth?: boolean - Make button full width
 * - type?: "button" | "submit" | "reset" - Button type for forms
 *
 * @accessibility
 * - Proper focus states with visible ring
 * - Disabled state prevents interaction
 * - Loading state announces to screen readers
 * - Color contrast meets WCAG AA standards
 *
 * @example
 * <Button label="Submit" variant="primary" onClick={handleSubmit} />
 * <Button label="Cancel" variant="secondary" />
 * <Button label="Delete" variant="danger" icon={<TrashIcon />} />
 */

export interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm",
  secondary:
    "bg-slate-200 text-slate-700 hover:bg-slate-300 active:bg-slate-400 focus:ring-slate-500",
  outline:
    "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 focus:ring-blue-500",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  label,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <>
          <span
            className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"
            aria-hidden="true"
          />
          <span className="sr-only">Loading...</span>
          <span>{label}</span>
        </>
      ) : (
        <>
          {icon && <span aria-hidden="true">{icon}</span>}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
