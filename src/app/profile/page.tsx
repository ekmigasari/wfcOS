import { auth } from "@/infrastructure/utils/auth";
import { SignOutButton } from "@/presentation/components/ui/sign-out-button";
import { headers } from "next/headers";
export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Not logged in</div>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 p-6">
        <h1>Profile</h1>
        <div className="">
          <SignOutButton />
        </div>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
}
