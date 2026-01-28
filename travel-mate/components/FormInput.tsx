"use client";

import { UseFormRegister, FieldValues, Path } from "react-hook-form";

/**
 * FormInput - Reusable form input component with error handling
 *
 * Features:
 * - Accessible labels connected via htmlFor
 * - ARIA attributes for screen readers
 * - Error state styling
 * - Type-safe with React Hook Form integration
 */

interface FormInputProps<T extends FieldValues> {
  /** Field label text */
  label: string;
  /** Field name (must match schema property) */
  name: Path<T>;
  /** Input type (text, email, password, etc.) */
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  /** React Hook Form register function */
  register: UseFormRegister<T>;
  /** Error message to display */
  error?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
}

export default function FormInput<T extends FieldValues>({
  label,
  name,
  type = "text",
  register,
  error,
  placeholder,
  disabled = false,
  className = "",
  autoComplete,
}: FormInputProps<T>) {
  const inputId = `input-${String(name)}`;
  const errorId = `error-${String(name)}`;

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...register(name)}
        className={`
          w-full px-3 py-2 border rounded-md transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300"
          }
        `}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 text-sm text-red-600 flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * FormTextarea - Reusable textarea component with error handling
 */
interface FormTextareaProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export function FormTextarea<T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder,
  disabled = false,
  className = "",
  rows = 4,
}: FormTextareaProps<T>) {
  const inputId = `textarea-${String(name)}`;
  const errorId = `error-${String(name)}`;

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <textarea
        id={inputId}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...register(name)}
        className={`
          w-full px-3 py-2 border rounded-md transition-colors resize-vertical
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300"
          }
        `}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 text-sm text-red-600 flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * FormSelect - Reusable select component with error handling
 */
interface FormSelectProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: string;
  disabled?: boolean;
  className?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function FormSelect<T extends FieldValues>({
  label,
  name,
  register,
  error,
  disabled = false,
  className = "",
  options,
  placeholder = "Select an option",
}: FormSelectProps<T>) {
  const inputId = `select-${String(name)}`;
  const errorId = `error-${String(name)}`;

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <select
        id={inputId}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...register(name)}
        className={`
          w-full px-3 py-2 border rounded-md transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300"
          }
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 text-sm text-red-600 flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * SubmitButton - Reusable submit button with loading state
 */
interface SubmitButtonProps {
  children: React.ReactNode;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
}

export function SubmitButton({
  children,
  isSubmitting = false,
  disabled = false,
  className = "",
  loadingText = "Submitting...",
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      className={`
        w-full py-2 px-4 rounded-md font-medium text-white
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          isSubmitting || disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        }
        ${className}
      `}
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
