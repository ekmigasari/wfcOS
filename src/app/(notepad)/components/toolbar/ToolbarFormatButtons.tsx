import { TextFormatType } from "lexical";
import { Bold, Italic, Underline } from "lucide-react";
import React from "react";

import { cn } from "@/infrastructure/lib/utils";
import { Button } from "@/presentation/components/ui/button";

interface ToolbarFormatButtonsProps {
  formatText: (format: TextFormatType) => void;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

export const ToolbarFormatButtons: React.FC<ToolbarFormatButtonsProps> = ({
  formatText,
  isBold,
  isItalic,
  isUnderline,
}) => {
  return (
    <div className="flex items-center mr-2 pr-2 border-r border-gray-200">
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
  );
};
