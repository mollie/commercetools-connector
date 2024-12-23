# Contribution Guide

* [Prerequisites](#prerequisites)
* [Development](#development)

## Prerequisites

To merge your changes, your commits must be [signed](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits).

Minimum requirements are:
- **Node.js** version 18
- **Npm** npm v10.7.0
- **Bash** shell
- **Signed** git commits

You can install all dependencies using `npm` with following command:

```
npm install
```

## Development
While developing project you can use some predefined commands for running tests, running linter or generating coverage.

- Execute `npm run test` to run all tests.
- Execute `npm run lint` to show lint errors in the code.

## Release procedure
At the moment there is no automated release scripts, which means we do releases manually. We use [gitflow workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) for releases. Please **squash commits when finishing the feature branch**, this way we can keep relatively clean history on develop and main. 

Contributing by following these steps:

1. Create and check out a new branch off main and make your necessary change here. The branch name should have a specific prefix depends on the purpose, e.g: `bugfix/`, `feat/`
2. Bump [version](https://semver.org/) on npm package (in /processor). Commit changes on the above branch.
3. Create PR and wait for the approval from the development team.