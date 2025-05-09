import { Navbar } from "@/presentation/components/blog/nav";

import Footer from "@/presentation/components/blog/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="antialiased max-w-3xl mx-4 mt-12 lg:mx-auto flex-auto min-w-0 flex flex-col px-2 md:px-0">
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
