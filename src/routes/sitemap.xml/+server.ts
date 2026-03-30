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
