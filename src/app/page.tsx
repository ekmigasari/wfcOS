import { AppsIcons } from "@/components/apps";
import { Mainmenu } from "@/components/layout/mainmenu";
import DesktopBackground from "@/components/layout/desktop-background";

export default function Home() {
  return (
    <div className="m-6">
      <DesktopBackground />
      <Mainmenu />
      <AppsIcons />
    </div>
  );
}
