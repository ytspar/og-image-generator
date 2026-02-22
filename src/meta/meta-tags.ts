import type { MetaTagsConfig, MetaTagsResult, MetaTag } from "../types.js";

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function resolveUrl(imageUrl: string, baseUrl?: string): string {
  if (!baseUrl || imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  // Resolve relative URL against base
  const base = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  const image = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  return new URL(image, base).href;
}

export function generateMetaTags(config: MetaTagsConfig): MetaTagsResult {
  const imageUrl = resolveUrl(config.imageUrl, config.url);
  const width = config.imageWidth ?? 1200;
  const height = config.imageHeight ?? 630;

  const tags: MetaTag[] = [];

  // Open Graph tags
  tags.push({
    tag: "meta",
    attributes: { property: "og:type", content: "website" },
  });
  tags.push({
    tag: "meta",
    attributes: { property: "og:title", content: config.title },
  });

  if (config.description) {
    tags.push({
      tag: "meta",
      attributes: { property: "og:description", content: config.description },
    });
  }

  if (config.url) {
    tags.push({
      tag: "meta",
      attributes: { property: "og:url", content: config.url },
    });
  }

  tags.push({
    tag: "meta",
    attributes: { property: "og:image", content: imageUrl },
  });
  tags.push({
    tag: "meta",
    attributes: { property: "og:image:width", content: String(width) },
  });
  tags.push({
    tag: "meta",
    attributes: { property: "og:image:height", content: String(height) },
  });
  tags.push({
    tag: "meta",
    attributes: { property: "og:image:type", content: "image/png" },
  });

  if (config.siteName) {
    tags.push({
      tag: "meta",
      attributes: { property: "og:site_name", content: config.siteName },
    });
  }

  if (config.locale) {
    tags.push({
      tag: "meta",
      attributes: { property: "og:locale", content: config.locale },
    });
  }

  // Twitter Card tags
  tags.push({
    tag: "meta",
    attributes: { name: "twitter:card", content: "summary_large_image" },
  });
  tags.push({
    tag: "meta",
    attributes: { name: "twitter:title", content: config.title },
  });

  if (config.description) {
    tags.push({
      tag: "meta",
      attributes: {
        name: "twitter:description",
        content: config.description,
      },
    });
  }

  tags.push({
    tag: "meta",
    attributes: { name: "twitter:image", content: imageUrl },
  });

  // Generate HTML
  const html = tags
    .map((tag) => {
      const attrs = Object.entries(tag.attributes)
        .map(([key, value]) => `${key}="${escapeHtmlAttr(value)}"`)
        .join(" ");
      return `<${tag.tag} ${attrs}/>`;
    })
    .join("\n");

  return { html, tags };
}
