"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick mock login for demonstration
  const handleQuickLogin = () => {
    // Create a mock JWT token for demo purposes
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImRlbW9AZXhhbXBsZS5jb20iLCJuYW1lIjoiRGVtbyBVc2VyIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTgwMDAwMDAwMH0.demo-signature";

    // Set cookie for middleware authentication
    Cookies.set("token", mockToken, { expires: 7 }); // Expires in 7 days

    // Redirect to dashboard
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store tokens
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);

      // Also set cookie for middleware authentication
      Cookies.set("token", data.data.accessToken, { expires: 7 });

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className="auth-logo">🌍</div>
            <h1 className="auth-title">Welcome Back</h1>
          </Link>
          <p className="auth-subtitle">Log in to your Travel Mate account</p>
        </div>

        {/* Quick Demo Login */}
        <div
          style={{
            padding: "1rem",
            background:
              "linear-gradient(135deg, rgb(59 130 246 / 0.1), rgb(147 51 234 / 0.1))",
            border: "1px solid rgb(59 130 246 / 0.3)",
            borderRadius: "var(--radius)",
            marginBottom: "1.5rem",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--foreground)",
              marginBottom: "0.75rem",
            }}
          >
            <strong>🚀 Quick Demo:</strong> Skip the form and login instantly
          </p>
          <button
            type="button"
            onClick={handleQuickLogin}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "linear-gradient(135deg, #3b82f6, #9333ea)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ⚡ Quick Login (Demo)
          </button>
        </div>

        <div className="auth-divider">or login with credentials</div>

        {error && (
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
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: "0.875rem",
                  color: "var(--primary)",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner"
                  style={{ width: "20px", height: "20px", borderWidth: "2px" }}
                />
                Logging in...
              </>
            ) : (
              "Log In"
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
          Don&apos;t have an account? <Link href="/signup">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
