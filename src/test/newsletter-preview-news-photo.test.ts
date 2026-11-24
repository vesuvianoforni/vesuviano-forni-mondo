// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { updateNewsletterPreviewPhotos } from '@/lib/newsletterPreview';

const html = `<table><tr><td align="center"><table width="600"><tbody>
<tr data-newsletter-header><td><img alt="Vesuviano Forni" src="https://x.com/logo.png"></td></tr>
<tr><td><p>Corpo notizie</p><div><a href="https://pmq.com/a"><img src="https://pmq.com/a.jpg" width="544"></a></div></td></tr>
</tbody></table></td></tr></table>`;

describe('newsletter preview', () => {
  it('keeps the news body and publisher photo when refreshing photos', () => {
    const out = updateNewsletterPreviewPhotos(html, null, []);
    expect(out).toContain('Corpo notizie');
    expect(out).toContain('https://pmq.com/a.jpg');
  });
});
