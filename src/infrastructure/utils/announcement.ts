import {
  loadFeatureState,
  saveFeatureState,
} from "@/infrastructure/utils/storage";

export interface AnnouncementTemplate {
  id: string;
  title: string;
  message: string;
  readyLabel?: string;
}

export interface AnnouncementConfig {
  enabled: boolean;
  templateMode: "selected" | "random";
  selectedTemplateId: string;
  displayMode: "every-visit" | "once-per-day";
  showDontShowAgainToday: boolean;
  templates: AnnouncementTemplate[];
}

interface AnnouncementDismissState {
  hiddenOnDate: string;
}

const ANNOUNCEMENT_DISMISS_KEY = "announcement.dismiss";

export const announcementConfig: AnnouncementConfig = {
  enabled: true,
  templateMode: "selected",
  selectedTemplateId: "welcome-monday",
  displayMode: "once-per-day",
  showDontShowAgainToday: true,
  templates: [
    // {
    //   id: "site-migration-notice",
    //   title: "New Website: os.workfromcoffee.com",
    //   message:
    //     "We are moving to os.workfromcoffee.com for better performance and improve our platform. Please make sure to move your data to the new website to continue enjoying our services. Thank you for using wfcOS",
    // },
    {
      id: "welcome-monday",
      title: "Good Morning",
      message:
        "A new day, a fresh desk, and one clear next step. Take a breath and start with the thing that matters most.",
      readyLabel: "Let's go",
    },
    {
      id: "build-momentum",
      title: "Momentum Card",
      message:
        "You do not need perfect conditions to make progress today. Small focused work still counts and it stacks fast.",
      readyLabel: "Ready",
    },
    {
      id: "gentle-reminder",
      title: "Gentle Reminder",
      message:
        "Close the extra tabs, pick one priority, and give it your full attention for the next session.",
      readyLabel: "Start focus",
    },
  ],
};

const getTodayKey = (): string => new Date().toISOString().slice(0, 10);

export const getActiveAnnouncementTemplate =
  (): AnnouncementTemplate | null => {
    if (!announcementConfig.templates.length) return null;

    if (announcementConfig.templateMode === "selected") {
      return (
        announcementConfig.templates.find(
          (template) => template.id === announcementConfig.selectedTemplateId,
        ) ?? announcementConfig.templates[0]
      );
    }

    const randomIndex = Math.floor(
      Math.random() * announcementConfig.templates.length,
    );
    return announcementConfig.templates[randomIndex];
  };

export const shouldShowAnnouncement = (): boolean => {
  if (!announcementConfig.enabled) return false;
  if (!announcementConfig.templates.length) return false;
  if (announcementConfig.displayMode === "every-visit") return true;

  const dismissState = loadFeatureState<AnnouncementDismissState>(
    ANNOUNCEMENT_DISMISS_KEY,
  );

  return dismissState?.hiddenOnDate !== getTodayKey();
};

export const hideAnnouncementForToday = (): boolean =>
  saveFeatureState<AnnouncementDismissState>(ANNOUNCEMENT_DISMISS_KEY, {
    hiddenOnDate: getTodayKey(),
  });
