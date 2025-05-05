"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  TextFormatType,
} from "lexical";
import { $isListNode } from "@lexical/list";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/infrastructure/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";

// Define props if needed, e.g., custom configurations
// interface RichTextToolbarProps {}

export const RichTextToolbar: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<
    "left" | "center" | "right" | "justify"
  >("left");
  const [isUL, setIsUL] = useState(false);
  const [isOL, setIsOL] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format states
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));

      // Update alignment state
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && parent.getKey() === "root";
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        const currentAlign = elementDOM.style.textAlign as
          | "left"
          | "center"
          | "right"
          | "justify";
        setTextAlign(currentAlign || "left"); // Default to left if not set
      }

      // Update list states
      const parent = anchorNode.getParent();
      setIsUL($isListNode(parent) && parent.getListType() === "bullet");
      setIsOL($isListNode(parent) && parent.getListType() === "number");
    }
  }, [editor]);

  useEffect(() => {
    // Register listener for selection changes
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updateToolbar]);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatElement = (align: "left" | "center" | "right" | "justify") => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align);
    setTextAlign(align); // Optimistically update UI
  };

  const formatBulletList = () => {
    if (!isUL) {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    setIsUL(!isUL); // Optimistic update
    setIsOL(false);
  };

  const formatNumberedList = () => {
    if (!isOL) {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    setIsOL(!isOL); // Optimistic update
    setIsUL(false);
  };

  return (
    <div className="flex flex-wrap p-2 border-b border-gray-200 bg-gray-50 gap-1 shadow-sm">
      {/* Undo/Redo Group */}
      <div className="flex mr-2 pr-2 border-r border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          title="Undo (Ctrl+Z)"
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          className="p-1 h-8 w-8"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          title="Redo (Ctrl+Y)"
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          className="p-1 h-8 w-8"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Formatting Group */}
      <div className="flex mr-2 pr-2 border-r border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          title="Bold (Ctrl+B)"
          onClick={() => formatText("bold")}
          className={cn("p-1 h-8 w-8", isBold ? "bg-gray-200" : "")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          title="Italic (Ctrl+I)"
          onClick={() => formatText("italic")}
          className={cn("p-1 h-8 w-8", isItalic ? "bg-gray-200" : "")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          title="Underline (Ctrl+U)"
          onClick={() => formatText("underline")}
          className={cn("p-1 h-8 w-8", isUnderline ? "bg-gray-200" : "")}
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      {/* Alignment Group */}
      <div className="flex mr-2 pr-2 border-r border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          title="Align Left"
          onClick={() => formatElement("left")}
          className={cn(
            "p-1 h-8 w-8",
            textAlign === "left" ? "bg-gray-200" : ""
          )}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          title="Align Center"
          onClick={() => formatElement("center")}
          className={cn(
            "p-1 h-8 w-8",
            textAlign === "center" ? "bg-gray-200" : ""
          )}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          title="Align Right"
          onClick={() => formatElement("right")}
          className={cn(
            "p-1 h-8 w-8",
            textAlign === "right" ? "bg-gray-200" : ""
          )}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          title="Justify"
          onClick={() => formatElement("justify")}
          className={cn(
            "p-1 h-8 w-8",
            textAlign === "justify" ? "bg-gray-200" : ""
          )}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      {/* List Group */}
      <div className="flex">
        <Button
          variant="ghost"
          size="sm"
          title="Bullet List"
          onClick={formatBulletList}
          className={cn("p-1 h-8 w-8", isUL ? "bg-gray-200" : "")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          title="Numbered List"
          onClick={formatNumberedList}
          className={cn("p-1 h-8 w-8", isOL ? "bg-gray-200" : "")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Add Font Family/Size Dropdowns later if needed */}
    </div>
  );
};
