# shift-security-left-aws-config

No-one wants a telling off when they make some infrastructure that doesn't meet
AWS' best practices, or those of your organization. Give your team zero-touch
feedback ASAP to help them build better.

This project accompanies [a blog post on jSherz.com] detailing how to give
faster feedback to people creating infrastructure.

**NB:** this project assumes it's being used with a GitHub App that's private
to your GitHub organization!

[a blog post on jSherz.com]: https://github.com/jSherz/shift-security-left-aws-config

## Setting up

1. Create a GitHub App and install it on your GitHub Organization. Follow the
   instructions in the blog post linked above.

2. Create a secret in AWS called `shift-security-left-aws-config-github-token`
   with a value of the following format:

    ```json
    {
      "appId": "12345",
      "privateKey": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n",
      "installationId": 12345
    }
    ```

## Deploying this project

1. Install NodeJS version 18 and Terraform version 1.4.

2. Enable corepack if you have not already.

    ```bash
    corepack enable
    ```

3. Navigate to the `lambda` folder.

4. Install dependencies:

    ```bash
    yarn
    ```

5. Navigate to the `infrastructure` folder.

6. _Recommended, optional:_ configure remote state for Terraform.

7. Initialise Terraform.

    ```bash
    terraform init
    ```

8. Deploy the infrastructure.

    ```bash
    terraform apply
    ```
