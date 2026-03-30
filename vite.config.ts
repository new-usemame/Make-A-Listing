import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'Make a Listing',
				short_name: 'Make a Listing',
				description: 'Generate e-commerce listings for multiple platforms',
				theme_color: '#2563eb',
				background_color: '#f9fafb',
				display: 'standalone',
				scope: '/',
				start_url: '/app',
				icons: [
					{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
					{ src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
				]
			},
			workbox: {
				navigateFallback: null,
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/.*\.(js|css|woff2?)$/,
						handler: 'CacheFirst',
						options: {
							cacheName: 'static-assets',
							expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }
						}
					}
				]
			}
		})
	],
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
