import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  
  // Default fallback data
  let seoData = {
    title: 'MangaStudio | Official Portfolio',
    description: 'Rumah produksi komik independen yang berdedikasi menciptakan kisah epik dengan standar visual tertinggi.',
    image: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=2070'
  };

  // Fetch from Supabase
  try {
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/studio_settings?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const settings = data[0];
          if (settings.seo_title) seoData.title = settings.seo_title;
          if (settings.seo_description) seoData.description = settings.seo_description;
          if (settings.seo_image) seoData.image = settings.seo_image;
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch SEO from Supabase', error);
  }

  // Fetch the static index.html
  try {
    // Requesting the actual static index.html from our own host
    const htmlResponse = await fetch(`${protocol}://${host}/index.html?raw=true`);
    let html = await htmlResponse.text();

    // Replace tags
    html = html.replace(/<title>.*?<\/title>/g, `<title>${seoData.title}</title>`);
    html = html.replace(/<meta property="og:title" content=".*?" \/>/g, `<meta property="og:title" content="${seoData.title}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/g, `<meta property="og:description" content="${seoData.description}" />`);
    html = html.replace(/<meta property="og:image" content=".*?" \/>/g, `<meta property="og:image" content="${seoData.image}" />`);
    html = html.replace(/<meta name="twitter:title" content=".*?" \/>/g, `<meta name="twitter:title" content="${seoData.title}" />`);
    html = html.replace(/<meta name="twitter:description" content=".*?" \/>/g, `<meta name="twitter:description" content="${seoData.description}" />`);
    html = html.replace(/<meta name="twitter:image" content=".*?" \/>/g, `<meta name="twitter:image" content="${seoData.image}" />`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Set a short cache time so it updates quickly if changed in admin
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).send(html);
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
}
