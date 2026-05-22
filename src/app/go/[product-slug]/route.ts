import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/products';

/**
 * Affiliate-Redirect Layer
 * Route: /go/[product-slug]
 *
 * Flow:
 * 1. Produkt im Registry nachschlagen
 * 2. GA4 Event feuern (server-side via Measurement Protocol)
 * 3. 302 Redirect zur Affiliate-URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { 'product-slug': string } }
) {
  const productId = params['product-slug'];
  const product = getProductById(productId);

  if (!product) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Server-side GA4 via Measurement Protocol (optional — konfigurierbar)
  if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
    try {
      const clientId = request.cookies.get('_ga')?.value?.replace('GA1.1.', '') ?? 'server-side';
      await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            events: [
              {
                name: 'affiliate_click',
                params: {
                  product_id: product.id,
                  product_name: product.name,
                  product_brand: product.brand,
                  product_category: product.category,
                  provider: product.provider,
                  price: product.price,
                  currency: 'EUR',
                },
              },
            ],
          }),
        }
      );
    } catch {
      // GA4 Fehler niemals Redirect blockieren
    }
  }

  // 302 Redirect mit Cache-Buster-Header
  const response = NextResponse.redirect(product.affiliateUrl, { status: 302 });
  response.headers.set('Cache-Control', 'no-store, no-cache');
  response.headers.set('X-Product-Id', product.id);
  response.headers.set('X-Provider', product.provider);

  return response;
}
