import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAtom } from "jotai";
import { saveFeatureState } from "../../utils/storage";
import {
  textEditorContentAtom,
  textEditorSettingsAtom,
  EditorSettings,
  TEXT_EDITOR_STORAGE_KEY,
  TEXT_EDITOR_SETTINGS_KEY,
  loadEditorSettings,
  loadEditorContent,
} from "../../atoms/textEditorAtom";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface TextEditorProps {
  initialContent?: string;
  editorId?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({
  initialContent = "",
  editorId = "default",
}) => {
  // Use global state with atoms
  const [content, setContent] = useAtom(textEditorContentAtom);
  const [editorSettings, setEditorSettings] = useAtom(textEditorSettingsAtom);

  // Status message state
  const [statusMessage, setStatusMessage] = useState<string>("");
  // Auto-save timer reference
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track if initial load has happened
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  // Load instance-specific settings and content on first mount
  useEffect(() => {
    if (!initialLoadDone) {
      // Load instance-specific settings
      const savedSettings = loadEditorSettings(editorId);
      if (savedSettings) {
        setEditorSettings(savedSettings);
      }

      // Load instance-specific content or use initialContent prop
      const savedContent = loadEditorContent(editorId);
      if (savedContent) {
        setContent(savedContent);
      } else if (initialContent) {
        setContent(initialContent);
      }

      setInitialLoadDone(true);
    }
  }, [
    editorId,
    initialContent,
    setContent,
    setEditorSettings,
    initialLoadDone,
  ]);

  // Function to show status message temporarily
  const showStatusMessage = useCallback((message: string) => {
    setStatusMessage(message);
    // Clear the message after 2 seconds
    setTimeout(() => {
      setStatusMessage("");
    }, 2000);
  }, []);

  // Setup auto-save
  useEffect(() => {
    // Skip if initial loading hasn't completed
    if (!initialLoadDone) return;

    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    // Set up new timer if auto-save is enabled
    if (editorSettings.autoSaveInterval > 0) {
      autoSaveTimerRef.current = setInterval(() => {
        saveFeatureState(`${TEXT_EDITOR_STORAGE_KEY}_${editorId}`, content);
        // Optional: show a subtle indicator that content was saved
        showStatusMessage("Content auto-saved");
      }, editorSettings.autoSaveInterval * 1000);
    }

    // Cleanup function
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [
    editorSettings.autoSaveInterval,
    content,
    editorId,
    showStatusMessage,
    initialLoadDone,
  ]);

  // Function to handle saving the content as a .txt file
  const handleSaveToFile = useCallback(() => {
    // Create a blob with the content
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editorId}_note.txt`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content, editorId]);

  // Function to copy content to clipboard
  const handleCopyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      showStatusMessage("Content copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback method for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showStatusMessage("Content copied to clipboard!");
    }
  }, [content, showStatusMessage]);

  // Function to clear all text content
  const handleClearText = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to clear all text? This cannot be undone."
      )
    ) {
      setContent("");
      showStatusMessage("All text cleared");
    }
  }, [setContent, showStatusMessage]);

  // Add keyboard shortcuts for save and copy
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save: Ctrl+S
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault(); // Prevent browser's save dialog
        handleSaveToFile();
      }

      // Copy: Ctrl+C (only when not in text selection mode)
      if (
        e.ctrlKey &&
        e.key === "c" &&
        window.getSelection()?.toString() === ""
      ) {
        e.preventDefault();
        handleCopyToClipboard();
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSaveToFile, handleCopyToClipboard]);

  // Store editorId in a data attribute for potential future use
  useEffect(() => {
    // Could use editorId for instance-specific storage in the future
    console.log(`Text Editor instance ${editorId} mounted`);

    return () => {
      console.log(`Text Editor instance ${editorId} unmounted`);
    };
  }, [editorId]);

  // Save content to local storage whenever it changes
  useEffect(() => {
    if (initialLoadDone) {
      // Only save after initial load to prevent overwriting
      saveFeatureState(`${TEXT_EDITOR_STORAGE_KEY}_${editorId}`, content);
    }
  }, [content, editorId, initialLoadDone]);

  // Save settings to local storage whenever they change
  useEffect(() => {
    if (initialLoadDone) {
      // Only save after initial load to prevent overwriting
      saveFeatureState(
        `${TEXT_EDITOR_SETTINGS_KEY}_${editorId}`,
        editorSettings
      );
    }
  }, [editorSettings, editorId, initialLoadDone]);

  // Destructure settings for ease of use
  const {
    fontSize,
    fontFamily,
    textAlign,
    isBold,
    isItalic,
    isUnderline,
    lineHeight,
    textColor,
    backgroundColor,
    wordWrap,
  } = editorSettings;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  // Helper function to update a single setting
  const updateSetting = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    setEditorSettings({
      ...editorSettings,
      [key]: value,
    });
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Toolbar */}
      <div className="flex p-2 border-b border-gray-200 bg-gray-50 flex-wrap shadow-sm">
        {/* File Operations Group */}
        <div className="flex mr-2 pr-2 border-r border-gray-200">
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-50 text-blue-700 mr-1"
            onClick={handleSaveToFile}
            title="Save as Text File"
          >
            💾 Save
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="bg-blue-50 text-blue-700 mr-1"
            onClick={handleCopyToClipboard}
            title="Copy All Text"
          >
            📋 Copy
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="bg-blue-50 text-blue-700 mr-1"
            onClick={handleClearText}
            title="Clear All Text"
          >
            🗑️ Clear
          </Button>

          {/* Status message */}
          {statusMessage && (
            <div className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-sm flex items-center animate-fadeIn">
              ✓ {statusMessage}
            </div>
          )}
        </div>

        {/* Font Settings Group */}
        <div className="flex mr-2 pr-2 border-r border-gray-200">
          {/* Font Family */}
          <select
            value={fontFamily}
            onChange={(e) => updateSetting("fontFamily", e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded text-sm px-2 py-1 mr-1 h-8"
          >
            <option value="monospace">Monospace</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Courier New, monospace">Courier New</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Verdana, sans-serif">Verdana</option>
          </select>

          {/* Font Size */}
          <select
            value={fontSize}
            onChange={(e) =>
              updateSetting("fontSize", parseInt(e.target.value))
            }
            className="bg-gray-100 border border-gray-300 rounded text-sm px-2 py-1 mr-1 h-8"
          >
            {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72].map(
              (size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              )
            )}
          </select>
        </div>

        {/* Text Formatting Group */}
        <div className="flex mr-2 pr-2 border-r border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "min-w-[28px] p-0 h-8 w-8",
              isBold ? "bg-gray-200 text-gray-900" : "text-gray-700"
            )}
            onClick={() => updateSetting("isBold", !isBold)}
            title="Bold"
          >
            <b>B</b>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "min-w-[28px] p-0 h-8 w-8",
              isItalic ? "bg-gray-200 text-gray-900" : "text-gray-700"
            )}
            onClick={() => updateSetting("isItalic", !isItalic)}
            title="Italic"
          >
            <i>I</i>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "min-w-[28px] p-0 h-8 w-8",
              isUnderline ? "bg-gray-200 text-gray-900" : "text-gray-700"
            )}
            onClick={() => updateSetting("isUnderline", !isUnderline)}
            title="Underline"
          >
            <u>U</u>
          </Button>
        </div>

        {/* Alignment Group */}
        <div className="flex mr-2 pr-2 border-r border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "min-w-[28px] p-0 h-8 w-8",
              textAlign === "left"
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700"
            )}
            onClick={() => updateSetting("textAlign", "left")}
            title="Align Left"
          >
            &#8676;
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "min-w-[28px] p-0 h-8 w-8",
              textAlign === "center"
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700"
            )}
            onClick={() => updateSetting("textAlign", "center")}
            title="Align Center"
          >
            &#8677;
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "min-w-[28px] p-0 h-8 w-8",
              textAlign === "right"
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700"
            )}
            onClick={() => updateSetting("textAlign", "right")}
            title="Align Right"
          >
            &#8678;
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "min-w-[28px] p-0 h-8 w-8",
              textAlign === "justify"
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700"
            )}
            onClick={() => updateSetting("textAlign", "justify")}
            title="Justify"
          >
            &#8680;
          </Button>
        </div>

        {/* Lists Group */}
        <div className="flex">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700"
            onClick={() => {
              setContent(content + "\n• ");
            }}
            title="Bullet List"
          >
            &#8226; List
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700"
            onClick={() => {
              setContent(content + "\n1. ");
            }}
            title="Numbered List"
          >
            1. List
          </Button>
        </div>
      </div>

      {/* Text Area */}
      <textarea
        value={content}
        onChange={handleChange}
        className={cn(
          "w-full h-full flex-grow border-none outline-none resize-none p-4 shadow-inner transition-colors duration-300",
          "caret-blue-500"
        )}
        style={{
          fontFamily,
          fontSize: `${fontSize}px`,
          textAlign,
          fontWeight: isBold ? "bold" : "normal",
          fontStyle: isItalic ? "italic" : "normal",
          textDecoration: isUnderline ? "underline" : "none",
          backgroundColor,
          color: textColor,
          lineHeight: lineHeight.toString(),
          wordWrap: wordWrap ? "break-word" : "normal",
          whiteSpace: wordWrap ? "pre-wrap" : "pre",
          overflowWrap: wordWrap ? "break-word" : "normal",
        }}
        spellCheck={true}
        placeholder="Type your text here..."
      />

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s;
        }
      `}</style>
    </div>
  );
};

export default TextEditor;
