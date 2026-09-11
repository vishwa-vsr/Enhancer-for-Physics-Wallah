# Enhancer for PW - SEO & Competitor Research

## 1. Keyword Research
*   **"physics wallah extension" / "pw extension chrome"**: High-intent queries where top results highlight Chrome Web Store listings, GitHub repositories, and Reddit discussions. "Enhancer for PW" and "PWEnhancer" dominate these results.
*   **"speed up physics wallah lectures" / "skip silence physics wallah" / "pw lecture speed increase"**: Searchers are actively looking to bypass standard video player limits and skip silences. Reddit (r/JEENEETards, r/PhysicsWallah) ranks highly for these terms, where community members frequently recommend these extensions.
*   **"enhancer for pw"**: The primary branded query for this extension. 
*   **"physics wallah hack extension"**: Reflects a user desire to bypass site restrictions (like speed caps or chat UI) rather than malicious intent.
*   **"best extensions for online lectures India" / "how to speed up pw lectures"**: Yields broader productivity tools, Quora answers, and community tutorials that direct users to install Tampermonkey scripts or Chrome extensions.

## 2. Competitor Analysis
*   **PWEnhancer (GitHub)**: A strong direct competitor (open-source) that features a built-in "Jumpcutter" engine to blast through silent board-writing and a "TrueTime" prediction tool for lecture end times.
*   **Generic "Skip Silence" Extensions**: Non-PW specific Chrome extensions that analyze HTML5 video audio tracks to speed up silent periods.
*   **Tampermonkey Scripts**: Custom userscripts frequently shared on Reddit for speed controls and UI modifications.
*   **Distribution Channels**: r/JEENEETards and r/PhysicsWallah on Reddit act as the main hubs for sharing updates, bugs, and alternative scripts. There is a lack of dominant blog posts, leaving room for an SEO-optimized landing page.

## 3. Chrome Web Store Listing
*   **Extension ID**: ibepglcdcaanmkledmpgfapaffkhbadj
*   **Current Stats**: 4.7-star rating based on 12 reviews, with 354 active users.
*   **Listing Optimization**: The description effectively highlights core features: speeds up to 4.0x, Picture-in-Picture (PiP), auto-skip silence, and 1-click decluttering (hiding chat/Q&A). It appropriately includes a disclaimer stating it is an independent, open-source project unaffiliated with Physics Wallah Pvt. Ltd.

## 4. GitHub Pages SEO & Limitations
*   **Pre-rendering / SSG**: GitHub Pages only serves static files. If building a Single Page Application (SPA) with React/Vue, it must be fully pre-rendered (SSG) at build time. If search engine crawlers only receive an empty `#root` div and require JavaScript to render content, SEO will suffer significantly.
*   **Metadata**: Ensure all meta tags (titles, descriptions, Open Graph) are properly generated into the static HTML.
*   **Custom Domain Setup**: Adding a custom domain is fully supported and recommended. GitHub automatically provides HTTPS, which is a positive ranking factor.
*   **Limitations (404 Routing Issue)**: GitHub Pages doesn't support server-side URL rewrites. SPAs often encounter 404 errors when refreshing on sub-routes. The standard workaround (a `404.html` redirecting to `index.html`) can harm SEO, as search engines may interpret the initial 404 status negatively. Using full SSG (where an actual `.html` file exists for each route) is the best practice.
