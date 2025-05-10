import { Navbar } from "@/presentation/components/blog/nav";

import Footer from "@/presentation/components/blog/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center">
      <div className="antialiased w-full max-w-3xl flex-auto min-w-0 flex flex-col px-2 md:px-0 mt-12">
        <Navbar />
        {children}
        <Footer />
      </div>
    </main>
  );
}
