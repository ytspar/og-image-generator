# og-image-generator

Generate Open Graph images for link previews on social platforms. Composes an SVG template, rasterizes to a compressed PNG via [resvg](https://github.com/nickytonline/resvg-js) + [sharp](https://sharp.pixelplumbing.com/), and optionally emits HTML meta tags.

## Install

```bash
npm install og-image-generator
```

## Quick start

### CLI

```bash
# Minimal — just a project name
npx og-image-generator generate --name "My Project"

# Full options
npx og-image-generator generate \
  --name "hetzner-cli" \
  --tagline "A modern CLI for Hetzner Cloud" \
  --features Servers Firewalls "Load Balancers" \
  --footer "github.com/hetzner/cli" \
  --preset terminal \
  --accent "#d50c2d" \
  -o og-image.png \
  --svg \
  --meta \
  --image-url "https://hetzner.github.io/cli/og-image.png"

# From a JSON config file
npx og-image-generator generate --config og-image.json
```

### Node.js API

```ts
import { generate, generateMetaTags } from "og-image-generator";
import { writeFile } from "node:fs/promises";

const result = await generate({
  name: "My Project",
  tagline: "A fast and reliable tool",
  features: ["TypeScript", "CLI", "Extensible"],
  footer: "github.com/me/my-project",
  style: { preset: "terminal" },
});

await writeFile("og-image.png", result.png);
console.log(`${result.width}x${result.height}, ${result.pngSize} bytes`);

// Generate meta tags for your HTML <head>
const meta = generateMetaTags({
  title: "My Project",
  description: "A fast and reliable tool",
  url: "https://my-project.dev",
  imageUrl: "https://my-project.dev/og-image.png",
});

console.log(meta.html);
// <meta property="og:type" content="website"/>
// <meta property="og:title" content="My Project"/>
// ...
```

## CLI reference

### `og-image generate` / `og-image-generator generate`

Generate a 1200x630 PNG image.

| Flag | Description |
|------|-------------|
| `--name <name>` | Project name displayed in the image (required unless `--config`) |
| `--tagline <text>` | Short tagline below the project name |
| `--description <text>` | Page description (meta tags only, not rendered in image) |
| `--features <words...>` | Feature keywords shown in a row (e.g. `--features Fast Secure`) |
| `--footer <text>` | Footer text, typically a URL or version |
| `--preset <name>` | Style preset — sets decorations and colors (see `og-image presets`) |
| `--bg <color>` | Background hex color (default: `#0a0a0a`) |
| `--accent <color>` | Accent hex color for the project name (default: `#22d3ee`) |
| `--logo-svg <path>` | Path to an SVG file to render as the logo |
| `--font <path>` | Path to a custom font file (TTF, OTF, or WOFF2) |
| `-o, --output <path>` | Output PNG path (default: `og-image.png`) |
| `--svg` | Also write the raw SVG file alongside the PNG |
| `--meta` | Print Open Graph + Twitter Card meta tags to stdout |
| `--url <url>` | Canonical page URL (included in meta tags) |
| `--image-url <url>` | Public URL where the image will be hosted (for `og:image`) |
| `--config <path>` | Path to a JSON config file (all other flags are ignored) |

### `og-image presets` / `og-image-generator presets`

List all registered style presets with their descriptions and decoration details.

## JSON config file

Instead of CLI flags, you can provide a JSON file with `--config`:

```json
{
  "name": "hetzner-cli",
  "tagline": "A modern CLI for Hetzner Cloud",
  "description": "Manage Hetzner Cloud resources from your terminal",
  "features": ["Servers", "Firewalls", "Load Balancers", "SSH Keys"],
  "footer": "github.com/hetzner/cli",
  "url": "https://hetzner.github.io/cli",
  "imageUrl": "https://hetzner.github.io/cli/og-image.png",
  "colors": {
    "background": "#0a0a0a",
    "accent": "#d50c2d",
    "dim": "#a1a1aa",
    "text": "#fafafa"
  },
  "style": {
    "preset": "terminal"
  }
}
```

All fields except `name` are optional. See the [Configuration](#configuration) section for the full schema.

## Configuration

### `OgImageConfig`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | (required) | Project name displayed in the image |
| `tagline` | `string` | — | Short tagline below the name |
| `description` | `string` | — | Description for meta tags (not rendered in image) |
| `features` | `string[]` | — | Keywords shown as a horizontal row with `\|` separators |
| `footer` | `string` | — | Footer text pinned to the bottom |
| `url` | `string` | — | Canonical page URL (for meta tags) |
| `imageUrl` | `string` | — | Public URL where the generated image is hosted (for meta tags) |
| `logo` | `LogoConfig` | — | Logo configuration (see [Logos](#logos)) |
| `colors` | `ColorConfig` | (see below) | Color overrides |
| `font` | `FontConfig` | bundled Inter | Custom font (see [Fonts](#fonts)) |
| `style` | `StyleConfig` | `{ preset: "minimal" }` | Style decorations and preset (see [Style & presets](#style--presets)) |
| `width` | `number` | `1200` | Image width in pixels |
| `height` | `number` | `630` | Image height in pixels |

### `ColorConfig`

| Field | Default | Description |
|-------|---------|-------------|
| `background` | `#0a0a0a` | Background fill |
| `accent` | `#22d3ee` | Project name and glow highlight |
| `dim` | `#a1a1aa` | Secondary text (tagline, features, footer) |
| `text` | `#fafafa` | Primary text and logo text |

### `FontConfig`

| Field | Default | Description |
|-------|---------|-------------|
| `path` | bundled Inter Regular | Path to regular weight font file (TTF, OTF, or WOFF2) |
| `boldPath` | bundled Inter Bold | Path to bold weight font file |
| `family` | `"Inter"` | CSS font-family name (must match the loaded font) |

The bundled [Inter](https://rsms.me/inter/) font (SIL OFL license) is used by default. To use a custom font, provide the file path — `resvg` loads fonts from buffers, so any TTF/OTF/WOFF2 file works.

## Logos

Three logo modes are supported:

### Inline SVG

Embed SVG elements directly:

```ts
await generate({
  name: "My App",
  logo: {
    type: "svg-inline",
    content: '<circle cx="50" cy="50" r="50" fill="#22d3ee"/>',
    viewBox: "0 0 100 100",
  },
});
```

### SVG file

Load from a file path. Optionally extract a specific `<g>` by its `id`:

```ts
await generate({
  name: "My App",
  logo: {
    type: "svg-file",
    path: "./logo.svg",
    selector: "wordmark", // extracts <g id="wordmark">
  },
});
```

From the CLI: `--logo-svg ./logo.svg`

### Text fallback

Render text as the logo (uses the configured font):

```ts
await generate({
  name: "My App",
  logo: { type: "text", text: "MA" },
});
```

## Style & presets

The `style` field controls decorative overlays and sets a base preset.

### `StyleConfig`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `preset` | `string \| Preset` | `"minimal"` | Base preset (see below) |
| `scanlines` | `boolean \| { opacity }` | from preset | Horizontal scanline overlay |
| `cornerBrackets` | `boolean \| { opacity, strokeWidth }` | from preset | Pixel-art corner frame |
| `radialGlow` | `boolean \| { opacity, cy, r }` | from preset | Radial gradient glow behind logo |

Explicit fields always override the preset. For example, `{ preset: "terminal", scanlines: false }` uses the terminal preset but disables scanlines.

### Built-in presets

| Preset | Scanlines | Corner brackets | Radial glow | Description |
|--------|-----------|----------------|-------------|-------------|
| `minimal` | off | off | on (0.15) | Clean, modern. Default. |
| `terminal` | on (0.03) | on (0.15, 2px) | on (0.15) | Retro terminal aesthetic |

List them from the CLI:

```bash
npx og-image-generator presets
```

### Custom presets

Presets are plain objects that bundle decorations and optional colors. There are three ways to use them:

#### 1. Inline preset object (no registration)

Pass a `Preset` object directly — works in the Node.js API without any registration:

```ts
import { generate, definePreset } from "og-image-generator";

const neon = definePreset({
  name: "neon",
  description: "Vibrant neon glow on dark background",
  colors: {
    background: "#0d0221",
    accent: "#ff00ff",
    dim: "#b967ff",
    text: "#fffce1",
  },
  scanlines: { opacity: 0.04 },
  cornerBrackets: false,
  radialGlow: { opacity: 0.25, cy: "40%", r: "55%" },
});

await generate({
  name: "My Project",
  style: { preset: neon },
});
```

#### 2. Register for name-based lookup

Register a preset so it can be referenced by string name in JSON config files and the CLI:

```ts
import { definePreset, registerPreset } from "og-image-generator";

const corporate = definePreset({
  name: "corporate",
  description: "Clean corporate look with light background",
  colors: {
    background: "#ffffff",
    accent: "#0066cc",
    dim: "#666666",
    text: "#111111",
  },
  scanlines: false,
  cornerBrackets: false,
  radialGlow: { opacity: 0.08 },
});

registerPreset(corporate);
```

Now usable as:

```json
{ "style": { "preset": "corporate" } }
```

```bash
npx og-image-generator generate --name "Acme Corp" --preset corporate
```

> **Note:** `registerPreset` must be called before `generate` — it modifies the in-process registry. For CLI usage, register presets in a wrapper script that imports the CLI.

#### 3. Preset with per-project overrides

A preset provides defaults, but explicit `colors` and `style` fields on the config always take precedence:

```ts
await generate({
  name: "My Fork",
  style: { preset: "terminal", scanlines: false },
  colors: { accent: "#ff6600" }, // overrides preset accent
});
```

**Layering order:** defaults -> preset colors -> config colors (rightmost wins).

#### Preset interface

```ts
interface Preset {
  name: string;
  description?: string;
  colors?: {
    background?: string;
    accent?: string;
    dim?: string;
    text?: string;
  };
  scanlines?: boolean | { opacity?: number };
  cornerBrackets?: boolean | { opacity?: number; strokeWidth?: number };
  radialGlow?: boolean | { opacity?: number; cy?: string; r?: string };
}
```

#### Preset API functions

| Function | Description |
|----------|-------------|
| `definePreset(preset)` | Type-safe factory — validates shape, returns the object |
| `registerPreset(preset)` | Register for name-based lookup (CLI, JSON config) |
| `getPreset(name)` | Look up a registered preset by name |
| `listPresets()` | List registered preset names |
| `listPresetDetails()` | List registered presets with full definitions |
| `resolvePreset(ref)` | Resolve a `string \| Preset \| undefined` to a `Preset` |
| `minimal` | Built-in minimal preset (exported constant) |
| `terminal` | Built-in terminal preset (exported constant) |

## Meta tags

Generate Open Graph and Twitter Card `<meta>` tags for your HTML `<head>`:

```ts
import { generateMetaTags } from "og-image-generator";

const meta = generateMetaTags({
  title: "My Project",
  description: "A fast and reliable tool",
  url: "https://my-project.dev",
  imageUrl: "https://my-project.dev/og-image.png",
  siteName: "My Project",
  locale: "en_US",
});

// meta.html — ready-to-paste HTML string
// meta.tags — structured array of { tag, attributes } objects
```

### Generated tags

| Tag | Property |
|-----|----------|
| Open Graph | `og:type`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:width`, `og:image:height`, `og:image:type` |
| Open Graph (optional) | `og:site_name`, `og:locale` |
| Twitter Card | `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` |

All attribute values are HTML-escaped. Relative `imageUrl` values are resolved against `url`.

From the CLI, add `--meta` to print meta tags to stdout:

```bash
npx og-image-generator generate --name "My Project" --meta --image-url "https://example.com/og.png"
```

### `MetaTagsConfig`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | `string` | (required) | Page title |
| `description` | `string` | — | Page description |
| `url` | `string` | — | Canonical page URL |
| `imageUrl` | `string` | (required) | URL to the OG image |
| `imageWidth` | `number` | `1200` | Image width |
| `imageHeight` | `number` | `630` | Image height |
| `siteName` | `string` | — | Site name |
| `locale` | `string` | — | Locale (e.g. `en_US`) |

## Node.js API

### `generate(config): Promise<GenerateResult>`

The main entry point. Builds an SVG, rasterizes to PNG via resvg, compresses with sharp, and returns both.

```ts
import { generate } from "og-image-generator";

const result = await generate({
  name: "My Project",
  tagline: "A cool tool",
});

// result.svg   — raw SVG string (useful for debugging)
// result.png   — compressed PNG Buffer
// result.pngSize — PNG file size in bytes
// result.width  — 1200
// result.height — 630
```

### `buildSvg(config): string`

Build just the SVG string without rasterizing. Useful for previewing or debugging templates:

```ts
import { buildSvg } from "og-image-generator";

const svg = buildSvg({ name: "Test", style: { preset: "terminal" } });
```

### `compressPng(buffer, options?): Promise<Buffer>`

Compress a PNG buffer using sharp. Used internally by `generate`, but exposed for custom pipelines:

```ts
import { compressPng } from "og-image-generator";

const compressed = await compressPng(rawPngBuffer, {
  compressionLevel: 9, // 0-9, default: 9
  palette: true,       // palette quantization, default: true
  colors: 256,         // palette colors, default: 256
});
```

### Font utilities

```ts
import {
  getBundledFontPaths,
  loadFontBuffers,
  getFontFamily,
} from "og-image-generator";

// Get paths to bundled Inter font files
const paths = getBundledFontPaths();
// { regular: "/path/to/Inter-Regular.woff2", bold: "/path/to/Inter-Bold.woff2" }

// Load font buffers (with optional custom paths)
const buffers = await loadFontBuffers({ path: "./MyFont.woff2" });

// Get font family name
const family = getFontFamily({ family: "Departure Mono" }); // "Departure Mono"
const defaultFamily = getFontFamily(); // "Inter"
```

### SVG utilities

```ts
import {
  escapeSvgText,
  truncateText,
  estimateTextWidth,
  maxCharsForWidth,
  extractSvgContent,
} from "og-image-generator";

escapeSvgText('A & B <C>');       // "A &amp; B &lt;C&gt;"
truncateText("Hello World", 6);   // "Hello\u2026"
estimateTextWidth("hello", 16);   // 44 (5 * 16 * 0.55)
maxCharsForWidth(1040, 52);       // 36

// Extract SVG content from a file (optionally by group id)
const logo = await extractSvgContent("./logo.svg", "wordmark");
// { content, viewBox, width, height }
```

## Fonts

The package bundles [Inter](https://rsms.me/inter/) (Regular + Bold, WOFF2, ~280KB total) under the SIL Open Font License. Inter is used by default for all text rendering.

To use a custom font:

```ts
await generate({
  name: "My Project",
  font: {
    path: "./fonts/DepartureMono-Regular.woff2",
    boldPath: "./fonts/DepartureMono-Bold.woff2",
    family: "Departure Mono",
  },
});
```

From the CLI: `--font ./fonts/DepartureMono-Regular.woff2`

> **Note:** resvg does not support CSS `@font-face` — fonts are loaded as binary buffers and passed directly to the renderer. Any TTF, OTF, or WOFF2 file works.

## How it works

1. **SVG composition** — `buildSvg()` assembles an SVG document from the config: background, optional decorations (glow, scanlines, brackets), logo, name, tagline, features, footer
2. **Font loading** — Reads font files as buffers (bundled Inter or custom)
3. **Rasterization** — [resvg](https://github.com/nickytonline/resvg-js) renders the SVG to a raw PNG using the font buffers
4. **Compression** — [sharp](https://sharp.pixelplumbing.com/) applies palette quantization and maximum compression (typically ~20-30KB for flat-color images)
5. **Meta tags** — `generateMetaTags()` produces both Open Graph and Twitter Card tags with proper escaping and URL resolution

## License

MIT
