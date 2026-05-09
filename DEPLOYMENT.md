# GitHub Pages Deployment

This app is configured for GitHub Project Pages at:

```text
https://dmtnndxr.github.io/squat-tracker/
```

Before publishing:

1. Create a GitHub repository named `squat-tracker`.
2. Push this local repository to GitHub with branch `main`.
3. In GitHub, open repository settings and enable Pages with **GitHub Actions** as the source.
4. Push to `main`; `.github/workflows/deploy-pages.yml` will build, test, and publish `dist`.

The `video/` directory is ignored and is not intended for production deployment.
