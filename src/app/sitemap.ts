import { getBlogPosts } from "./blog/utils";

export const baseUrl = "https://portfolio-blog-starter.vercel.app";

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

type BlogPost = {
  metadata: Metadata;
  slug: string;
  content: string; // Even though content is not used here, it's part of the type.
};

export default async function sitemap() {
  let blogs = getBlogPosts().map((post: BlogPost) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  let routes = ["", "/blog"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs];
}
