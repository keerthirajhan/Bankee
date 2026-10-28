import { Platform, Share } from 'react-native';

// Share text / CSV: native share sheet on phones; web falls back to the
// Web Share API, a file download (CSV) or the clipboard (text).
// Resolves to 'shared' | 'downloaded' | 'copied' | 'cancelled' | 'failed'
export async function shareContent({ title, message, filename }) {
  try {
    if (Platform.OS !== 'web') {
      const r = await Share.share({ title, message });
      return r.action === Share.dismissedAction ? 'cancelled' : 'shared';
    }
    if (typeof navigator !== 'undefined' && navigator.share && !filename) {
      await navigator.share({ title, text: message });
      return 'shared';
    }
    if (filename && typeof document !== 'undefined') {
      const url = URL.createObjectURL(new Blob([message], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return 'downloaded';
    }
    await navigator.clipboard.writeText(message);
    return 'copied';
  } catch (e) {
    return e && e.name === 'AbortError' ? 'cancelled' : 'failed';
  }
}
