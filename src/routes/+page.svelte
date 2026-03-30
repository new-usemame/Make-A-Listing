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
  <title>Make a Listing — Free AI Listing Generator for eBay, Poshmark, Mercari & Depop</title>
  <meta name="description" content="Generate optimized product listings for multiple platforms in seconds. Describe your item once, get tailored listings for eBay, Poshmark, Mercari, and Depop. Free forever with your own OpenRouter API key." />
  <link rel="canonical" href="https://makealisting.com" />

  <!-- Open Graph -->
  <meta property="og:title" content="Make a Listing — Free AI Listing Generator for eBay, Poshmark, Mercari & Depop" />
  <meta property="og:description" content="Generate optimized product listings for multiple platforms in seconds. Describe your item once, get tailored listings for eBay, Poshmark, Mercari, and Depop. Free forever with your own OpenRouter API key." />
  <meta property="og:image" content="https://makealisting.com/landing/og-image.png" />
  <meta property="og:url" content="https://makealisting.com" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Make a Listing" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Make a Listing — Free AI Listing Generator for eBay, Poshmark, Mercari & Depop" />
  <meta name="twitter:description" content="Generate optimized product listings for multiple platforms in seconds. Describe your item once, get tailored listings for eBay, Poshmark, Mercari, and Depop. Free forever with your own OpenRouter API key." />
  <meta name="twitter:image" content="https://makealisting.com/landing/og-image.png" />

  <!-- Structured Data -->
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Make a Listing",
        "description": "Free AI-powered listing generator for eBay, Poshmark, Mercari, and Depop. Generate optimized product listings for multiple e-commerce platforms simultaneously.",
        "url": "https://makealisting.com",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "Organization",
        "name": "Make a Listing",
        "url": "https://makealisting.com",
        "logo": "https://makealisting.com/icon-512.png"
      }
    ]
  })}</script>`}
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
