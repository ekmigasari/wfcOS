export type AdThumbnail =
  | {
      type: "emoji";
      content: string;
    }
  | {
      type: "image";
      content: string;
    };

export type AdItem = {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbnail: AdThumbnail;
};

export const adsPopupSettings = {
  enabled: true,
  showCloseButton: false,
  displayDurationMs: 8000,
  transitionDurationMs: 1000,
  reappearDurationMs: 600000,
} as const;

export const adData: AdItem[] = [
  // {
  //   id: 1,
  //   title: "Dazzboard App",
  //   description: "A better way to manage your projects and clients",
  //   url: "https://dazzboard.co",
  //   thumbnail: {
  //     type: "image",
  //     content: "/ads/dazzboard.png",
  //   },
  // },
  {
    id: 2,
    title: "Promote Your Product",
    description: "Showcase your product to remote workers",
    url: "https://tally.so/r/QK0NQ8",
    thumbnail: {
      type: "image",
      content: "/icons/search.png",
    },
  },
  {
    id: 3,
    title: "Work From Coffee",
    description: "Find Work Friendly Coffee Shops near you.",
    url: "https://workfromcoffee.com",
    thumbnail: {
      type: "emoji",
      content: "☕",
    },
  },
  {
    id: 4,
    title: "WFC Community",
    description: "Let's join and connect with other remote workers.",
    url: "https://discord.gg/yPQ62P5BBr",
    thumbnail: {
      type: "image",
      content: "/icons/doughnut.png",
    },
  },
  {
    id: 5,
    title: "GitHub Repository",
    description: "Follow and contribute to WFC OS open source project",
    url: "https://github.com/ekmigasari/wfcOS.git",
    thumbnail: {
      type: "emoji",
      content: "🛠️",
    },
  },
];
