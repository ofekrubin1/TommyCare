// HTML → canvas → PDF (A4), sliced per page and embedded as JPEG to keep the file small on phones.
async function renderToCanvas(html2canvas, html) {
  const el = document.createElement('div');
  Object.assign(el.style, { position: 'fixed', top: '-10000px', left: '-10000px' });
  el.innerHTML = html;
  document.body.appendChild(el);
  try {
    return await html2canvas(el.firstElementChild, { scale: 2, backgroundColor: '#ffffff', width: 794 });
  } finally {
    el.remove();
  }
}

function addCanvas(pdf, canvas, pageW, pageH) {
  const slicePx = Math.floor((pageH * canvas.width) / pageW);
  for (let top = 0, first = true; top < canvas.height; top += slicePx, first = false) {
    const h = Math.min(slicePx, canvas.height - top);
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = h;
    const ctx = slice.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, slice.width, h);
    ctx.drawImage(canvas, 0, top, canvas.width, h, 0, 0, canvas.width, h);
    if (!first) pdf.addPage();
    pdf.addImage(slice.toDataURL('image/jpeg', 0.88), 'JPEG', 0, 0, pageW, (h * pageW) / canvas.width);
  }
}

// Open the tab synchronously in the tap handler (later = blocked as a popup), then load the PDF into it.
export function openPendingTab() {
  const win = window.open('', '_blank');
  if (!win) return null;
  win.document.write('<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TommyCare</title></head>'
    + '<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;color:#555">מכין את הדוח...</body></html>');
  win.document.close();
  return win;
}

export async function htmlToPdf(html, filename, win) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const canvas = await renderToCanvas(html2canvas, html);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  addCanvas(pdf, canvas, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
  const url = URL.createObjectURL(pdf.output('blob'));
  if (win && !win.closed) {
    win.location.href = url;
  } else {
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 10 * 60_000);
}
