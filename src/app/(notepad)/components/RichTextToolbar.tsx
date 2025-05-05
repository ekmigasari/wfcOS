"use client";

import React from "react";
import { useRichTextToolbarState } from "../hooks/useRichTextToolbarState";
import { ToolbarActionButtons } from "./toolbar/ToolbarActionButtons";
import { ToolbarBlockTypeSelect } from "./toolbar/ToolbarBlockTypeSelect";
import { ToolbarFontSelect } from "./toolbar/ToolbarFontSelect";
import { ToolbarFormatButtons } from "./toolbar/ToolbarFormatButtons";
import { ToolbarAlignButtons } from "./toolbar/ToolbarAlignButtons";
import { ToolbarListButtons } from "./toolbar/ToolbarListButtons";

export const RichTextToolbar: React.FC = () => {
  const {
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
  } = useRichTextToolbarState();

  return (
    <div className="flex flex-wrap items-center p-2 border-b border-gray-200 bg-gray-50 gap-1 shadow-sm">
      <ToolbarFontSelect
        fontFamily={fontFamily}
        onFontFamilyChange={onFontFamilyChange}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
      />

      <ToolbarBlockTypeSelect
        blockType={blockType}
        onBlockTypeChange={onBlockTypeChange}
      />

      <ToolbarFormatButtons
        formatText={formatText}
        isBold={isBold}
        isItalic={isItalic}
        isUnderline={isUnderline}
      />

      <ToolbarAlignButtons
        formatElement={formatElement}
        textAlign={textAlign}
      />

      <ToolbarListButtons
        formatBulletList={formatBulletList}
        formatNumberedList={formatNumberedList}
        blockType={blockType}
      />
      <ToolbarActionButtons
        editor={editor}
        handleSave={handleSave}
        handleCopy={handleCopy}
        copySuccess={copySuccess}
      />
    </div>
  );
};
