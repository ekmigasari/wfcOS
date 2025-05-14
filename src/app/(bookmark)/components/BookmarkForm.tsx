"use client";

import { useAtom } from "jotai";
import { useState } from "react";

import {
  addBookmarkAtom,
  updateBookmarkAtom,
} from "@/application/atoms/bookmarkAtom";
import { Button } from "@/presentation/components/ui/button";

interface BookmarkFormProps {
  initialValues?: {
    id: string;
    name: string;
    url: string;
  };
  onAddComplete: () => void;
}

export const BookmarkForm = ({
  initialValues,
  onAddComplete,
}: BookmarkFormProps) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [url, setUrl] = useState(initialValues?.url || "");
  const [nameError, setNameError] = useState("");
  const [urlError, setUrlError] = useState("");

  const [, addBookmark] = useAtom(addBookmarkAtom);
  const [, updateBookmark] = useAtom(updateBookmarkAtom);

  const isEditing = !!initialValues;

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setNameError("");
    setUrlError("");

    // Validate name
    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    }

    // Validate URL
    if (!url.trim()) {
      setUrlError("URL is required");
      isValid = false;
    } else {
      // Simple URL validation
      try {
        // If URL doesn't have http(s) prefix, add it for validation
        const urlToValidate =
          url.startsWith("http://") || url.startsWith("https://")
            ? url
            : `https://${url}`;

        new URL(urlToValidate);
      } catch (err) {
        console.error(err);
        setUrlError("Please enter a valid URL");
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isEditing && initialValues) {
      updateBookmark({
        id: initialValues.id,
        name: name.trim(),
        url: url.trim(),
      });
    } else {
      addBookmark({
        name: name.trim(),
        url: url.trim(),
      });
    }

    onAddComplete();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card p-4 rounded-md mb-4 border border-border"
    >
      <div className="mb-3">
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full p-2 rounded-md border ${
            nameError ? "border-destructive" : "border-input"
          }`}
          placeholder="Enter bookmark name"
        />
        {nameError && (
          <p className="mt-1 text-xs text-destructive">{nameError}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="url" className="block text-sm font-medium mb-1">
          URL
        </label>
        <input
          type="text"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={`w-full p-2 rounded-md border ${
            urlError ? "border-destructive" : "border-input"
          }`}
          placeholder="Enter URL (e.g., https://example.com)"
        />
        {urlError && (
          <p className="mt-1 text-xs text-destructive">{urlError}</p>
        )}
      </div>

      <Button type="submit" className="bg-secondary hover:bg-accent w-full">
        {isEditing ? "Update Bookmark" : "Add Bookmark"}
      </Button>
    </form>
  );
};
