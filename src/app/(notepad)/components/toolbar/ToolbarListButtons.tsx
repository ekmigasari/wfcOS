import React from "react";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/infrastructure/lib/utils";
import { List, ListOrdered } from "lucide-react";
import type { BlockTypeDropdownValue } from "../../types/richTextTypes";

interface ToolbarListButtonsProps {
  formatBulletList: () => void;
  formatNumberedList: () => void;
  blockType: BlockTypeDropdownValue;
}

export const ToolbarListButtons: React.FC<ToolbarListButtonsProps> = ({
  formatBulletList,
  formatNumberedList,
  blockType,
}) => {
  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="sm"
        title="Bullet List"
        onClick={formatBulletList}
        className={cn(
          "p-1 h-8 w-8",
          blockType === "bullet" ? "bg-gray-200" : ""
        )}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        title="Numbered List"
        onClick={formatNumberedList}
        className={cn(
          "p-1 h-8 w-8",
          blockType === "number" ? "bg-gray-200" : ""
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
};
