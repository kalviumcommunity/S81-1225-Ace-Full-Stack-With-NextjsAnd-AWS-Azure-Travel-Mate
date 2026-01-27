"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";

interface ProfileUploadProps {
  currentAvatar: string;
  userName: string;
}

export default function ProfileUpload({
  currentAvatar,
  userName,
}: ProfileUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleUploadComplete = (url: string) => {
    setAvatarUrl(url);
    setIsEditing(false);
    // In a real app, you would also save this to the user's profile via API
    console.log("Profile photo uploaded:", url);
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        flexWrap: "wrap",
      }}
    >
      {/* Avatar with upload option */}
      <div style={{ position: "relative" }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid var(--primary)",
            }}
          />
        ) : (
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 700,
              color: "white",
            }}
          >
            {currentAvatar}
          </div>
        )}

        {/* Edit button */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            position: "absolute",
            bottom: "-4px",
            right: "-4px",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "var(--primary)",
            border: "2px solid white",
            color: "white",
            fontSize: "0.8rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Change profile photo"
        >
          📷
        </button>
      </div>

      {/* Upload modal/dropdown */}
      {isEditing && (
        <div
          style={{
            position: "absolute",
            top: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--card)",
            padding: "1.5rem",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 1000,
            width: "320px",
            maxWidth: "90vw",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
              Upload Profile Photo
            </h3>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.25rem",
                cursor: "pointer",
                color: "var(--text-secondary)",
              }}
            >
              ×
            </button>
          </div>

          <FileUpload
            accept="image/jpeg,image/png,image/webp,image/gif"
            maxSizeMB={5}
            label="Drop your photo here"
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            showPreview={true}
          />
        </div>
      )}

      {/* Backdrop */}
      {isEditing && (
        <div
          onClick={() => setIsEditing(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}
    </div>
  );
}
