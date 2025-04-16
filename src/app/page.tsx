import { AppsIcons } from "@/components/apps";
import { Mainmenu } from "@/components/layout/mainmenu";

export default function Home() {
  return (
    <div className="m-6">
      <Mainmenu />
      <AppsIcons />
    </div>
  );
}
