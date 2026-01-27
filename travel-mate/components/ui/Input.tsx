import React from "react";

/**
 * Input Component
 *
 * A styled input component with label, error states, and accessibility features.
 *
 * @props
 * - label: string - Input label text
 * - name: string - Input name attribute
 * - type?: string - Input type (text, email, password, etc.)
 * - placeholder?: string - Placeholder text
 * - value?: string - Controlled input value
 * - onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void - Change handler
 * - error?: string - Error message to display
 * - helperText?: string - Helper text below input
 * - required?: boolean - Mark as required
 * - disabled?: boolean - Disable the input
 * - icon?: React.ReactNode - Icon to display in input
 *
 * @accessibility
 * - Proper label association with htmlFor/id
 * - aria-invalid and aria-describedby for errors
 * - Clear focus states
 * - Error messages announced to screen readers
 *
 * @example
 * <Input
 *   label="Email"
 *   name="email"
 *   type="email"
 *   placeholder="you@example.com"
 *   error={errors.email}
 * />
 */

export interface InputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  icon,
  className = "",
}: InputProps) {
  const inputId = `input-${name}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const hasError = !!error;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400" aria-hidden="true">
              {icon}
            </span>
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
          className={`
            block w-full rounded-lg border
            px-4 py-2.5 text-sm
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${icon ? "pl-10" : ""}
            ${
              hasError
                ? "border-red-500 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
            }
          `}
        />
      </div>

      {/* Error Message */}
      {hasError && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !hasError && (
        <p id={helperId} className="text-sm text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
