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

  // Toolbar button styling
  const toolbarButtonStyle: React.CSSProperties = {
    backgroundColor: "#f8f8f8",
    border: "1px solid #e0e0e0",
    padding: "6px 10px",
    margin: "0 3px",
    cursor: "pointer",
    borderRadius: "4px",
    color: "#444",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "28px",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  // Action button styling (Save, Copy)
  const actionButtonStyle: React.CSSProperties = {
    ...toolbarButtonStyle,
    backgroundColor: "#f0f7ff",
    borderColor: "#b3d7ff",
    color: "#0066cc",
    padding: "6px 12px",
    fontWeight: "bold",
  };

  const activeButtonStyle: React.CSSProperties = {
    ...toolbarButtonStyle,
    backgroundColor: "#e8e8e8",
    borderColor: "#bbb",
    color: "#000",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
  };

  const selectStyle: React.CSSProperties = {
    ...toolbarButtonStyle,
    minWidth: "85px",
    appearance: "none",
    backgroundImage:
      'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23444%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    backgroundSize: "10px",
    paddingRight: "24px",
  };

  // Toolbar group style
  const toolbarGroupStyle: React.CSSProperties = {
    display: "flex",
    marginRight: "8px",
    borderRight: "1px solid #e0e0e0",
    paddingRight: "8px",
  };

  // CSS for animations
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Add style element for keyframes */}
      <style>{keyframes}</style>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          padding: "8px",
          borderBottom: "1px solid #ddd",
          backgroundColor: "#fafafa",
          flexWrap: "wrap",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {/* File Operations Group */}
        <div style={toolbarGroupStyle}>
          <button
            onClick={handleSaveToFile}
            style={actionButtonStyle}
            title="Save as Text File"
          >
            💾 Save
          </button>

          <button
            onClick={handleCopyToClipboard}
            style={actionButtonStyle}
            title="Copy All Text"
          >
            📋 Copy
          </button>

          <button
            onClick={handleClearText}
            style={actionButtonStyle}
            title="Clear All Text"
          >
            🗑️ Clear
          </button>

          {/* Status message */}
          {statusMessage && (
            <div
              style={{
                marginLeft: "10px",
                padding: "5px 10px",
                backgroundColor: "#4CAF50",
                color: "white",
                borderRadius: "4px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                animation: "fadeIn 0.3s",
              }}
            >
              ✓ {statusMessage}
            </div>
          )}
        </div>

        {/* Font Settings Group */}
        <div style={toolbarGroupStyle}>
          {/* Font Family */}
          <select
            value={fontFamily}
            onChange={(e) => updateSetting("fontFamily", e.target.value)}
            style={selectStyle}
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
            style={selectStyle}
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
        <div style={toolbarGroupStyle}>
          <button
            onClick={() => updateSetting("isBold", !isBold)}
            style={isBold ? activeButtonStyle : toolbarButtonStyle}
            title="Bold"
          >
            <b>B</b>
          </button>

          <button
            onClick={() => updateSetting("isItalic", !isItalic)}
            style={isItalic ? activeButtonStyle : toolbarButtonStyle}
            title="Italic"
          >
            <i>I</i>
          </button>

          <button
            onClick={() => updateSetting("isUnderline", !isUnderline)}
            style={isUnderline ? activeButtonStyle : toolbarButtonStyle}
            title="Underline"
          >
            <u>U</u>
          </button>
        </div>

        {/* Alignment Group */}
        <div style={toolbarGroupStyle}>
          <button
            onClick={() => updateSetting("textAlign", "left")}
            style={
              textAlign === "left" ? activeButtonStyle : toolbarButtonStyle
            }
            title="Align Left"
          >
            &#8676;
          </button>

          <button
            onClick={() => updateSetting("textAlign", "center")}
            style={
              textAlign === "center" ? activeButtonStyle : toolbarButtonStyle
            }
            title="Align Center"
          >
            &#8677;
          </button>

          <button
            onClick={() => updateSetting("textAlign", "right")}
            style={
              textAlign === "right" ? activeButtonStyle : toolbarButtonStyle
            }
            title="Align Right"
          >
            &#8678;
          </button>

          <button
            onClick={() => updateSetting("textAlign", "justify")}
            style={
              textAlign === "justify" ? activeButtonStyle : toolbarButtonStyle
            }
            title="Justify"
          >
            &#8680;
          </button>
        </div>

        {/* Lists Group */}
        <div style={{ ...toolbarGroupStyle, borderRight: "none" }}>
          <button
            style={toolbarButtonStyle}
            title="Bullet List"
            onClick={() => {
              setContent(content + "\n• ");
            }}
          >
            &#8226; List
          </button>

          <button
            style={toolbarButtonStyle}
            title="Numbered List"
            onClick={() => {
              setContent(content + "\n1. ");
            }}
          >
            1. List
          </button>
        </div>
      </div>

      {/* Text Area */}
      <textarea
        value={content}
        onChange={handleChange}
        style={{
          width: "100%",
          height: "100%",
          flexGrow: 1,
          border: "none",
          outline: "none",
          resize: "none",
          fontFamily: fontFamily,
          fontSize: `${fontSize}px`,
          textAlign: textAlign,
          fontWeight: isBold ? "bold" : "normal",
          fontStyle: isItalic ? "italic" : "normal",
          textDecoration: isUnderline ? "underline" : "none",
          padding: "15px",
          backgroundColor: backgroundColor,
          color: textColor,
          lineHeight: lineHeight.toString(),
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
          caretColor: "#3498db",
          transition: "background-color 0.3s ease, color 0.3s ease",
          wordWrap: wordWrap ? "break-word" : "normal",
          whiteSpace: wordWrap ? "pre-wrap" : "pre",
          overflowWrap: wordWrap ? "break-word" : "normal",
        }}
        spellCheck={true}
        placeholder="Type your text here..."
      />
    </div>
  );
};

export default TextEditor;
