/** Apply unsaved photo choices to the server-rendered email; do not duplicate the email renderer. */
export function updateNewsletterPreviewPhotos(html: string, imageUrl: string | null, extraImages: string[] = []) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const table = doc.querySelector('table[width="600"]');
  const rows = table?.querySelector('tbody') || table;
  if (!rows) return html;
  const mainImage = rows.querySelector<HTMLImageElement>('img[width="600"]');
  const mainRow = mainImage?.closest('tr');
  const safe = (url: string | null) => {
    if (!url) return null;
    try { return new URL(url).protocol === 'https:' ? url : null; } catch { return null; }
  };
  const main = safe(imageUrl);
  if (mainImage && main) mainImage.src = main;
  else if (mainRow && !main) mainRow.remove();
  else if (main) {
    const row = doc.createElement('tr');
    const cell = doc.createElement('td');
    const img = doc.createElement('img');
    img.src = main; img.alt = ''; img.width = 600;
    img.style.cssText = 'display:block;width:100%;max-width:600px;height:auto;border:0;';
    cell.append(img); row.append(cell); rows.firstElementChild?.after(row);
  }
  // Target photo rows explicitly; never remove the image-bearing brand header.
  for (const row of Array.from(rows.children)) {
    if (row.hasAttribute('data-newsletter-header') || row.querySelector('img[alt="Vesuviano Forni"]')) continue;
    if (row.hasAttribute('data-newsletter-extra-photos') || row.querySelector('td > table img')) row.remove();
  }
  const extras = extraImages.map(safe).filter((url): url is string => !!url && url !== main).slice(0, 3);
  if (extras.length) {
    const row = doc.createElement('tr');
    row.setAttribute('data-newsletter-extra-photos', '');
    const cell = doc.createElement('td');
    cell.style.cssText = 'padding:0 28px 24px;';
    const grid = doc.createElement('table');
    grid.setAttribute('role', 'presentation'); grid.setAttribute('width', '100%');
    grid.setAttribute('cellpadding', '0'); grid.setAttribute('cellspacing', '0');
    const photos = doc.createElement('tr');
    for (const url of extras) {
      const slot = doc.createElement('td');
      slot.setAttribute('width', String(Math.floor(100 / extras.length)) + '%');
      slot.style.cssText = 'padding:0 4px;';
      const img = doc.createElement('img'); img.src = url; img.alt = '';
      img.style.cssText = 'display:block;width:100%;height:auto;border:0;border-radius:4px;';
      slot.append(img); photos.append(slot);
    }
    grid.append(photos); cell.append(grid); row.append(cell);
    const signatureRow = Array.from(rows.children).find((child) => child.hasAttribute('data-newsletter-signature'));
    (signatureRow || rows.lastElementChild)?.before(row);
  }
  return '<!DOCTYPE html>' + doc.documentElement.outerHTML;
}