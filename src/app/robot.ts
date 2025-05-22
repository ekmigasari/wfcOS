import { baseUrl } from "./sitemap";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Add any disallow paths if needed
        // disallow: ["/admin/", "/private/"]
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
