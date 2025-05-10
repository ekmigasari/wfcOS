import { BlogPosts } from "@/presentation/components/blog/post";

export const metadata = {
  title: "Blog | Work From Coffee",
  description: "Explore insights, updates, and stories about Work From Coffee.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Blog</h1>
      <BlogPosts />
    </section>
  );
}
