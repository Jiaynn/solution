export const getRouteQuery = (q: string): string => {
  return new URLSearchParams(window.location.search).get(q) || '';
};
