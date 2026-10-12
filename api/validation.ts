/*
(c) Meher Mankar
See the LICENSE file in the project root.
*/

export const MAX_URL_LENGTH = 2048;

export function validateDestinationUrl(value: string): boolean {
  if (value.length === 0 || value.length > MAX_URL_LENGTH) {
    return false;
  }

  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.length > 0 &&
      url.username.length === 0 &&
      url.password.length === 0;
  } catch {
    return false;
  }
}
