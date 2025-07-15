export const validateGeoLocation = (location: any): boolean => {
  if (!location || typeof location !== 'object') return false;
  if (location.type !== 'Point') return false;
  if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) return false;
  const [lng, lat] = location.coordinates;
  if (typeof lng !== 'number' || typeof lat !== 'number') return false;
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return false;
  return true;
};