import { AdsPopup } from "@/presentation/components/shared/ads/AdsPopup";
import { AnnouncementPopup } from "@/presentation/components/shared/announcement/AnnouncementPopup";
import { DesktopIcons } from "@/presentation/components/shared/app-icons/DesktopIcons";
import { DesktopBackground } from "@/presentation/components/shared/desktop-background/desktop-background";
import { StorageMigrationReceiver } from "@/presentation/components/shared/migration/StorageMigrationReceiver";
import { Taskbar } from "@/presentation/components/shared/taskbar";
import { Window } from "@/presentation/components/shared/window/Window";
export default function Page() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <DesktopBackground />
      <StorageMigrationReceiver />
      <Window />
      <div className="h-full w-full flex flex-col p-4 md:p-5 lg:p-6">
        <Taskbar />
        <div className="flex-1 relative">
          <DesktopIcons />
        </div>
      </div>
      <AnnouncementPopup />
      <AdsPopup />
    </div>
  );
}
