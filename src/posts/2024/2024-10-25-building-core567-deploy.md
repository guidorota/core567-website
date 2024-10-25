---
title: 'Building Core 567 - Part 2'
description: 'A brief description of how this website is deployed to AWS'
date: 2024-10-25
tags:
  - technology
---

Second and final part of the blog post series about buidling this website. In this installment, I'll focus on 2 things:
* The AWS infrastructure that serves this website (bog standard setup, I won't spend too much time describing this)
* How artifacts are deployed to AWS S3 using Github Actions


## AWS infrastructure

The infrastructure that backs this website is quite simple:

* Artifacts are stored in an S3 bucket.
* Cloudfronts is used in front of S3 to provide caching and to allow users to locally consume content
* Route 53 is used to setup the necessary DNS records to route traffic from core567.com to the above Cloudfront distribution

There's really nothing special to this setup. If you want to replicate it, follow this excellent tutorial published by Amazon: [Tutorial: Configuring a static website using a custom domain registered with Route 53](https://docs.aws.amazon.com/AmazonS3/latest/userguide/website-hosting-custom-domain-walkthrough.html).


## Deploying to S3 using Github Actions

I will spend more words explaining how deployments to AWS are setup, since I was not satisfied with the documentation I found online.

Let's start by showing the full Github Actions workflow yaml (the keen eyed will notice that I'm storing AWS ARNs and identifiers as variables to avoid leaking them to the public):

```
name: Build website and publish to S3

on:
  push:
    branches: [ "main" ]

env:
  node-version: 22.x

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js {{ '${{env.node-version}}' }}
      uses: actions/setup-node@v4
      with:
        node-version: {{ '${{env.node-version}}' }}
        cache: 'npm'
    - run: npm install
    - run: npm run build:11ty
    - name: Upload website files
      uses: actions/upload-artifact@v4
      with:
        name: website
        path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
    - name: Download website files
      uses: actions/download-artifact@v4
      with:
        name: website
        path: dist
    - name: Setup AWS CLI
      uses: aws-actions/configure-aws-credentials@v4
      with:
        audience: sts.amazonaws.com
        aws-region: us-east-1
        role-to-assume: {{ '${{vars.CORE567_UPLOAD_ROLE_ARN}}' }}
    - name: Upload files to S3 bucket
      run: aws s3 sync dist {{ '${{vars.CORE567_BUCKET_NAME}}' }} --delete
    - name: Invalidate Cloudfront cache
      run: aws cloudfront create-invalidation --distribution-id {{ '${{vars.CORE567_DISTRIBUTION_ID}}' }} --paths '/*'
```

As you can see, I decided to split the workflow in two jobs: one to `build` the website, and another one to `deploy` it to AWS. I could have coalesced both jobs into one, but I wanted to keep them separate to have better visual feedback about the result of each major phase in the deployment process.

The `build` job is nothing fancy: checks out the commit that triggered the action (`actions/checkout@v4`), sets up Node.js and npm caching (`actions/setup-node@v4`), buids the website artifacts (`npm install` and `npm run build:11ty`), and lastly makes them available to the next build job (`actions/upload-artifact@v4`).

The `deploy` job is where things start getting more interesting, for two reasons:
* I'm using the AWS CLI directly. This is important because despite what many Google results might lead you to believe, you don't need to get any third-party action from the Marketplace.
* I'm authenticating to AWS using OIDC, which is more secure than just using an AWS Access Key as it doesn't require you to share long-lived AWS credentials with Github.

Let's dissect the `deploy` job to see what each part of the configuration does:

```
needs: build
```

This just declares a dependency between the two build jobs. It instructs Github Actions that `deploy` needs to run after the `build` job.


```
permissions:
  id-token: write
```


`id-token: write` instructs Github Actions that this job is authorised to generate an OIDC JWT ID Token. This is a crucial piece of configuration since we need this token later when authenticating to AWS.


```
- name: Download website files
  uses: actions/download-artifact@v4
  with:
    name: website
    path: dist
```

`actions/download-artifact@v4` just downloads the website artifacts that we built in the `build` step.


```
- name: Setup AWS CLI
  uses: aws-actions/configure-aws-credentials@v4
  with:
    audience: sts.amazonaws.com
    aws-region: us-east-1
    role-to-assume: {{ '${{vars.CORE567_UPLOAD_ROLE_ARN}}' }}
```

This is where most of the magic happens. I will delve into the crucial points here as the [official `configure-aws-credentials` documentation](https://github.com/aws-actions/configure-aws-credentials?tab=readme-ov-file#oidc) can be a bit confusing.

`aws-actions/configure-aws-credentials@v4` instructs how the AWS CLI / Github Actions authenticate with your AWS Account. `role-to-assume` indicates that we want to authenticate via OIDC, and assume the specified role.

In order for this to work there's some configuration you'll need to perform on the AWS side:
* Setup Github Actions / AWS OIDC federation
* Create a role that grants permission to the AWS resources we need to access during the deployment

Setting up Github Actions / AWS OIDC federation creates a trust relationship between Github and AWS, essentially allowing Github Actions to authenticate directly with your AWS account. This is what allows you to avoid storing AWS authentication credentials in Github. AWS provides a convenient [Cloudformation template](https://github.com/aws-actions/configure-aws-credentials?tab=readme-ov-file#configuring-iam-to-trust-github) to automate this part of the setup .

The last piece of the puzzle is the AWS role. This is the role that Github Actions will assume in order to call the AWS APIs required to deploy the website. Here's how it's configured on my AWS account:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::<aws-account-id>:oidc-provider/token.actions.githubusercontent.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                    "token.actions.githubusercontent.com:sub": "repo:guidorota/core567-website:ref:refs/heads/main"
                }
            }
        }
    ]
}
```

As you can see you can restric which Github organization, repository, and even branch is allowed to assume this role. This is yet another advantage of OIDC authentication compared to other AuthN/Z mechanisms.

This role grants the following permission policies, which allow us to use the AWS CLI to perform CRUD operation in S3 and invalidate Cloudfront CDN caches:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Statement1",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:ListBucket",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::<bucket-name>",
                "arn:aws:s3:::<bucket-name>/*"
            ]
        }
    ]
}
```

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Statement1",
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation"
            ],
            "Resource": [
                "arn:aws:cloudfront::<aws-account-id>:distribution/<cloudfront-distribution-id>"
            ]
        }
    ]
}
```


Ok, quick recap. After all of the above, our Github Actions workflow can:
* Authenticate with your AWS account using OIDC
* Assume the specified role and get a temporary access token to call AWS APIs

All that's left to do is calling these AWS APIs:

```
- name: Upload files to S3 bucket
  run: aws s3 sync dist {{ '${{vars.CORE567_BUCKET_NAME}}' }} --delete
- name: Invalidate Cloudfront cache
  run: aws cloudfront create-invalidation --distribution-id {{ '${{vars.CORE567_DISTRIBUTION_ID}}' }} --paths '/*'
```

Nothing fancy here, I'm just replacing all content in the S3 bucket that backs this website. It's a simple personal website so I'm not implementing any fancy rollout strategy. Similarly, I opted to just invalidate all CDN caches at every deployment instead of overcomplicating things by creating unique resource hashes etc.