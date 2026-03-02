# Reddit Nuker



A Chrome extension built to automate the deletion of your Reddit history. 

Reddit's modern UI (React) heavily obfuscates its DOM, and the official API heavily restricts batch deletions. This tool takes the brute-force UI route. It runs entirely on `old.reddit.com` where the DOM is static and predictable. It injects a content script that handles rate limiting, pagination, and state persistence across page reloads.

## Features

* **Granular Targeting:** Select whether to delete Comments, Posts, or both.
* **Subreddit Filtering:** Isolate deletion to a specific subreddit.
* **Mode Selection:** Filter by content type (NSFW Only, Safe Only, or Everything).
* **Persistent State:** Survives page reloads and automatically clicks through pagination until the job is done.
* **Shadow DOM Dashboard:** Injects an isolated, floating UI into the page to track progress without conflicting with Reddit's native CSS.



## Installation

This extension is not on the Chrome Web Store. You must load it manually.

1. Clone or download this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Toggle **Developer mode** on in the top right corner.
4. Click **Load unpacked** and select the directory containing the extension files.

## Usage

1. Log into your Reddit account.
2. Navigate to your old.reddit overview page: `https://old.reddit.com/user/YOUR_USERNAME/overview`.
3. Click the Reddit Nuker icon in your Chrome toolbar.
4. Configure your targets (Comments/Posts, Subreddit, Mode).
5. Click **Nuke**. 

The extension will force a page reload, inject the dashboard, and begin processing items. Do not close the tab while it is running.



## Under the Hood

If you are reading the source code, here is how the logic flows:
* **State Management:** `chrome.storage.local` is used as a persistent brain. When the script clears a page, it triggers a navigation event (`window.location.href`). The new page loads, the script re-initializes, checks storage, and resumes the loop.
* **Rate Limiting:** Reddit will hit you with a `429 Too Many Requests` or silently ghost your delete requests if you move too fast. The script enforces a strict 1000ms delay between actions and a 1500ms delay between page navigations. 
* **Targeting:** It leverages Reddit's built-in `data-subreddit` attributes and `.over18` classes to filter items cleanly before initiating any click events.

## Disclaimer

Use this tool at your own risk. Deleting thousands of items rapidly can trigger Reddit's spam filters, resulting in temporary IP blocks or shadowbans. The built-in delays mitigate this, but they are not foolproof. This action is permanent and cannot be undone.