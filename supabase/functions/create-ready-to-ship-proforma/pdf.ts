import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

export interface QuotePdfInput {
  labels: { title: string; customer: string; diameter: string; coating: string; fuel: string; price: string; shipping: string; payment: string; link: string; photos: string };
  number: string;
  customerName: string;
  model: string;
  diameter: string | number;
  coating: string;
  fuel: string;
  price: string;
  paymentTerms: string;
  url: string;
  images: string[];
}

// Standard PDF fonts only cover WinAnsi: drop emoji and other unsupported glyphs.
const safe = (s: string) => String(s ?? '').replace(/[^\x20-\x7E\u00A0-\u00FF€–—’“”]/g, '').trim();

async function loadImage(doc: PDFDocument, url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return await doc.embedPng(bytes);
    if (bytes[0] === 0xff && bytes[1] === 0xd8) return await doc.embedJpg(bytes);
    return null; // webp/other formats are skipped in the PDF but stay in the email
  } catch { return null; }
}

export async function buildQuotePdf(input: QuotePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const accent = rgb(0.85, 0.47, 0.02);
  const dark = rgb(0.12, 0.16, 0.22);
  let page = doc.addPage([595, 842]);
  let y = 800;
  const text = (s: string, size = 11, f = font, color = dark) => { page.drawText(safe(s), { x: 50, y, size, font: f, color, maxWidth: 495 }); y -= size + 8; };

  page.drawRectangle({ x: 0, y: 770, width: 595, height: 72, color: accent });
  page.drawText('VESUVIANO FORNI', { x: 50, y: 808, size: 20, font: bold, color: rgb(1, 1, 1) });
  page.drawText(safe(`${input.labels.title} ${input.number}`), { x: 50, y: 786, size: 12, font, color: rgb(1, 1, 1) });
  y = 740;
  text(`${input.labels.customer}: ${input.customerName}`, 12, bold);
  y -= 6;
  text(input.model, 16, bold, accent);
  text(`${input.labels.diameter}: ${input.diameter} cm`);
  text(`${input.labels.coating}: ${input.coating}`);
  text(`${input.labels.fuel}: ${input.fuel}`);
  y -= 6;
  text(`${input.labels.price}: ${input.price}`, 15, bold);
  text(input.labels.shipping);
  text(`${input.labels.payment}: ${input.paymentTerms}`);
  y -= 4;
  text(`${input.labels.link}: ${input.url}`, 9);

  const images = (await Promise.all(input.images.slice(0, 6).map((u) => loadImage(doc, u)))).filter(Boolean) as Awaited<ReturnType<typeof loadImage>>[];
  if (images.length) {
    y -= 10;
    text(input.labels.photos, 12, bold);
    for (const img of images) {
      if (!img) continue;
      const w = 495; const h = Math.min(320, (img.height / img.width) * w);
      const dw = (img.width / img.height) * h;
      if (y - h < 50) { page = doc.addPage([595, 842]); y = 790; }
      page.drawImage(img, { x: 50 + (w - dw) / 2, y: y - h, width: dw, height: h });
      y -= h + 16;
    }
  }
  page.drawText('www.vesuvianoforni.com  ·  info@vesuvianoforni.com', { x: 50, y: 30, size: 9, font, color: dark });
  return await doc.save();
}
