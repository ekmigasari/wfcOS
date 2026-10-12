"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";
import { Button } from "@/presentation/components/ui/button";
import {
  announcementConfig,
  getActiveAnnouncementTemplate,
  hideAnnouncementForToday,
  shouldShowAnnouncement,
  type AnnouncementTemplate,
} from "@/infrastructure/utils/announcement";
import { Label } from "@/presentation/components/ui/label";
import { redirectToExternalUrl } from "@/infrastructure/utils/externalNavigation";
import { useOnlineStatus } from "@/application/hooks";

export const AnnouncementPopup = () => {
  const [template, setTemplate] = useState<AnnouncementTemplate | null>(null);
  const [dontShowAgainToday, setDontShowAgainToday] = useState(false);
  const [open, setOpen] = useState(false);
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    if (!isOnline) {
      setOpen(false);
      return;
    }

    if (!shouldShowAnnouncement()) return;

    const nextTemplate = getActiveAnnouncementTemplate();
    if (!nextTemplate) return;

    setTemplate(nextTemplate);
    setOpen(true);
  }, [isOnline]);

  const handleClose = () => {
    if (
      announcementConfig.displayMode === "once-per-day" &&
      dontShowAgainToday
    ) {
      hideAnnouncementForToday();
    }

    setOpen(false);
  };

  // const handleRedirect = () => {
  //   redirectToExternalUrl("https://os.workfromcoffee.com");
  // };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleClose();
      return;
    }

    setOpen(nextOpen);
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-secondary border-2">
        <DialogHeader>
          <DialogTitle className="text-primary">{template.title}</DialogTitle>
          <DialogDescription className="whitespace-pre-line leading-6 text-secondary">
            {template.message}
          </DialogDescription>
        </DialogHeader>

        {announcementConfig.displayMode === "once-per-day" &&
          announcementConfig.showDontShowAgainToday && (
            <label
              htmlFor="announcement-hide-today"
              className="flex items-center gap-2 mt-4 text-xs"
            >
              <input
                id="announcement-hide-today"
                type="checkbox"
                checked={dontShowAgainToday}
                onChange={(event) =>
                  setDontShowAgainToday(event.target.checked)
                }
                className="h-4 w-4 accent-primary"
              />
              <Label
                htmlFor="announcement-hide-today"
                className="cursor-pointer font-normal"
              >
                Don&apos;t show this again today
              </Label>
            </label>
          )}

        <DialogFooter className="flex-row justify-end gap-2">
          {/* <Button
            variant="secondary"
            className="text-white"
            onClick={handleRedirect}
          >
            Go to New Site
          </Button> */}
          <Button className="text-white" onClick={handleClose}>
            {template.readyLabel || "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
