# React Hook Form + Zod Validation

This document explains the implementation of dynamic, schema-based form validation using **React Hook Form (RHF)** and **Zod** in the Travel Mate application.

## Table of Contents

1. [Overview](#overview)
2. [Dependencies](#dependencies)
3. [React Hook Form Setup](#react-hook-form-setup)
4. [Zod Schema & zodResolver Integration](#zod-schema--zodresolver-integration)
5. [Reusable Component Pattern](#reusable-component-pattern)
6. [Form Implementations](#form-implementations)
7. [Accessibility Features](#accessibility-features)
8. [Validation States](#validation-states)
9. [Reflection](#reflection)

---

## Overview

Our form system combines:
- **React Hook Form**: Performant form state management with minimal re-renders
- **Zod**: TypeScript-first schema validation with runtime type checking
- **@hookform/resolvers**: Bridges RHF with Zod for seamless integration

This approach provides:
- ✅ Type-safe forms with automatic TypeScript inference
- ✅ Declarative validation rules
- ✅ Reusable validation schemas
- ✅ Accessible error messaging
- ✅ Optimized performance with uncontrolled inputs

---

## Dependencies

```bash
npm install react-hook-form zod @hookform/resolvers
```

| Package | Purpose |
|---------|---------|
| `react-hook-form` | Form state management and validation orchestration |
| `zod` | Schema definition and runtime validation |
| `@hookform/resolvers` | Connects Zod schemas to React Hook Form |

---

## React Hook Form Setup

### Basic Hook Configuration

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas/signupSchema";

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting }
} = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: "",
    password: "",
  },
});
```

### Key Properties

| Property | Description |
|----------|-------------|
| `register` | Connects input to form state (spread onto input element) |
| `handleSubmit` | Wraps submit handler, validates before calling |
| `errors` | Object containing field-level validation errors |
| `isSubmitting` | Boolean indicating form submission in progress |
| `resolver` | Integrates external validation (Zod) |

---

## Zod Schema & zodResolver Integration

### Schema Definition (`schemas/signupSchema.ts`)

```typescript
import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Signup Schema with password confirmation
export const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "You must agree to the terms"),
});

// Type inference from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
```

### Using zodResolver

```tsx
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema), // Validates all fields on submit
});
```

The `zodResolver`:
1. Receives the Zod schema
2. Validates form data against the schema
3. Returns errors in RHF-compatible format
4. Enables type inference for form values

---

## Reusable Component Pattern

### FormInput Component (`components/FormInput.tsx`)

```tsx
import { FieldValues, Path, UseFormRegister, FieldErrors } from "react-hook-form";

interface FormInputProps<T extends FieldValues> {
  id: Path<T>;
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  autoComplete?: string;
}

export function FormInput<T extends FieldValues>({
  id,
  label,
  type = "text",
  placeholder,
  register,
  errors,
  autoComplete,
}: FormInputProps<T>) {
  const error = errors[id];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={`form-input ${error ? "form-input-error" : ""}`}
        placeholder={placeholder}
        {...register(id)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete={autoComplete}
      />
      {errorMessage && (
        <p
          id={`${id}-error`}
          role="alert"
          className="form-error"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
```

### Usage

```tsx
<FormInput
  id="email"
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  register={register}
  errors={errors}
  autoComplete="email"
/>
```

### Component Variants

| Component | Purpose |
|-----------|---------|
| `FormInput` | Standard text/email/password inputs |
| `FormTextarea` | Multi-line text areas |
| `FormSelect` | Dropdown select inputs |
| `SubmitButton` | Submit button with loading state |

---

## Form Implementations

### Login Form (`app/login/page.tsx`)

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas/signupSchema";

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      // Handle response...
    } catch (err) {
      setServerError("An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Form fields with register and errors */}
    </form>
  );
}
```

### Signup Form (`app/signup/page.tsx`)

Features password confirmation with cross-field validation:

```tsx
const signupSchemaWithConfirm = signupSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);
```

---

## Accessibility Features

### ARIA Attributes

| Attribute | Purpose |
|-----------|---------|
| `aria-invalid` | Indicates field has validation error |
| `aria-describedby` | Links input to error message |
| `role="alert"` | Announces error to screen readers |

### Implementation

```tsx
<input
  id="email"
  {...register("email")}
  aria-invalid={!!errors.email}                    // true when invalid
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <p id="email-error" role="alert">                 // Screen reader announces
    {errors.email.message}
  </p>
)}
```

### Labels

Every input has an associated `<label>` with matching `htmlFor`/`id`:

```tsx
<label htmlFor="email" className="form-label">
  Email Address
</label>
<input id="email" ... />
```

### Keyboard Navigation

- Standard tab order through form fields
- Enter key submits form
- Focus management on validation errors

---

## Validation States

### Error State (Empty Required Field)

When a user submits without filling required fields:

```
┌─────────────────────────────────────┐
│ Email Address                       │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │ ← Red border
│ └─────────────────────────────────┘ │
│ ⚠ Email is required                 │ ← Error message in red
└─────────────────────────────────────┘
```

### Error State (Invalid Format)

```
┌─────────────────────────────────────┐
│ Email Address                       │
│ ┌─────────────────────────────────┐ │
│ │ invalid-email                   │ │ ← Red border
│ └─────────────────────────────────┘ │
│ ⚠ Please enter a valid email        │ ← Format error
└─────────────────────────────────────┘
```

### Valid State (Successful Submission)

```
┌─────────────────────────────────────┐
│ Email Address                       │
│ ┌─────────────────────────────────┐ │
│ │ user@example.com                │ │ ← Normal border
│ └─────────────────────────────────┘ │
│                                     │ ← No error message
└─────────────────────────────────────┘
```

### Password Requirements Display

```
Password Requirements:
✓ At least 8 characters
✗ One uppercase letter (A-Z)
✓ One lowercase letter (a-z)
✓ One number (0-9)
```

---

## Reflection

### Benefits of This Approach

1. **Type Safety**: Zod schemas provide TypeScript types automatically via `z.infer<>`, ensuring form data matches expected types throughout the application.

2. **Declarative Validation**: Validation rules are defined once in schemas and reused across components, reducing duplication and inconsistencies.

3. **Performance**: React Hook Form uses uncontrolled inputs, minimizing re-renders compared to controlled form patterns.

4. **Accessibility**: Built-in ARIA attribute support ensures forms are usable by screen reader users and keyboard-only navigation.

5. **Developer Experience**: Clear error messages, TypeScript autocomplete, and centralized validation logic speed up development.

### Challenges Addressed

- **Cross-field validation**: The `.refine()` method handles password confirmation elegantly
- **Complex validation rules**: Regex patterns for password strength are declarative and readable
- **Error state management**: Separation of client validation errors (from Zod) and server errors (from API)

### Future Improvements

- Add `watch()` for real-time password strength indicator
- Implement `setError()` for server-side validation errors
- Create more specialized input components (phone, date, etc.)
- Add form-level success state animation

---

## File Structure

```
travel-mate/
├── schemas/
│   └── signupSchema.ts      # Zod validation schemas
├── components/
│   └── FormInput.tsx        # Reusable form components
└── app/
    ├── login/
    │   └── page.tsx         # Login form implementation
    └── signup/
        └── page.tsx         # Signup form implementation
```

---

## Resources

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [hookform/resolvers](https://github.com/react-hook-form/resolvers)
- [WCAG 2.1 Form Guidelines](https://www.w3.org/WAI/tutorials/forms/)
