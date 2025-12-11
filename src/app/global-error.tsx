"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Something went wrong!
          </h1>
          <p style={{ color: "#666", marginBottom: "2rem" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Try Again
          </button>
          {error.digest && (
            <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "#999" }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
