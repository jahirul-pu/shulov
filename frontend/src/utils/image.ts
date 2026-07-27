export const parseProductImages = (images: any): string[] => {
  const fallback = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
  if (!images) return [fallback];
  if (Array.isArray(images)) {
    const valid = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
    return valid.length > 0 ? valid : [fallback];
  }
  if (typeof images === 'string') {
    const trimmed = images.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => (typeof item === 'string' ? item : String(item)));
        }
      } catch (e) {}
    }
    if (trimmed.length > 0) {
      return [trimmed];
    }
  }
  return [fallback];
};

export const getPrimaryProductImage = (images: any): string => {
  const parsed = parseProductImages(images);
  return parsed[0];
};
