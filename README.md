
# App Frontend
Uni Economy Angular2 version

# Getting Started

1. Clone this repo

2. Install libraries `npm install` or `npm i`

3. Update entities `gulp entities`

4. Deploy app and watch for changes

`npm run start` / `npm run start.dev` will start and watch with AppConfig-dev </br>
`npm run start.local` will start and watch with AppConfig-local </br>
`npm run start.pilot` will start and watch with AppConfig-pilot </br>

All of these tasks also runs webpack-dev-server. When the compile is finished, open up localhost:3000 to run app. </br>

# NPM scripts
`build.vendors` will build vendors.bundle.js. This was previously done in our start task, but has been moved out to improve build times. Should run automatically after `npm install`. </br>

Start tasks covered in previous section. </br>

`build.dev`, `build.test`, `build.pilot`, `build.prod` are just building sass + ts once, no watchers and no dev server. These tasks are for deployment, and probably wont be used in a dev enviroment. </br>

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
