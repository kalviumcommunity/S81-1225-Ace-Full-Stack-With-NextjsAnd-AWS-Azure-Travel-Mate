"use client";

import { useState, useRef, useCallback } from "react";

/**
 * FileUpload Component
 *
 * A reusable file upload component that:
 * 1. Shows a file picker UI with drag & drop support
 * 2. Validates file type and size
 * 3. Calls /api/upload to get pre-signed URL
 * 4. Uploads directly to S3
 * 5. Returns the public URL via onUploadComplete callback
 */

interface FileUploadProps {
  onUploadComplete?: (url: string, key: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  className?: string;
  showPreview?: boolean;
}

interface UploadState {
  status:
    | "idle"
    | "validating"
    | "getting-url"
    | "uploading"
    | "complete"
    | "error";
  progress: number;
  error: string | null;
  previewUrl: string | null;
  publicUrl: string | null;
}

export default function FileUpload({
  onUploadComplete,
  onUploadError,
  accept = "image/*",
  maxSizeMB = 10,
  label = "Upload File",
  className = "",
  showPreview = true,
}: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    error: null,
    previewUrl: null,
    publicUrl: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const resetUpload = useCallback(() => {
    setUploadState({
      status: "idle",
      progress: 0,
      error: null,
      previewUrl: null,
      publicUrl: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      // Validate file size
      if (file.size > maxSizeBytes) {
        const error = `File too large. Maximum size is ${maxSizeMB}MB`;
        setUploadState((prev) => ({ ...prev, status: "error", error }));
        onUploadError?.(error);
        return;
      }

      // Create preview for images
      if (file.type.startsWith("image/") && showPreview) {
        const previewUrl = URL.createObjectURL(file);
        setUploadState((prev) => ({ ...prev, previewUrl }));
      }

      try {
        // Step 1: Get pre-signed URL
        setUploadState((prev) => ({
          ...prev,
          status: "getting-url",
          progress: 10,
          error: null,
        }));

        const presignResponse = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name.replace(/[^a-zA-Z0-9._-]/g, "_"),
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        if (!presignResponse.ok) {
          const errorData = await presignResponse.json();
          throw new Error(errorData.message || "Failed to get upload URL");
        }

        const { data } = await presignResponse.json();
        const { uploadUrl, publicUrl, key } = data;

        // Step 2: Upload to S3
        setUploadState((prev) => ({
          ...prev,
          status: "uploading",
          progress: 30,
        }));

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file to storage");
        }

        // Step 3: Complete
        setUploadState((prev) => ({
          ...prev,
          status: "complete",
          progress: 100,
          publicUrl,
        }));

        onUploadComplete?.(publicUrl, key);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setUploadState((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
        }));
        onUploadError?.(errorMessage);
      }
    },
    [maxSizeBytes, maxSizeMB, onUploadComplete, onUploadError, showPreview]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getStatusText = () => {
    switch (uploadState.status) {
      case "getting-url":
        return "Preparing upload...";
      case "uploading":
        return "Uploading...";
      case "complete":
        return "Upload complete!";
      case "error":
        return uploadState.error;
      default:
        return null;
    }
  };

  const isUploading =
    uploadState.status === "getting-url" || uploadState.status === "uploading";

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : uploadState.status === "complete"
                ? "border-green-500 bg-green-50"
                : uploadState.status === "error"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }
          ${isUploading ? "pointer-events-none opacity-75" : ""}
        `}
      >
        {/* Preview image */}
        {showPreview && uploadState.previewUrl && (
          <div className="mb-4 flex justify-center">
            <img
              src={uploadState.previewUrl}
              alt="Preview"
              className="max-h-32 max-w-full rounded-lg object-cover shadow-md"
            />
          </div>
        )}

        {/* Icon */}
        {!uploadState.previewUrl && (
          <div className="mb-3">
            <svg
              className={`mx-auto h-12 w-12 ${
                uploadState.status === "complete"
                  ? "text-green-500"
                  : uploadState.status === "error"
                    ? "text-red-500"
                    : "text-gray-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {uploadState.status === "complete" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              ) : uploadState.status === "error" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              )}
            </svg>
          </div>
        )}

        {/* Label and instructions */}
        <div className="space-y-1">
          <p
            className={`text-sm font-medium ${
              uploadState.status === "complete"
                ? "text-green-700"
                : uploadState.status === "error"
                  ? "text-red-700"
                  : "text-gray-700"
            }`}
          >
            {getStatusText() || label}
          </p>
          {uploadState.status === "idle" && (
            <p className="text-xs text-gray-500">
              Drag & drop or click to select • Max {maxSizeMB}MB
            </p>
          )}
        </div>

        {/* Progress bar */}
        {isUploading && (
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        )}

        {/* Reset button */}
        {(uploadState.status === "complete" ||
          uploadState.status === "error") && (
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              resetUpload();
            }}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Upload another file
          </button>
        )}
      </div>

      {/* Public URL display */}
      {uploadState.publicUrl && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs break-all">
          <span className="font-medium">URL: </span>
          <a
            href={uploadState.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {uploadState.publicUrl}
          </a>
        </div>
      )}
    </div>
  );
}
