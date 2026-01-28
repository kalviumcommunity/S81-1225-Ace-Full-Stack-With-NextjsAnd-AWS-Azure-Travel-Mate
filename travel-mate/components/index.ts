/**
 * Components Barrel Export
 *
 * Centralized exports for all reusable components.
 * This simplifies imports throughout the application.
 *
 * @example
 * import { Header, Sidebar, Button, Card } from "@/components";
 */

// Layout Components
export { default as Header } from "./layout/Header";
export { default as Sidebar } from "./layout/Sidebar";
export { default as LayoutWrapper } from "./layout/LayoutWrapper";

// UI Components
export { default as Button } from "./ui/Button";
export type { ButtonProps } from "./ui/Button";

export { default as Card } from "./ui/Card";
export type { CardProps } from "./ui/Card";

export { default as Input } from "./ui/Input";
export type { InputProps } from "./ui/Input";

export { default as ThemeToggle, ThemeToggleSwitch } from "./ui/ThemeToggle";

// Existing Components
export { default as Navbar } from "./Navbar";
export { default as Footer } from "./Footer";
export { default as PlaceCard } from "./PlaceCard";
export { default as FileUpload } from "./FileUpload";
export { default as ProfileUpload } from "./ProfileUpload";
