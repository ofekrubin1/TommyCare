// Saves a generated file. Phones: the share sheet (Save to Files, WhatsApp, Mail...), because blob downloads
// do nothing in the iPhone home-screen app. Computers (or no file sharing): a normal download.
// Call straight from a tap. Returns 'shared' | 'cancelled' | 'downloaded'.
const isPhone = () => /iPhone|iPad|iPod|Android/.test(navigator.userAgent);

export async function saveFile(content, filename, type) {
  const file = new File([content], filename, { type });
  if (isPhone() && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return 'shared';
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled';
      console.warn('share failed, downloading instead', err);
    }
  }
  const url = URL.createObjectURL(file);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return 'downloaded';
}
