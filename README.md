# 🌌 Org Directory monorepo

This repository holds most of the code for an open-source organization directory project.

Think any documentation is out of date, incomplete, misleading or otherwise could be improved? Open a pull request or raise an issue.

- [🌐 Website](./apps/web)
- [🔃 Server](./apps/server)
- [📦 Shared](./packages/shared)
- [🌈 UI](./packages/ui)

## 🧑‍💻 Contributing instructions

Target audience: Open-source contributors who have some coding experience, and want to make changes to any part of Org Directory.

These docs apply to everything across the repository. For more specific docs, see the README files inside the relevant folder.

### 🔧 Setup

You only need to do this once.

1. Install [Node](https://nodejs.org/) (choose the LTS version) and [VS Code](https://code.visualstudio.com/Download)
2. Install [Java](https://adoptium.net/) (choose the latest LTS version)
3. Clone the repository ([more info](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository))
4. Open the folder with VS Code
5. Run `npm install` in the root

### 🏃 Running locally

Summary: start everything with `npx turbo start`, and test with `npx turbo test`

| Command                 | What it does                                   |
|-------------------------|------------------------------------------------|
| `npm install`           | Install and update dependencies                |
| `npx turbo start`       | Find lint issues                               |
| `npx turbo test`        | Run unit tests                                 |
| `npx turbo test:watch`  | Run unit tests in watch mode                   |
| `npx turbo lint`        | Find lint issues                               |
| `npx turbo lint:fix`    | Auto-fix lint issues                           |
| `npx turbo build`       | Build and type-check. Output goes into `dist`. |
| `npx turbo deploy:dev`  | Deploy to dev environment                      |
| `npx turbo deploy:prod` | Deploy to prod environment                     |

All commands are run from the root of the repository. Any of the turbo commands can be filtered with `--filter <app>`, for example to start just `web` run `npx turbo start --filter web`

These scripts are defined in the relevant `package.json` files. We keep these scripts as simple to use as possible, so developers need to run very few commands. We also keep these scripts consistent so that they behave as expected across the repo, and we need less config overrides.

All packages should have their main content in a `src` folder, and output built files to `dist`.

#### 📥 Installing packages

To install external packages (choosing the appropriate workspace, and with the argument `--save-dev` for dev dependencies):

```
npm install some-package-name --workspace @odir/server
```

And to uninstall:

```
npm uninstall some-package-name --workspace @odir/server
```

#### 🚢 Ports

`web`:
- `8000`: the website

`server`:
- `8001`: the API
- `8002`: serverless-offline websockets
- `8003`: serverless-offline AWS Lambda API
- `8004`: serverless-dynamodb instance of DynamoDB for serverless-offline
- `8005`: serverless-dynamodb instance of DynamoDB for tests
- `8006`: serverless-offline-ses-v2 instance of ses
- `8007`: serverless-s3-local instance of S3

### 🔀 Change process

We follow the [GitHub flow model](https://docs.github.com/en/get-started/quickstart/github-flow) (aka: feature branches and pull/merge requests).

Try to make small, independent changes to make reviewing easy and minimize merge conflicts. Follow existing conventions and leave comments explaining why the code you've written exists/exists in the way it does.

To learn more about using Git, see the [VS Code source control documentation](https://code.visualstudio.com/docs/sourcecontrol/overview) or read the free [Git book](https://git-scm.com/book/en/v2).

1. Check you're up to date with the latest changes in the repository, using VS code (select master branch, then 'Synchronize Changes' button) or git commands (`git checkout master && git pull`). Make sure you've also updated dependencies by running `npm install`.
2. Create a feature branch for your work, using VS code (select branch > 'Create new branch') or git commands (`git checkout -b my-new-feature`)
3. Make your changes.
4. Check your changes work as expected, and ideally write some unit tests for them. Run `npm test` to run them.
5. Commit your changes, and push the branch. Raise a pull request and get someone to review it. If you've paired on a piece of work, still review the changes you've made but you can merge if you are both happy.
6. Merge once you and your reviewer are happy, and the CI pipeline passes.

### 📦 Concepts

- user: Any human person that can login to the directory.
- group: A collection of zero or more users, to control permissions to viewing details of certain persons or teams. This includes a special 'admin' group which can manage all groups.
- person: A person in the directory. The plural we use is 'persons'. Usually corresponds to exactly one user. May be part of zero to many teams, but most often will be just on one team.
- team: A team in the directory. May have relations between it and many other teams/persons.
- relation: A relationship between persons and/or teams. Used for example to record team membership (person -> team), team nesting (team -> team), line managers (person -> person).
