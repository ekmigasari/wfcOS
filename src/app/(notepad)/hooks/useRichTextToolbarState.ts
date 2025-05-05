"use client";

import { useState, useEffect, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  TextFormatType,
  ElementFormatType,
  $createParagraphNode,
  $isParagraphNode,
  $getRoot,
} from "lexical";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection";
import { $isListNode, ListNode } from "@lexical/list";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  $isHeadingNode,
  HeadingTagType,
  $createHeadingNode,
} from "@lexical/rich-text";
import type { BlockTypeDropdownValue } from "../types/richTextTypes";

export const useRichTextToolbarState = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<ElementFormatType>("left");
  const [blockType, setBlockType] =
    useState<BlockTypeDropdownValue>("paragraph");
  const [fontSize, setFontSize] = useState<string>("16px");
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [copySuccess, setCopySuccess] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format states
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));

      // Update text style states
      setFontSize(
        $getSelectionStyleValueForProperty(selection, "font-size", "16px")
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );

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
        const currentAlign = elementDOM.style.textAlign as ElementFormatType;
        setTextAlign(currentAlign || "left"); // Default to left if not set
      }

      // Update block type state
      const blockNode = $findMatchingParent(
        anchorNode,
        (node) =>
          $isParagraphNode(node) || $isHeadingNode(node) || $isListNode(node)
      );

      if (blockNode) {
        if ($isHeadingNode(blockNode)) {
          const tag = blockNode.getTag();
          if (tag === "h1" || tag === "h2" || tag === "h3") {
            setBlockType(tag);
          } else {
            setBlockType("paragraph");
          }
        } else if ($isListNode(blockNode)) {
          setBlockType(
            blockNode.getListType() === "bullet" ? "bullet" : "number"
          );
        } else {
          setBlockType("paragraph");
        }
      } else {
        setBlockType("paragraph");
      }
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

  const formatText = useCallback(
    (format: TextFormatType) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor]
  );

  const formatElement = useCallback(
    (align: ElementFormatType) => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align);
      setTextAlign(align); // Optimistically update UI
    },
    [editor]
  );

  const formatBulletList = useCallback(() => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      // Ensure paragraph node after removing list
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element = $findMatchingParent(anchorNode, (node) =>
            $isListNode(node)
          ) as ListNode | null;
          if (element) {
            // If inside a list, replace it with a paragraph
            const paragraph = $createParagraphNode();
            element.replace(paragraph);
            paragraph.select(); // Select the new paragraph
          } else {
            // If not directly inside a list, insert paragraph (fallback)
            selection.insertNodes([$createParagraphNode()]);
          }
        }
      });
    }
    // No need to call setBlockType here, listener will update
  }, [editor, blockType]);

  const formatNumberedList = useCallback(() => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      // Ensure paragraph node after removing list
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element = $findMatchingParent(anchorNode, (node) =>
            $isListNode(node)
          ) as ListNode | null;
          if (element) {
            // If inside a list, replace it with a paragraph
            const paragraph = $createParagraphNode();
            element.replace(paragraph);
            paragraph.select(); // Select the new paragraph
          } else {
            // If not directly inside a list, insert paragraph (fallback)
            selection.insertNodes([$createParagraphNode()]);
          }
        }
      });
    }
    // No need to call setBlockType here, listener will update
  }, [editor, blockType]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
        editor.focus(); // Refocus editor after applying style
      });
    },
    [editor]
  );

  const onFontSizeChange = useCallback(
    (newSize: string) => {
      applyStyleText({ "font-size": newSize });
      setFontSize(newSize); // Optimistic update
    },
    [applyStyleText]
  );

  const onFontFamilyChange = useCallback(
    (newFamily: string) => {
      applyStyleText({ "font-family": newFamily });
      setFontFamily(newFamily); // Optimistic update
    },
    [applyStyleText]
  );

  const onBlockTypeChange = useCallback(
    (newBlockType: BlockTypeDropdownValue) => {
      if (newBlockType === "bullet") {
        formatBulletList();
        return;
      }
      if (newBlockType === "number") {
        formatNumberedList();
        return;
      }

      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (newBlockType === "paragraph") {
            $setBlocksType(selection, () => $createParagraphNode());
          } else if (
            newBlockType === "h1" ||
            newBlockType === "h2" ||
            newBlockType === "h3"
          ) {
            $setBlocksType(selection, () =>
              $createHeadingNode(newBlockType as HeadingTagType)
            );
          }
        }
      });
      // Let the listener update the blockType state
      // setBlockType(newBlockType); // Remove optimistic update here
    },
    [editor, formatBulletList, formatNumberedList]
  );

  // Function to get plain text content from the editor
  const getPlainTextContent = useCallback(() => {
    let textContent = "";
    editor.getEditorState().read(() => {
      const root = $getRoot();
      textContent = root.getTextContent();
    });
    return textContent;
  }, [editor]);

  // Handler for saving content to a file
  const handleSave = useCallback(() => {
    const textContent = getPlainTextContent();
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notepad-content.txt"; // Default filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [getPlainTextContent]);

  // Handler for copying content to clipboard
  const handleCopy = useCallback(async () => {
    const textContent = getPlainTextContent();
    try {
      await navigator.clipboard.writeText(textContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500); // Reset after 1.5s
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Optionally: show an error message to the user
    }
  }, [getPlainTextContent]);

  return {
    editor,
    isBold,
    isItalic,
    isUnderline,
    textAlign,
    blockType,
    fontSize,
    fontFamily,
    copySuccess,
    formatText,
    formatElement,
    formatBulletList,
    formatNumberedList,
    onFontSizeChange,
    onFontFamilyChange,
    onBlockTypeChange,
    handleSave,
    handleCopy,
  };
};
