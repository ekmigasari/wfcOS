

interface CustomMDXProps {
  content: string;
}

// Custom component to render the HTML from MDX content with handling for images
export function CustomMDX({ content }: CustomMDXProps) {
  // Replace Image components to regular img tags with appropriate classes
  // This is a simplistic approach - a more sophisticated MDX solution would be better long-term
  const processedContent = content
    // Convert Image components to regular img tags with appropriate classes
    .replace(
      /<Image\s+src="([^"]+)"\s+alt="([^"]*)"\s+width=\{(\d+)\}\s+height=\{(\d+)\}\s*\/>/g,
      `<div class="my-8 flex justify-center">
        <img src="$1" alt="$2" width="$3" height="$4" class="rounded-lg shadow-md" />
      </div>`
    )
    // Convert internal links to Next.js Link components
    .replace(
      /<a href="\/blog\/([^"]+)">([^<]+)<\/a>/g,
      `<a href="/blog/$1" class="text-blue-600 hover:underline">$2</a>`
    );

  return (
    <div
      className="prose dark:prose-invert prose-lg max-w-none
        prose-headings:font-semibold prose-headings:tracking-tight
        prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline
        prose-p:text-neutral-800 dark:prose-p:text-neutral-200
        prose-li:marker:text-neutral-800 dark:prose-li:marker:text-neutral-200
        prose-ul:list-disc prose-ul:pl-5
        prose-ol:list-decimal prose-ol:pl-5
        prose-img:mx-auto prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
