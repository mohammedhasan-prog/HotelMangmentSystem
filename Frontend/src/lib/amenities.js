const ACRONYM_MAP = {
  wifi: 'Wi-Fi',
  wi: 'Wi',
  fi: 'Fi',
  ac: 'AC',
  tv: 'TV',
  hd: 'HD',
  usb: 'USB',
  spa: 'Spa',
  gym: 'Gym',
  bbq: 'BBQ',
  bbqs: 'BBQs',
  gps: 'GPS',
};

export function formatAmenityLabel(value) {
  if (!value || typeof value !== 'string') return '';

  const normalized = value
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

  if (!normalized) return '';

  return normalized
    .split(' ')
    .map((part) => {
      const key = part.toLowerCase();
      if (ACRONYM_MAP[key]) return ACRONYM_MAP[key];
      return key.charAt(0).toUpperCase() + key.slice(1);
    })
    .join(' ')
    .replace(/^Free Wifi$/i, 'Free Wi-Fi')
    .replace(/\bWifi\b/gi, 'Wi-Fi');
}
