import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

import type { BlockTypeDropdownValue } from "../../types/richTextTypes";

interface ToolbarBlockTypeSelectProps {
  blockType: BlockTypeDropdownValue;
  onBlockTypeChange: (newBlockType: BlockTypeDropdownValue) => void;
}

export const ToolbarBlockTypeSelect: React.FC<ToolbarBlockTypeSelectProps> = ({
  blockType,
  onBlockTypeChange,
}) => {
  return (
    <Select value={blockType} onValueChange={onBlockTypeChange}>
      <SelectTrigger className="w-[150px] h-8 text-xs px-2 mr-1">
        <SelectValue placeholder="Block Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="paragraph" className="text-xs">
          Paragraph
        </SelectItem>
        <SelectItem value="h1" className="text-xs">
          Heading 1
        </SelectItem>
        <SelectItem value="h2" className="text-xs">
          Heading 2
        </SelectItem>
        <SelectItem value="h3" className="text-xs">
          Heading 3
        </SelectItem>
        <SelectItem value="bullet" className="text-xs">
          Bulleted List
        </SelectItem>
        <SelectItem value="number" className="text-xs">
          Numbered List
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
