# Landing Page Design — Make a Listing

**Date:** 2026-03-30
**Status:** Approved

## Goal

Create a high-quality public landing page for makealisting.com that:
1. Converts search visitors looking for AI listing generators
2. Builds trust for word-of-mouth referrals from reseller communities
3. Establishes strong SEO foundation for organic growth

## Target Audience

- **Primary:** Resellers on eBay, Poshmark, Mercari, Depop looking for listing tools
- **Secondary:** Word-of-mouth referrals from reseller groups/communities

## Brand Personality

Professional & clean + friendly & approachable. Polished enough to convert strangers, warm enough for group chat shares.

## Architecture

### Routing Changes
- `/` — New public landing page (remove existing redirect)
- `/auth/login` — Existing, refreshed styling to match landing page
- `/auth/register` — Existing, refreshed styling to match landing page
- Root `+page.server.ts` — If authenticated, show "Go to App" instead of "Get Started"

### SEO Infrastructure
- OG + Twitter Card meta tags
- JSON-LD structured data (SoftwareApplication + Organization)
- Canonical URL: `https://makealisting.com`
- Sitemap at `/sitemap.xml`
- Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`)
- Proper heading hierarchy (single `<h1>`, `<h2>` per section)

### Target Keywords
- **Primary:** "AI listing generator", "eBay listing generator", "Poshmark listing generator"
- **Secondary:** "Mercari listing generator", "Depop listing generator", "multi-platform listing tool"
- **Long-tail:** "AI product description generator for resellers", "generate listings for multiple platforms"

## Page Sections

### 1. Navigation Bar (sticky)
- Logo + "Make a Listing" wordmark (left)
- "Sign In" link + "Get Started Free" button (right)
- Transparent on hero, solid on scroll

### 2. Hero Section
- **Headline:** "Generate Listings for Every Platform in Seconds"
- **Subheadline:** "Describe your product once. Get optimized listings for eBay, Poshmark, Mercari, and Depop — powered by AI. Free forever with your own OpenRouter key."
- **CTA:** "Get Started Free" button
- **Visual:** Device mockup showing the app generation interface

### 3. Platform Showcase
- Row of platform logos (eBay, Poshmark, Mercari, Depop) + "+Custom"
- Tagline: "One description. Every platform. Perfectly formatted."

### 4. How It Works (3 steps, illustrated)
1. "Describe Your Product" — text + photos + PDFs
2. "AI Generates Listings" — streaming/magic wand
3. "Copy & List" — clipboard/checkmark

### 5. Features Grid
- **Multi-Platform** — Generate for all selling platforms at once
- **AI-Powered** — Top AI models via OpenRouter
- **Free Forever** — No subscription, no per-listing fees. BYOK via OpenRouter
- **Upload Photos & PDFs** — AI analyzes images and documents
- **Smart Context** — System prompt persists formatting rules
- **Web Research** — AI searches web for accurate specs

### 6. Trust / Social Proof
- "Built by resellers, for resellers"
- Origin story: built to solve ChatGPT context-loss problem
- Testimonial slot for later

### 7. Bottom CTA
- "Ready to list smarter?" + "Get Started Free"

### 8. Footer
- Copyright, minimal links
- "Made with love for the reseller community"

## Visual Design

### Colors
- Primary blue: `#2563eb` (brand consistency)
- Warm accent: `#f59e0b` (amber/orange for CTAs)
- Light backgrounds: `#f9fafb` (alternating sections)
- White cards for features

### Typography
- System font stack (performance)
- Large bold headlines (4xl-5xl desktop, 3xl mobile)
- Comfortable body (text-lg, relaxed line-height)

### Assets Needed
- Hero device mockup (app screenshot in laptop/phone frame)
- 3 workflow illustrations (How it Works steps)
- Platform logos (eBay, Poshmark, Mercari, Depop) as SVG
- 6 feature icons (SVG)
- OG share image (1200x630)

### Layout
- Mobile-first vertical scroll, max-width ~1200px on desktop
- Generous whitespace, alternating backgrounds
- Hero: stacked mobile, side-by-side desktop
- Features: 1 col mobile, 2-3 col desktop
- How it works: vertical mobile, horizontal desktop

## SEO Details

### Meta Tags
```
title: "Make a Listing — Free AI Listing Generator for eBay, Poshmark, Mercari & Depop"
description: "Generate optimized product listings for multiple platforms in seconds. Describe your item once, get tailored listings for eBay, Poshmark, Mercari, and Depop. Free forever with your own OpenRouter API key."
```

### Structured Data
- `SoftwareApplication` schema (name, description, category, offers: free, OS: web)
- `Organization` schema

### Sitemap
- `/` — priority 1.0
- `/auth/login` — priority 0.3
- `/auth/register` — priority 0.5

### Performance
- SVG icons/illustrations (tiny size)
- Lazy-load below-fold images
- Minimal JS on landing page
- WebP for generated images

## Approach

Single-page landing (Approach A). Blog/content marketing (Approach C) deferred to phase 2.
