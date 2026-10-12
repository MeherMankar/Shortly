/*
(c) Meher Mankar
See the LICENSE file in the project root.
*/

const form = document.getElementById("shortenForm");
const urlInput = document.getElementById("longURL");
const submitButton = form.querySelector('button[type="submit"]');
const statusMessage = document.getElementById("formStatus");
const popup = document.getElementById("customPopup");
const shortLinkElement = document.getElementById("shortLink");
const closeButton = document.getElementById("closePopup");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusMessage.textContent = "";

  const longUrl = urlInput.value.trim();
  if (!isValidUrl(longUrl)) {
    statusMessage.textContent = "Enter a valid HTTP or HTTPS URL.";
    urlInput.focus();
    return;
  }

  submitButton.disabled = true;
  try {
    const response = await fetch("/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: longUrl }),
    });
    const data = await response.json();

    if (!response.ok || typeof data.hash !== "string") {
      throw new Error(data.error || "Unable to shorten this URL.");
    }

    const shortenedUrl = new URL(data.hash, `${window.location.origin}/`).href;
    shortLinkElement.textContent = shortenedUrl;
    shortLinkElement.href = shortenedUrl;
    popup.hidden = false;
    closeButton.focus();
    urlInput.value = "";
  } catch (error) {
    statusMessage.textContent = error instanceof Error
      ? error.message
      : "Unable to shorten this URL. Please try again.";
  } finally {
    submitButton.disabled = false;
  }
});

closeButton.addEventListener("click", closePopup);
document.getElementById("copyButton").addEventListener(
  "click",
  copyToClipboard,
);

document.addEventListener("keydown", (event) => {
  if (popup.hidden) {
    return;
  }

  if (event.key === "Escape") {
    closePopup();
  } else if (event.key === "Tab") {
    const focusableElements = popup.querySelectorAll(
      'a[href], button:not([disabled])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
});

function isValidUrl(value) {
  if (value.length === 0 || value.length > 2048) {
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

function closePopup() {
  popup.hidden = true;
  urlInput.focus();
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(shortLinkElement.href);
    statusMessage.textContent = "Short link copied to clipboard.";
  } catch {
    statusMessage.textContent =
      "Could not copy the link. Select and copy it from the dialog.";
  }
}
