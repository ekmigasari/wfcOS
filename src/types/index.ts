export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Potential future use for app metadata
export interface AppMetadata {
  name: string;
  icon: string;
  defaultSize: Size;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>; // Or a more specific type
}
