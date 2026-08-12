# CI/CD in the eCommerce Monorepo

**deploy-dev.yml** — the merge-to-main pipeline. Fires only on pushes to main (i.e., right after you merge a PR). It repeats the same diff → test → build → push sequence. This is what makes dev always reflect the current state of main.
