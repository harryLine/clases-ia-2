export function toDateInputValue(dateIso: string): string {
  return new Date(dateIso).toISOString().split('T')[0];
}

export function formatLessonDate(dateIso: string): string {
  return toDateInputValue(dateIso);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
