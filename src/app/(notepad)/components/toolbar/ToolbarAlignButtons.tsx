import React from "react";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/infrastructure/lib/utils";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { ElementFormatType } from "lexical";

interface ToolbarAlignButtonsProps {
  formatElement: (align: ElementFormatType) => void;
  textAlign: ElementFormatType;
}

export const ToolbarAlignButtons: React.FC<ToolbarAlignButtonsProps> = ({
  formatElement,
  textAlign,
}) => {
  return (
    <div className="flex items-center mr-2 pr-2 border-r border-gray-200">
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
  );
}; 