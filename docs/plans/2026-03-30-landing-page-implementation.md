# Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-quality public landing page for makealisting.com with SEO optimization, visual assets, and refreshed auth pages.

**Architecture:** Single-page scrollable landing at `/` with semantic HTML, SEO meta tags, JSON-LD structured data, and sitemap. Auth pages remain separate at `/auth/login` and `/auth/register` with updated styling. Visual assets generated via AI image generation and inline SVGs.

**Tech Stack:** SvelteKit 2, Svelte 5 (runes), Tailwind CSS v4, fal-ai (image generation), inline SVG icons

---

### Task 1: Generate Visual Assets

Generate all images needed for the landing page before building any UI.

**Files:**
- Create: `static/landing/hero-mockup.webp`
- Create: `static/landing/step-describe.webp`
- Create: `static/landing/step-generate.webp`
- Create: `static/landing/step-copy.webp`
- Create: `static/landing/og-image.png`

**Step 1: Generate hero device mockup**

Use fal-ai to generate a clean, professional image of a laptop screen showing a product listing generation interface. Prompt should emphasize: modern web app UI, blue color scheme, clean design, product listing with markdown, streaming text, white background. High resolution (1344x768 or similar landscape).

**Step 2: Generate "How it Works" illustrations**

Generate 3 illustrations in a consistent style:
1. "Describe" — person typing product description with photos nearby, warm inviting style
2. "Generate" — AI magic/sparkles transforming text into formatted listings, blue energy
3. "Copy & List" — multiple platform windows with checkmarks, satisfaction

Style: modern flat illustration, blue + amber palette, clean white backgrounds. Square format (~768x768).

**Step 3: Generate OG share image (1200x630)**

Create a branded social share card: "Make a Listing" title, tagline about AI listing generation, blue gradient background, clean typography feel. Exactly 1200x630.

**Step 4: Optimize images**

Convert all generated images to WebP format for hero/illustrations. Keep OG image as PNG (required by social platforms). Ensure all are under 200KB.

**Step 5: Commit**

```bash
git add static/landing/
git commit -m "feat: add landing page visual assets"
```

---

### Task 2: Create SVG Icons and Platform Logos

**Files:**
- Create: `src/lib/components/landing/icons.ts`

**Step 1: Create inline SVG icon components**

Create a single file exporting SVG strings for all icons needed:
- Platform logos: eBay, Poshmark, Mercari, Depop (simplified/stylized wordmarks)
- Feature icons: multi-platform (grid), AI-powered (sparkle/brain), free (gift/heart), upload (camera), smart-context (brain/doc), web-research (globe/search)
- Misc: arrow-right, check, menu, x (close)

Use simple, clean SVG paths. Each export is a raw SVG string that can be rendered with `{@html}`.

**Step 2: Commit**

```bash
git add src/lib/components/landing/
git commit -m "feat: add SVG icons for landing page"
```

---

### Task 3: Update Root Page Server Load

**Files:**
- Modify: `src/routes/+page.server.ts`

**Step 1: Replace redirect with data pass-through**

Current code redirects all users. Change to:
```typescript
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		authenticated: !!locals.user
	};
};
```

This lets the landing page render for everyone, with a flag to show "Go to App" vs "Get Started Free".

**Step 2: Verify dev server loads `/` without redirect**

Run: `npm run dev` and visit `http://localhost:5173/`
Expected: Page renders (even if blank) — no redirect to `/auth/login`

**Step 3: Commit**

```bash
git add src/routes/+page.server.ts
git commit -m "feat: replace root redirect with landing page data loader"
```

---

### Task 4: Build Landing Page Navigation Component

**Files:**
- Create: `src/lib/components/landing/LandingNav.svelte`

**Step 1: Build the sticky nav**

```svelte
<script lang="ts">
	let { authenticated = false }: { authenticated: boolean } = $props();

	let scrolled = $state(false);

	function onScroll() {
		scrolled = window.scrollY > 50;
	}
</script>

<svelte:window onscroll={onScroll} />

<header
	class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 {scrolled
		? 'bg-white/95 backdrop-blur-sm shadow-sm'
		: 'bg-transparent'}"
>
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
		<a href="/" class="flex items-center gap-2">
			<span class="text-xl font-bold text-blue-600">Make a Listing</span>
		</a>
		<div class="flex items-center gap-3">
			{#if authenticated}
				<a
					href="/app"
					class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
				>
					Go to App
				</a>
			{:else}
				<a
					href="/auth/login"
					class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
				>
					Sign In
				</a>
				<a
					href="/auth/register"
					class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
				>
					Get Started Free
				</a>
			{/if}
		</div>
	</nav>
</header>
```

**Step 2: Commit**

```bash
git add src/lib/components/landing/LandingNav.svelte
git commit -m "feat: add landing page navigation component"
```

---

### Task 5: Build Landing Page Hero Section

**Files:**
- Create: `src/lib/components/landing/HeroSection.svelte`

**Step 1: Build hero with headline, subheadline, CTA, and device mockup**

