
  gh auth login -h github.com
  gh repo create squat-tracker --public --source=. --remote=origin --push
  git branch -M main
  git push -u origin main

  Then enable Pages:

  gh api \
    --method POST \
    repos/dmtnndxr/squat-tracker/pages \
    -f source='{"branch":"main","path":"/"}'

  If that Pages command fails because the repo already has Pages config, use GitHub UI:

  Repo Settings -> Pages -> Source -> GitHub Actions

  After that, every push to main will run .github/workflows/deploy-pages.yml and deploy to:

  <https://dmtnndxr.github.io/squat-tracker/>
