import React from "react";

import { Coffee } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Coffee className="animate-bounce text-brown-700" size={48} />
      <span className="mt-2 text-brown-700 text-lg font-medium">
        Brewing...
      </span>
    </div>
  );
}
