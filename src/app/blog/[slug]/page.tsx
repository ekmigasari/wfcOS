import { notFound } from "next/navigation";

// import { CustomMDX } from "@/presentation/components/blog/mdx"; // We'll render HTML directly
import { formatDate, getBlogPosts } from "@/app/blog/utils";
import { baseUrl } from "@/app/sitemap";

export async function generateStaticParams() {
  const posts = await getBlogPosts(); // Updated to await

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = (await getBlogPosts()).find((post) => post.slug === slug);
  if (!post) {
    return;
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  const ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = (await getBlogPosts()).find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Work From Coffee", // Consider making this dynamic or configurable
            },
          }),
        }}
      />
      <article className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {post.metadata.title}
        </h1>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-8">
          {formatDate(post.metadata.publishedAt)}
        </div>
        <div
          className="prose dark:prose-invert prose-lg max-w-none
          prose-headings:font-semibold prose-headings:tracking-tight
          prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline
          prose-p:text-neutral-800 dark:prose-p:text-neutral-200
          prose-li:marker:text-neutral-800 dark:prose-li:marker:text-neutral-200
          prose-ul:list-disc prose-ul:pl-5
          prose-ol:list-decimal prose-ol:pl-5"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </section>
  );
}
