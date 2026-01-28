export const normalizeInstagramHandle = (handle: string): string => {
  if (!handle) return '';
  const trimmed = handle.trim();
  if (!trimmed) return '';
  
  // Remove @ symbol if present
  return trimmed.replace(/^@+/, '');
};