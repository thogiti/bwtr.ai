# bwtr.ai Static Site

This repository contains the public one-page marketing site for `bwtr.ai`.
It is intentionally separate from the Breakwater platform source repository.

## Hosting Model

Production hosting should stay in AWS, consistent with the rest of Breakwater's public infrastructure:

- `bwtr.ai` and `www.bwtr.ai` -> Route 53 -> CloudFront -> private S3 bucket
- `app.bwtr.ai` remains on the production application infrastructure
- `install.bwtr.ai` remains on the installer CloudFront/S3 infrastructure
- `license.bwtr.ai` remains on the license CloudFront/Lambda infrastructure

## Repository Deployment

The GitHub Actions workflow at `.github/workflows/deploy-aws.yml` deploys this static site to AWS by:

1. Assuming an AWS IAM role through GitHub OIDC.
2. Syncing static files to S3.
3. Invalidating the CloudFront distribution.

Large product-demo videos are stored directly in S3 under `assets/videos/` and are intentionally
not committed to this repository. The deploy workflow excludes that prefix during `aws s3 sync
--delete` so publishing the static site does not remove S3-only media.

Required repository configuration in `thogiti/bwtr.ai`:

### Actions Variables

| Variable | Example | Purpose |
|---|---|---|
| `AWS_REGION` | `us-east-1` | AWS region used by the deploy workflow. |
| `AWS_S3_BUCKET` | `bwtr-ai-site-prod` | Private S3 bucket for static site files. |
| `AWS_CLOUDFRONT_DISTRIBUTION_ID` | `E123EXAMPLE` | CloudFront distribution to invalidate after deploy. |

### Actions Secret

| Secret | Purpose |
|---|---|
| `AWS_ROLE_TO_ASSUME` | ARN of the deploy IAM role trusted by GitHub OIDC. |

## AWS Infrastructure

`infra/cloudformation/static-site.yml` creates:

- Private encrypted S3 bucket
- CloudFront distribution with Origin Access Control
- Security response headers
- Optional Route 53 aliases for `bwtr.ai` and `www.bwtr.ai`

You need an issued ACM certificate in `us-east-1` covering both:

- `bwtr.ai`
- `www.bwtr.ai`

Deploy example:

```bash
aws cloudformation deploy \
  --region us-east-1 \
  --stack-name bwtr-ai-static-site \
  --template-file infra/cloudformation/static-site.yml \
  --parameter-overrides \
    CertificateArn=YOUR_US_EAST_1_ACM_CERT_ARN \
    BucketName=bwtr-ai-site-prod
```

After stack creation, copy the stack outputs into the GitHub Actions variables listed above. Then update only the exact Route 53 records for `bwtr.ai` and `www.bwtr.ai` to alias to the `CloudFrontDomainName` output. Leave `app.bwtr.ai`, `install.bwtr.ai`, and `license.bwtr.ai` unchanged.

If you want CloudFormation to create the apex and `www` aliases, add these parameters and make sure no unmanaged exact records already exist for `bwtr.ai` or `www.bwtr.ai`:

```bash
CreateRoute53Records=true \
HostedZoneId=YOUR_BWTR_AI_HOSTED_ZONE_ID
```

## Deploy Role

After the static-site stack is created, deploy the least-privilege GitHub OIDC role:

```bash
aws cloudformation deploy \
  --region us-east-1 \
  --stack-name bwtr-ai-github-deploy-role \
  --template-file infra/cloudformation/github-deploy-role.yml \
  --parameter-overrides \
    BucketName=bwtr-ai-site-prod \
    CloudFrontDistributionId=YOUR_CLOUDFRONT_DISTRIBUTION_ID \
  --capabilities CAPABILITY_NAMED_IAM
```

The template assumes the account already has the GitHub OIDC provider:

```text
token.actions.githubusercontent.com
```

It limits trust to this repository and branch:

```text
repo:thogiti/bwtr.ai:ref:refs/heads/main
```

Copy the `RoleArn` output into the `AWS_ROLE_TO_ASSUME` GitHub Actions secret.

## Lead Capture Forms

The site includes two branded static forms:

- `Request a demo`
- `Start a pilot`

The forms post to a Google Apps Script Web App, which appends submissions to a Google Sheet.
This keeps lead capture simple without adding an AWS API, database, or sales platform.

Setup:

1. Create a Google Sheet named `Breakwater Website Leads`.
2. In the Sheet, open `Extensions` -> `Apps Script`.
3. Paste the contents of `google-apps-script/Code.gs`.
4. Deploy it as a Web App:
   - Execute as: `Me`
   - Who has access: `Anyone`
5. Copy the Web App URL.
6. Replace this placeholder in `index.html`:

```js
window.BREAKWATER_FORM_ENDPOINT = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

with the deployed Web App URL.

The script writes submissions to a `Leads` sheet and includes a hidden honeypot field named
`website` for basic spam filtering.

## Route 53 Safety

Only `bwtr.ai` and `www.bwtr.ai` should point to the new marketing-site CloudFront distribution.
Do not change these production subdomains while deploying the marketing site:

- `app.bwtr.ai`
- `install.bwtr.ai`
- `license.bwtr.ai`

## Local Preview

```bash
python3 -m http.server 4177
```

Then open:

```text
http://127.0.0.1:4177/
```
