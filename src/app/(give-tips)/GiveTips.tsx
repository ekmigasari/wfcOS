"use client";

import { openExternalUrl } from "@/infrastructure/utils/externalNavigation";
import { Button } from "@/presentation/components/ui/button";

const SUPPORT_LINKS = {
  international: "https://workfromcoffee.gumroad.com/coffee",
  indonesia: "https://saweria.co/WorkfromCoffee",
};

export const GiveTips = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full p-8 text-center">
      <div className="text-4xl">☕</div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-primary">Buy Us a Coffee</h2>
        <p className="text-sm text-muted-foreground">
          Support WFC OS development. Choose your preferred platform:
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-[200px]">
        <Button
          className="w-full"
          onClick={() => openExternalUrl(SUPPORT_LINKS.international)}
        >
          International
        </Button>
        <Button
          variant="secondary"
          className="w-full text-white"
          onClick={() => openExternalUrl(SUPPORT_LINKS.indonesia)}
        >
          Indonesia 🇮🇩
        </Button>
      </div>
    </div>
  );
};
