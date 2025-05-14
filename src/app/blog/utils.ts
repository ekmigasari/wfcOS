import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";
import remarkMdxImages from "remark-mdx-images";

interface Metadata {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
}

function parseFrontmatter(fileContent: string) {
  const { data, content } = matter(fileContent);
  return { metadata: data as Metadata, content };
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  return parseFrontmatter(rawContent);
}

// Function to process image components
function processImageComponents(content: string): string {
  return content.replace(
    /<Image\s+src="([^"]+)"\s+alt="([^"]*)"\s+width=\{(\d+)\}\s+height=\{(\d+)\}\s*\/>/g,
    `<div class="my-8 flex justify-center">
      <img src="$1" alt="$2" width="$3" height="$4" class="rounded-lg shadow-md" />
    </div>`
  );
}

// Function to ensure list HTML has proper markup
function enhanceListMarkup(html: string): string {
  // Enhance unordered lists
  let enhancedHtml = html.replace(
    /<ul>/g,
    '<ul class="list-disc pl-5 space-y-2 my-4">'
  );

  // Enhance ordered lists
  enhancedHtml = enhancedHtml.replace(
    /<ol>/g,
    '<ol class="list-decimal pl-5 space-y-2 my-4">'
  );

  // Enhance list items
  enhancedHtml = enhancedHtml.replace(/<li>/g, '<li class="ml-2">');

  return enhancedHtml;
}

async function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);
  const processedFiles = await Promise.all(
    mdxFiles.map(async (file) => {
      const { metadata, content } = readMDXFile(path.join(dir, file));
      const slug = path.basename(file, path.extname(file));

      // Process and extract Image components first
      const processedImageContent = processImageComponents(content);

      // Process the markdown content
      const processedContent = await remark()
        .use(remarkGfm)
        .use(remarkMdxImages)
        .use(html, { sanitize: false })
        .process(processedImageContent);

      // Get the processed HTML and enhance list markup
      let contentHtml = processedContent.toString();
      contentHtml = enhanceListMarkup(contentHtml);

      return {
        metadata,
        slug,
        content: contentHtml,
      };
    })
  );
  return processedFiles;
}

export async function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), "src", "app", "blog", "post"));
}

export function formatDate(date: string, includeRelative = false) {
  const currentDate = new Date();
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  const targetDate = new Date(date);

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  const daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = "";

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  const fullDate = targetDate.toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (!includeRelative) {
    return fullDate;
  }

  return `${fullDate} (${formattedDate})`;
}
