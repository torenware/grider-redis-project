# card.svelte issue makes RBay app unstable

This is an issue I've documented in the Q&A section of Stephen Grider's Redis course on Udemy. My set up:

* Local install of `redis-stack-server`, installed via `brew install` ([see docs on Redis.io](https://redis.io/docs/stack/get-started/install/mac-os/))
* Redis at 127.0.0.1:6379, which is the default.

To reproduce the problem, this will suffice:

1. Download the repo and do npm install.
2. Point to your local `redis-stack-server` in .env.
3. Populate the database with `npm run seed`.
4. `npm run dev`
5. Browse to http://localhost:3000.
6. I get a 500 error: 
 
```
500

Cannot read properties of null (reading 'endingAt')

TypeError: Cannot read properties of null (reading 'endingAt')
    at card.svelte:18:22
    at Object.$$render (/Users/rtoren/projects/grider-redis/rbay-reference/node_modules/svelte/internal/index.js:1745:22)
    at eval (/src/routes/index.svelte:24:120)
    
    ...
```

* Now: sign up a user. This works for me.
* Create an item.
* Go back to front page and refresh. Look in the dev tools for the browser, and see the two errors, also related to `card.svelte`.

---



# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm init svelte@next

# create a new project in my-app
npm init svelte@next my-app
```

> Note: the `@next` is temporary

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
