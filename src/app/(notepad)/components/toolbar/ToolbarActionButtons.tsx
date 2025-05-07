import React from "react";
import { LexicalEditor } from "lexical";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/infrastructure/lib/utils";
import { Undo, Redo, Save, Copy } from "lucide-react";
import { UNDO_COMMAND, REDO_COMMAND } from "lexical";
import { playSound } from "@/infrastructure/lib/utils";

interface ToolbarActionButtonsProps {
  editor: LexicalEditor;
  handleSave: () => void;
  handleCopy: () => void;
  copySuccess: boolean;
}

export const ToolbarActionButtons: React.FC<ToolbarActionButtonsProps> = ({
  editor,
  handleSave,
  handleCopy,
  copySuccess,
}) => {
  const handleUndo = () => {
    playSound("/sounds/click.mp3");
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const handleRedo = () => {
    playSound("/sounds/click.mp3");
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  return (
    <div className="flex items-center mr-2 pr-2 border-r border-gray-200">
      <Button
        variant="ghost"
        size="sm"
        title="Undo (Ctrl+Z)"
        onClick={handleUndo}
        className="p-1 h-8 w-8"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        title="Redo (Ctrl+Y)"
        onClick={handleRedo}
        className="p-1 h-8 w-8"
      >
        <Redo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        title="Save to file"
        onClick={handleSave}
        className="p-1 h-8 w-8"
      >
        <Save className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        title={copySuccess ? "Copied!" : "Copy to clipboard"}
        onClick={handleCopy}
        className={cn("p-1 h-8 w-8", copySuccess ? "text-green-600" : "")}
        disabled={copySuccess}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};
