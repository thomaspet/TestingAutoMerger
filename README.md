
## Running the application

### Installing dependencies
`yarn install` / `npm install`

- - - -
### Updating the entities file
`yarn entities` / `npm run entities` 

- - - -
### Checking for AOT errors before pushing

Since we run JIT compile when developing some AOT specific errors might sneak in. To check for these before you push changes and make the build on jenkis fail you can use `yarn check-aot` / `npm run check-aot`

- - - -
### Serve with recompile and livereload

`yarn start` / `npm run start` to start with dev config</br>
`yarn start.test` / `npm run start.test` to start with test config<br>
`yarn start.local` / `npm run start.local` to start with local backend</br>
`yarn start.prod` / `npm run start.prod` to start app with proxy to prod api</br>

The app will run on localhost:3000</br>

- - - -
### Build

`yarn build.dev` / `npm run build.dev`<br>
`yarn build.test` / `npm run build.test`<br>
`yarn build.prod` / `npm run build.prod`<br>

<br>

## Writing a commit message

To make it easier to find the commit you're looking for when checking history, resolving a merge conflict and so on please follow a few simple guidelines on writing a commit message.

**Header**
- Prefix with commit type (feat/fix/chore/..)
- After prefix add the affected "area" of the application inside parentheses
- After that add a short summary of the changes

**Body**
- Ideally describe the changes more in-depth here. Add an empty line between header and body.

**Footer**
- Reference jira issue to the commit. This will make a link to the commit appear on the jira issue

<br>
**Example**
<br>

```
fix(signup): use button type=submit and remove click handler

Because the form already has a submit action, and the click handler
in addition to that was causing the post requests to run twice on
some browsers

UC-1131
```
