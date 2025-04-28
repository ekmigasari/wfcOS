import { AppsIcons } from "@/components/apps";
import { Mainmenu } from "@/components/layout/mainmenu";
import DesktopBackground from "@/presentation/components/shared/desktop-background/desktop-background";

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <DesktopBackground />
      <div className="h-full w-full flex flex-col p-4 md:p-5 lg:p-6">
        <Mainmenu />
        <div className="flex-1 relative">
          <AppsIcons />
        </div>
      </div>
    </div>
  );
}
