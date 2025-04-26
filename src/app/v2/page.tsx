import { DesktopIcons } from "@/presentation/components/shared/app-icons/DesktopIcons";
import { Taskbar } from "@/presentation/components/shared/taskbar";

export default function Page() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Desktop Background */}
      <div className="h-full w-full flex flex-col p-4 md:p-5 lg:p-6">
        <Taskbar />
        <div className="flex-1 relative">
          <DesktopIcons />
        </div>
      </div>
    </div>
  );
}