Key elements:
- `<h1>` with "Generate Listings for Every Platform in Seconds"
- Subheadline paragraph mentioning eBay, Poshmark, Mercari, Depop, AI, free with OpenRouter
- "Get Started Free" CTA button (links to `/auth/register`)
- Hero image: `static/landing/hero-mockup.webp` in a styled container with shadow/rounded corners
- Layout: stacked on mobile (text first, image below), side-by-side on lg+ (text left, image right)
- Top padding to account for fixed nav (~pt-24 mobile, pt-32 desktop)

**Step 2: Commit**

```bash
git add src/lib/components/landing/HeroSection.svelte
git commit -m "feat: add landing page hero section"
```

---

### Task 6: Build Platform Showcase Section

**Files:**
- Create: `src/lib/components/landing/PlatformShowcase.svelte`

**Step 1: Build platform logo row with tagline**

- Light gray background section (`bg-gray-50`)
- Row of platform names/logos: eBay, Poshmark, Mercari, Depop, +Custom
- Each displayed as a styled pill/badge or logo
- Tagline `<h2>`: "One description. Every platform. Perfectly formatted."
- Centered layout, responsive wrap on mobile

**Step 2: Commit**

```bash
git add src/lib/components/landing/PlatformShowcase.svelte
git commit -m "feat: add platform showcase section"
```

---

### Task 7: Build How It Works Section

**Files:**
- Create: `src/lib/components/landing/HowItWorks.svelte`

**Step 1: Build 3-step workflow section**

- `<h2>`: "How It Works"
- Three cards/steps with number, illustration, title, description:
  1. "Describe Your Product" — "Add photos, upload PDFs, and describe your item in your own words."
  2. "AI Generates Listings" — "Our AI creates optimized, keyword-rich listings tailored to each platform's style and rules."
  3. "Copy & List" — "Copy your ready-to-post listings and publish to eBay, Poshmark, Mercari, or Depop."
- Each step shows its `static/landing/step-*.webp` image
- Horizontal layout on desktop (3 columns), vertical stack on mobile
- Connecting line or numbered circles between steps

**Step 2: Commit**

```bash
git add src/lib/components/landing/HowItWorks.svelte
git commit -m "feat: add how it works section"
```

---

### Task 8: Build Features Grid Section

**Files:**
- Create: `src/lib/components/landing/FeaturesGrid.svelte`

**Step 1: Build 6-feature grid**

- Light gray background (`bg-gray-50`)
- `<h2>`: "Everything You Need to List Faster"
- 6 feature cards, each with SVG icon, title, description:
  1. **Multi-Platform** — "Generate listings for eBay, Poshmark, Mercari, Depop, and custom platforms — all at once."
  2. **AI-Powered** — "Uses top AI models through OpenRouter for accurate, keyword-rich descriptions that sell."
  3. **Free Forever** — "No subscription fees. No per-listing charges. Bring your own OpenRouter API key and only pay for what you use."
  4. **Photos & PDFs** — "Upload product images and PDF documents. AI analyzes them for richer, more detailed listings."
  5. **Smart Context** — "Set your formatting rules once with a system prompt. Never lose your listing style again."
  6. **Web Research** — "AI searches the web to find accurate specs, retail prices, and product details automatically."
- Grid: 1 col on mobile, 2 cols on md, 3 cols on lg
- White card backgrounds with subtle border and hover shadow

**Step 2: Commit**

```bash
git add src/lib/components/landing/FeaturesGrid.svelte
git commit -m "feat: add features grid section"
```

---

### Task 9: Build Trust Section

**Files:**
- Create: `src/lib/components/landing/TrustSection.svelte`

**Step 1: Build social proof / trust section**

- White background
- `<h2>`: "Built by Resellers, for Resellers"
- Origin story paragraph: "We got tired of re-explaining formatting rules to ChatGPT every time we needed a listing. So we built Make a Listing — a tool that never forgets your context, generates for every platform at once, and costs nothing to use."
- Optional: quote-style testimonial placeholder with visual styling
- Clean, centered layout with max-w-3xl

**Step 2: Commit**

```bash
git add src/lib/components/landing/TrustSection.svelte
git commit -m "feat: add trust/social proof section"
```

---

### Task 10: Build Bottom CTA and Footer

**Files:**
- Create: `src/lib/components/landing/BottomCTA.svelte`
- Create: `src/lib/components/landing/LandingFooter.svelte`

**Step 1: Build bottom CTA**

- Blue gradient background (`bg-gradient-to-r from-blue-600 to-blue-700`)
- White text `<h2>`: "Ready to List Smarter?"
- Subtext: "Join resellers who are saving hours on every listing."
- "Get Started Free" button (white bg, blue text — inverted from nav CTA)
- Accepts `authenticated` prop to show "Go to App" if logged in

**Step 2: Build footer**

- Dark background (`bg-gray-900`, white text)
- Left: "© 2026 Make a Listing"
- Center/Right: "Made with love for the reseller community"
- Minimal links row if needed (can add Privacy/Terms later)

**Step 3: Commit**

