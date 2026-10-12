import { MAX_URL_LENGTH, validateDestinationUrl } from "./validation.ts";

function assertEquals(actual: boolean, expected: boolean): void {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, received ${actual}.`);
  }
}

Deno.test("accepts HTTP and HTTPS URLs", () => {
  assertEquals(validateDestinationUrl("http://example.com/path?q=1#top"), true);
  assertEquals(validateDestinationUrl("https://localhost:8443"), true);
});

Deno.test("rejects unsupported protocols and invalid URLs", () => {
  assertEquals(validateDestinationUrl("javascript:alert(1)"), false);
  assertEquals(validateDestinationUrl("file:///etc/passwd"), false);
  assertEquals(validateDestinationUrl("not a URL"), false);
  assertEquals(validateDestinationUrl("https://user:pass@example.com"), false);
});

Deno.test("rejects blank and overlong URLs", () => {
  assertEquals(validateDestinationUrl(""), false);
  assertEquals(validateDestinationUrl(`https://x/${"a".repeat(MAX_URL_LENGTH)}`), false);
});
