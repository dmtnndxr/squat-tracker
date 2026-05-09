
# GitHub Pages, Mobile UX, Localization, Favicon, Stats, SEO

## Summary

  Prepare the app for public GitHub Pages deployment as a Vite project page at https://<github-user>.github.io/squat-tracker/, redesign production UX around a mobile-first full-screen
  camera overlay, add English/Russian auto-localization, generate favicon/app icons, store local rep history with CSV export, and add basic static SEO metadata.

## Key Changes

- Deployment:
  - Configure Vite base: "/squat-tracker/".
  - Add GitHub Actions workflow using Pages artifact deployment on pushes to main.
  - Add deployment docs for creating squat-tracker in the authenticated GitHub account and enabling GitHub Pages from Actions.
  - Keep /video/* ignored and out of production.
- Localization:
  - Add a small i18n layer with en and ru dictionaries.
  - Detect language from navigator.languages, use Russian for ru-*, English otherwise.
  - Persist manual language override in localStorage via a compact menu option.
  - Update document lang, title, and visible UI strings from the selected locale.
- Mobile-first UI:
  - Make the camera/video feed the main background surface.
  - Overlay session count, selected exercise, and primary controls on top of the video.
  - Keep start/stop, exercise selector, and reset session reachable on the main screen.
  - Move reset totals, CSV export, language selection, and secondary actions into a small menu.
  - Keep dev-only test video and pose metadata hidden from production builds.
- Favicon and app icon:
  - Generate a simple exercise-counter icon asset and save project-local icons under public/.
  - Wire favicon.ico, PNG icons, and web app manifest metadata into index.html.

## Local Stats

- Add local rep history alongside existing totals.
- Store records in browser storage under a new versioned key, for example:
  - id
  - exercise: "pushup" | "squat"
  - timestamp: ISO string
  - sessionId
- On every counted rep:
  - increment session count
  - increment local total
  - append one rep event
- Add CSV export from the menu with columns:
  - timestamp,exercise,sessionId
- Add local history reset only inside the menu, separate from reset totals, to avoid accidental data loss.

## SEO And Metadata

- Update index.html with localized-default English metadata:
  - descriptive title
  - meta description
  - Open Graph and Twitter card tags
  - theme color
  - canonical URL placeholder for GitHub Pages
- Add public/robots.txt and public/sitemap.xml for the GitHub Pages URL.
- Use semantic labels for main controls and counters so the app is more accessible and indexable despite being a client-only SPA.

## Test Plan

- Unit test locale detection and fallback behavior.
- Unit test rep history append, malformed-storage fallback, CSV export formatting, and reset behavior.
- Unit test that a counted rep writes both totals and history.
- Build test with npm run build.
- Verify the production bundle does not expose dev-only labels such as Load test video, pose angle metadata, or thresholds.
- Verify GitHub Pages build path works with Vite base /squat-tracker/.

## Assumptions

- GitHub repo name will be squat-tracker.
- GitHub Pages target is Project Pages, not a root user page.
- First localization pass ships English and Russian.
- First history export format is CSV.
- Stats remain local-only; no ext
