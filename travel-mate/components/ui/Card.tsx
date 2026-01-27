import React from "react";

/**
 * Card Component
 *
 * A flexible card container component for displaying grouped content.
 *
 * @props
 * - children: React.ReactNode - Card content
 * - title?: string - Optional card title
 * - subtitle?: string - Optional subtitle text
 * - headerAction?: React.ReactNode - Action element in header (e.g., button)
 * - footer?: React.ReactNode - Optional footer content
 * - variant?: "default" | "elevated" | "outlined" - Card style variant
 * - padding?: "none" | "sm" | "md" | "lg" - Content padding
 * - hover?: boolean - Enable hover effect
 * - onClick?: () => void - Make card clickable
 *
 * @accessibility
 * - Uses semantic article element when appropriate
 * - Proper heading hierarchy with title
 * - Focus states for clickable cards
 * - Color contrast meets WCAG AA standards
 *
 * @example
 * <Card title="User Stats" subtitle="Last 7 days">
 *   <p>Content goes here</p>
 * </Card>
 */

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-white border border-slate-200",
  elevated: "bg-white shadow-lg shadow-slate-200/50",
  outlined: "bg-transparent border-2 border-slate-300",
};

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export default function Card({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  variant = "default",
  padding = "md",
  hover = false,
  onClick,
  className = "",
}: CardProps) {
  const isClickable = !!onClick;
  const Component = isClickable ? "button" : "article";

  return (
    <Component
      onClick={onClick}
      className={`
        rounded-xl overflow-hidden
        transition-all duration-200
        ${variantStyles[variant]}
        ${hover ? "hover:shadow-md hover:border-slate-300" : ""}
        ${isClickable ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-left w-full" : ""}
        ${className}
      `}
      {...(isClickable && { type: "button" as const })}
    >
      {/* Card Header */}
      {(title || subtitle || headerAction) && (
        <div
          className={`
            flex items-start justify-between gap-4
            ${padding !== "none" ? paddingStyles[padding] : "px-4 py-3"}
            border-b border-slate-100
          `}
        >
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold text-slate-900 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Card Body */}
      <div className={paddingStyles[padding]}>{children}</div>

      {/* Card Footer */}
      {footer && (
        <div
          className={`
            ${padding !== "none" ? paddingStyles[padding] : "px-4 py-3"}
            border-t border-slate-100 bg-slate-50
          `}
        >
          {footer}
        </div>
      )}
    </Component>
  );
}
