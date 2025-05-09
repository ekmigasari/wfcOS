import Link from "next/link";
import { formatDate, getBlogPosts } from "@/app/blog/utils";

// Define the types based on src/app/blog/utils.ts
type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

type Post = {
  metadata: Metadata;
  slug: string;
  content: string; // HTML content
};

export async function BlogPosts() {
  const allBlogs: Post[] = await getBlogPosts();

  return (
    <div>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1;
          }
          return 1;
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="block py-6 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0 group"
            href={`/blog/${post.slug}`}
          >
            <div className="w-full">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-accent dark:group-hover:text-accent tracking-tight mb-2">
                {post.metadata.title}
              </h2>
              {post.metadata.summary && (
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {post.metadata.summary}
                </p>
              )}
            </div>
          </Link>
        ))}
    </div>
  );
}
