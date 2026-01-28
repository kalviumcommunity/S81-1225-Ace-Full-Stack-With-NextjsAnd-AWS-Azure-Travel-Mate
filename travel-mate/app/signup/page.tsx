"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Signup Form Validation Schema with Zod
 *
 * Defines validation rules:
 * - Name: minimum 3 characters
 * - Email: valid email format
 * - Password: minimum 8 characters with complexity requirements
 * - Confirm Password: must match password
 */
const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(3, "Name must be at least 3 characters long")
      .max(50, "Name must be at most 50 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({
        message: "You must agree to the terms and conditions",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  // React Hook Form setup with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false as unknown as true,
    },
  });

  const onSubmit = async (formData: SignupFormData) => {
    setServerError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors with detailed messages
        if (data.error?.details && Array.isArray(data.error.details)) {
          const errorMessages = data.error.details
            .map(
              (err: { field: string; message: string }) =>
                `${err.field}: ${err.message}`
            )
            .join("; ");
          throw new Error(errorMessages || data.message || "Signup failed");
        }
        throw new Error(data.message || "Signup failed");
      }

      // Redirect to login with success message
      router.push("/login?registered=true");
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className="auth-logo">🌍</div>
            <h1 className="auth-title">Create Account</h1>
          </Link>
          <p className="auth-subtitle">Join Travel Mate and start exploring</p>
        </div>

        {serverError && (
          <div
            style={{
              padding: "0.75rem 1rem",
              background: "rgb(239 68 68 / 0.1)",
              border: "1px solid rgb(239 68 68 / 0.2)",
              borderRadius: "var(--radius)",
              color: "var(--error)",
              fontSize: "0.875rem",
              marginBottom: "1.5rem",
            }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className={`form-input ${errors.name ? "form-input-error" : ""}`}
              placeholder="John Traveler"
              {...register("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              autoComplete="name"
            />
            {errors.name && (
              <p
                id="name-error"
                role="alert"
                style={{
                  color: "var(--error)",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? "form-input-error" : ""}`}
              placeholder="you@example.com"
              {...register("email")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              autoComplete="email"
            />
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                style={{
                  color: "var(--error)",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? "form-input-error" : ""}`}
              placeholder="••••••••"
              {...register("password")}
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "password-error" : "password-hint"
              }
              autoComplete="new-password"
            />
            {errors.password ? (
              <p
                id="password-error"
                role="alert"
                style={{
                  color: "var(--error)",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.password.message}
              </p>
            ) : (
              <p
                id="password-hint"
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginTop: "0.5rem",
                }}
              >
                Must be at least 8 characters with uppercase, lowercase, and
                number
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-input ${errors.confirmPassword ? "form-input-error" : ""}`}
              placeholder="••••••••"
              {...register("confirmPassword")}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                role="alert"
                style={{
                  color: "var(--error)",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                {...register("agreeToTerms")}
                aria-invalid={!!errors.agreeToTerms}
                aria-describedby={
                  errors.agreeToTerms ? "agreeToTerms-error" : undefined
                }
                style={{ marginTop: "0.25rem" }}
              />
              <span style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                I agree to the{" "}
                <Link href="/terms" style={{ color: "var(--primary)" }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" style={{ color: "var(--primary)" }}>
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p
                id="agreeToTerms-error"
                role="alert"
                style={{
                  color: "var(--error)",
                  fontSize: "0.75rem",
                  marginTop: "0.25rem",
                }}
              >
                {errors.agreeToTerms.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner"
                  style={{ width: "20px", height: "20px", borderWidth: "2px" }}
                />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <button
            className="btn btn-ghost"
            style={{ border: "1px solid var(--border)" }}
          >
            <span>G</span> Google
          </button>
          <button
            className="btn btn-ghost"
            style={{ border: "1px solid var(--border)" }}
          >
            <span>🍎</span> Apple
          </button>
        </div>

        <p className="auth-footer">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
