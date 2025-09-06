export const formatDate = (date: Date): string => {
  // Format as YYYY/MM/DD
  return date.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/-/g, '/');
}; 