```bash
git add src/lib/components/landing/BottomCTA.svelte src/lib/components/landing/LandingFooter.svelte
git commit -m "feat: add bottom CTA and footer components"
```

---

### Task 11: Assemble Landing Page

**Files:**
- Modify: `src/routes/+page.svelte`

**Step 1: Replace redirect text with full landing page**

Import and compose all landing components:
```svelte
<script lang="ts">
	import LandingNav from '$lib/components/landing/LandingNav.svelte';
	import HeroSection from '$lib/components/landing/HeroSection.svelte';
	import PlatformShowcase from '$lib/components/landing/PlatformShowcase.svelte';
	import HowItWorks from '$lib/components/landing/HowItWorks.svelte';
	import FeaturesGrid from '$lib/components/landing/FeaturesGrid.svelte';
	import TrustSection from '$lib/components/landing/TrustSection.svelte';
	import BottomCTA from '$lib/components/landing/BottomCTA.svelte';
	import LandingFooter from '$lib/components/landing/LandingFooter.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<!-- SEO meta tags, OG tags, JSON-LD structured data -->
</svelte:head>

<LandingNav authenticated={data.authenticated} />
<main>
	<HeroSection />
	<PlatformShowcase />
	<HowItWorks />
	<FeaturesGrid />
	<TrustSection />
	<BottomCTA authenticated={data.authenticated} />
</main>
<LandingFooter />
```

**Step 2: Add SEO `<svelte:head>` content**

Inside `<svelte:head>`:
- `<title>Make a Listing — Free AI Listing Generator for eBay, Poshmark, Mercari & Depop</title>`
- `<meta name="description" content="...">`
- `<link rel="canonical" href="https://makealisting.com">`
- OG tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`
- Twitter card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- JSON-LD `<script type="application/ld+json">` with SoftwareApplication + Organization schemas

**Step 3: Verify in browser**

Run: `npm run dev` and verify full page renders at `/`
Check: all sections visible, responsive on mobile, nav works, CTAs link correctly

**Step 4: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "feat: assemble landing page with SEO meta tags"
```

---

### Task 12: Add Sitemap

**Files:**
- Create: `src/routes/sitemap.xml/+server.ts`

**Step 1: Create sitemap endpoint**

```typescript
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const pages = [
		{ url: 'https://makealisting.com/', priority: '1.0', changefreq: 'weekly' },
		{ url: 'https://makealisting.com/auth/register', priority: '0.5', changefreq: 'monthly' },
		{ url: 'https://makealisting.com/auth/login', priority: '0.3', changefreq: 'monthly' }
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
```

**Step 2: Update robots.txt**

Add sitemap reference:
```
User-agent: *
Disallow:
Disallow: /app/
Disallow: /api/

Sitemap: https://makealisting.com/sitemap.xml
```

Note: also disallow `/app/` and `/api/` — these are authenticated/API routes that search engines shouldn't index.

**Step 3: Verify**

Run: `npm run dev` and visit `http://localhost:5173/sitemap.xml`
Expected: Valid XML sitemap

**Step 4: Commit**

```bash
git add src/routes/sitemap.xml/ static/robots.txt
git commit -m "feat: add sitemap.xml and update robots.txt"
```

---

### Task 13: Refresh Auth Page Styling

**Files:**
- Modify: `src/routes/auth/login/+page.svelte`
- Modify: `src/routes/auth/register/+page.svelte`

**Step 1: Update login page**

Add:
- "Make a Listing" logo/wordmark at top (linked to `/`)
- Subtext below logo: "Free AI listing generator for resellers"
- Keep the existing form logic intact
- Add "Back to homepage" link
- Match the landing page's blue + white aesthetic
- Wrap in a centered card with subtle shadow on desktop

**Step 2: Update register page**

Same treatment as login:
- Logo + tagline at top
- Centered card layout
- "Back to homepage" link
- Existing form logic preserved

**Step 3: Verify both pages**

Run: `npm run dev` and check both `/auth/login` and `/auth/register`
Expected: Both render with new styling, forms still work

**Step 4: Commit**

```bash
git add src/routes/auth/login/+page.svelte src/routes/auth/register/+page.svelte
git commit -m "feat: refresh auth page styling to match landing page"
```

---

### Task 14: Build Verification & Polish

**Step 1: Run build**

```bash
npm run build
```

Expected: Clean build with no errors

**Step 2: Test all routes**

Verify in dev server:
- `/` — Landing page loads, all sections visible, responsive
- `/auth/login` — Updated styling, form works
- `/auth/register` — Updated styling, form works
- `/sitemap.xml` — Valid XML
- `/app` — Still works for authenticated users
- Navigation between landing → auth → back works

**Step 3: Run existing tests**

```bash
npx vitest run
```

Expected: All 30 existing tests still pass

**Step 4: Lighthouse check**

Run Lighthouse in Chrome DevTools on the landing page:
- Performance: target 90+
- SEO: target 95+
- Accessibility: target 90+
- Best Practices: target 90+

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: landing page polish and build verification"
```
