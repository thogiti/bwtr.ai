# bwtr.ai Static Site

This repository contains the public one-page marketing site for `bwtr.ai`.
It is intentionally separate from the Breakwater platform source repository.

## Publish Model

The site is deployed by GitHub Pages from `.github/workflows/deploy-pages.yml`.
Only the static files in this repository are uploaded to Pages.

## GitHub Pages Setup

In the GitHub repository settings for `thogiti/bwtr.ai`:

1. Go to `Settings` -> `Pages`.
2. Set `Build and deployment` source to `GitHub Actions`.
3. Set the custom domain to `bwtr.ai`.
4. Enable `Enforce HTTPS` after GitHub provisions the certificate.

## Route 53 DNS Records

GitHub's current Pages documentation lists these apex records for `bwtr.ai`:

| Name | Type | Value |
|---|---|---|
| `bwtr.ai` | `A` | `185.199.108.153` |
| `bwtr.ai` | `A` | `185.199.109.153` |
| `bwtr.ai` | `A` | `185.199.110.153` |
| `bwtr.ai` | `A` | `185.199.111.153` |
| `bwtr.ai` | `AAAA` | `2606:50c0:8000::153` |
| `bwtr.ai` | `AAAA` | `2606:50c0:8001::153` |
| `bwtr.ai` | `AAAA` | `2606:50c0:8002::153` |
| `bwtr.ai` | `AAAA` | `2606:50c0:8003::153` |
| `www.bwtr.ai` | `CNAME` | `thogiti.github.io` |

Do not use a wildcard DNS record such as `*.bwtr.ai` for GitHub Pages.

Reference: https://docs.github.com/en/articles/quick-start-setting-up-a-custom-domain
