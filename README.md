# Getting Started

1. Clone this repo

2. Install libraries `yarn install` or `npm install`

3. Deploy app and watch for changes

`yarn start` / `npm run start` to start with dev config</br>
`yarn start.local` / `npm run start.local` to start with local backend</br>
`yarn start.pilot` / `npm run start.pilot` to start app with proxy to prod api</br>

`yarn start.cheap` / `npm run start.cheap` will start dev serve with eval-sourcemaps. Eval-sourcemaps are much "cheaper" and compile time should be a lot quicker. They are not as good as normal sourcemaps for debugging in the browser, but should be sufficient most of the time. </br>
`yarn start.local.cheap` / `npm run start.local.cheap` Same as above but with local backend.</br>


The app will run on localhost:3000</br>

# NPM scripts
Start tasks covered in previous section. </br>

`build.dev`, `build.test`, `build.pilot`, `build.prod` are just building sass + ts once, no watchers and no dev server. These tasks are for deployment, and probably wont be used in a dev enviroment. </br>

`yarn entities` / `npm run entities` updates the unientites.ts file. You need to say which server you want to download unientites from with environment variables.
I.g.
Windows `set SERVER_URL=https://devapi.unieconomy.no&&npm run entities`
git bash/*nix `export SERVER_URL=https://devapi.unieconomy.no && npm run entities`

Note that && to chain commands does not work in powershell, so use cmd.

# Name issues

Follow this pattern when you are creating a new issue branch:

`<issue_type>/<developer_name>/<issue_description>_<#issue_number>`

where:

- **issue_type**: type of the issue
    - fix: if it is a bug
    - feature: if is a user story
    - refactor: if you didn't add or fix anything

- **developer_name**: initials of developer
    example:    Jorge Ferrando Ferrando => jff
                Sveinung Faresveit => sf

- **issue_description**: the name of the issue without spaces:
    example: add user form => add_user_form

- **#issue_number**: the number of the issue

A complete issue will be like this:
    example: feature/jff/add_user_form_#123

# Write the commit message:
While you are developing you can write as much as commits you want. But after finish coding, in the rebase process you
should write a very clear commit like this one:

```
feat(uniform): add new custom field element

the new custom field element allows developers
to add fields that have a custom editor.

closes: #123
```

# Code review

- Checkout the branch and run it. It shouldn't throw any error
- Test the functionality added
- Review the code:
    - tslint should be fine
    - check code conventions and clean code

# Create the pull-request

- Go to github and create a pull-request of the branch
- attach the label `codereview` to the issue and the pull-request
- assign a reviewer to the issue

# Merge with develop (Rebase)

Do not merge the pull request to develop directly, instead use rebase.

You can see how to do git rebase in this wiki article:
[How to do a git rebase](https://github.com/unimicro/AppFrontend/wiki/How-to-do-a-git-rebase)

After finish the git rebase the pull-request will close itself alone.
