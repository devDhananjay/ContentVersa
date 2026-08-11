/** Capture JobPilot token from login bridge page and store in extension. */

function captureToken() {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  if (!token) return;
  chrome.runtime.sendMessage({ type: "JOBPILOT_SET_TOKEN", token }, () => {
    /* ignore errors if no SW yet */
  });
}

captureToken();

const observer = new MutationObserver(() => captureToken());
observer.observe(document.documentElement, { childList: true, subtree: true });
