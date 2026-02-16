# Blink Documentation

This is the official documentation site for Blink, built with [Docus](https://docus.dev/).

## Features

- 📚 **Complete Documentation** - Getting started guides, configuration, and API reference
- 🔍 **Full-Text Search** - Powered by Docus search
- 🌙 **Dark Mode** - Automatic theme switching
- 🤖 **AI Integration** - MCP server at `/mcp` for AI tools
- 📄 **LLM Ready** - Auto-generated `llms.txt` for AI assistants
- ⚡ **Fast** - Built on Nuxt 4 with SSR and optimized builds

## Getting Started

### Development

From the project root:

```bash
npm run docs:dev
```

Or from this directory:

```bash
npm run dev
```

The documentation will be available at `http://localhost:3000`

### Building

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Documentation Structure

```
content/
├── index.md                        # Landing page
├── 1.getting-started/
│   ├── 1.introduction.md          # What is Blink
│   └── 2.installation.md          # Installation guide
├── 2.guide/
│   ├── 1.configuration.md         # Configuration options
│   ├── 2.file-transfers.md        # File transfer guide
│   └── 3.deployment.md            # Deployment guide
└── 3.api/
    └── 1.reference.md             # Type reference
```

## Customization

### Update Site Config

Edit `app/app.config.ts`:

```typescript
export default defineAppConfig({
  docus: {
    name: 'Blink',
    description: 'Your description',
    url: 'https://your-domain.com',
    socials: {
      github: 'your-org/your-repo'
    }
  }
})
```

### Add New Pages

Create new `.md` files in the `content/` directory:

```markdown
---
title: Your Page Title
description: Page description for SEO
---

# Your Page Title

Your content here using MDC (Markdown Components).
```

### Customize Theme

Create `app/assets/css/main.css` to override default styles.

## AI Integration

### MCP Server

The documentation automatically includes an MCP server endpoint at `/mcp` for AI tools and assistants.

### llms.txt

An `llms.txt` file is auto-generated at `/llms.txt` for LLM consumption of the documentation.

## Deployment

The documentation can be deployed to any platform that supports Nuxt:

- **Vercel**: `vercel --prod`
- **Netlify**: `npm run generate` → deploy `.output/public`
- **Railway**: `railway up`

See the [deployment guide](./content/2.guide/3.deployment.md) for more details.

## Learn More

- [Docus Documentation](https://docus.dev/)
- [Nuxt Documentation](https://nuxt.com/)
- [MDC Syntax](https://content.nuxt.com/usage/markdown)
