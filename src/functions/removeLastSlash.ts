export function removeLastSlash(url: string): string {
  if (url.substring(url.length - 1) === '/') {
    url = url.substring(0, url.length - 1);
  }
  return url;
}
