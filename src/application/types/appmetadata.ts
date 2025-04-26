import { Size } from "@/application/types/window";

export interface AppMetadata {
  name: string;
  icon: string;
  defaultSize: Size;
  component: React.ComponentType<unknown>; // Or a more specific type
}
