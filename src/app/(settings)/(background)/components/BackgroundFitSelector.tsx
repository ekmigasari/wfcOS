import React from "react";
import { BackgroundFit } from "@/application/atoms/backgroundAtom";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/presentation/components/ui/select";

const fitOptions: { value: BackgroundFit; label: string }[] = [
  { value: "fill", label: "Fill" },
  { value: "fit", label: "Fit" },
  { value: "stretch", label: "Stretch" },
  { value: "tile", label: "Tile" },
  { value: "center", label: "Center" },
];

interface BackgroundFitSelectorProps {
  fit: BackgroundFit;
  onChangeFit: (value: string) => void;
}

export const BackgroundFitSelector = ({
  fit,
  onChangeFit,
}: BackgroundFitSelectorProps) => {
  return (
    <div>
      <label htmlFor="fit-selector" className="block text-sm font-medium mb-2">
        Image Fit
      </label>
      <Select value={fit} onValueChange={onChangeFit}>
        <SelectTrigger className="w-full" id="fit-selector">
          <SelectValue placeholder="Select fit style" />
        </SelectTrigger>
        <SelectContent>
          {fitOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { fitOptions };
