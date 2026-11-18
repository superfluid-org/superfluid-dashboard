<h1 align="center">Superfluid Dashboard</h1>

<p>
  <a href="https://x.com/Superfluid_HQ" target="_blank">
    <img alt="X (Twitter): Superfluid_HQ" src="https://img.shields.io/twitter/follow/Superfluid_HQ.svg?style=social" />
  </a>
</p>

The Superfluid Dashboard is the primary user-facing window into the Superfluid protocol. It is live at https://app.superfluid.org.

It allows users to send and receive streaming payments as well as see their various flows visualised. </br>
It provides a jumping-off point for users in the Superfluid ecosystem to access value-add products. </br>
It teaches end-users and developers the fundamental principles of streaming

This repository implements the Superfluid Dashboard as a Next.js web app built on Superfluid's SDK-CORE and SDK-REDUX.

## Run locally

```sh
pnpm install
cp .env.example .env
pnpm dev
```

The app starts on http://localhost:3000. Run `pnpm generate` after changing a GraphQL query.

## Deployment

The app is deployed on Vercel.

## Resources for the Superfluid Dashboard

### ⚡ [Dashboard Product Requirements Notion](https://www.notion.so/superfluidhq/Superfluid-Dashboard-98caed8aab04448aaa6d22a8be0aadbb)

### 📃 [Dashboard Backlog Notion](https://www.notion.so/superfluidhq/4c888d49859043f6b9a5712007d5007b?v=62de36cb74c044258b8b0edc8d96a481)

### 📲 [Dashboard Figma](https://www.figma.com/file/FzYRC5kTtAW8HYhhvIUIsQ/User-Dashboard-v2)

### 📊 [Superfluid Design System Figma](https://www.figma.com/file/jjsALikq4lj8gHI8p9xAFy/Design-System-v2---MUI)


## Resources for the Superfluid Protocol

### 🏠 [Homepage](https://superfluid.org)

### ✨ [Superfluid Explorer](https://explorer.superfluid.org/)

### 📖 [Docs](https://docs.superfluid.org)

## Notes

### Browser support

Minimum supported browsers: Chrome 117, Safari 17, Firefox 121 — the floor set by Material UI v9. Older browsers may render a broken or unstyled dashboard without any error message. The floor was accepted 2026-07-28 without analytics verification; revisit if broken-rendering reports arrive from older browsers (see `docs/plans/mui-v6-to-v9-upgrade.md`, §Step 4 outcome).

### `window.superfluid_dashboard.advanced.nextGasOverrides`

Gas settings (`gasLimit`, `gasPrice`, `maxFeePerGas`, `maxPriorityFeePerGas` as `bigint`, `number` or `string`) to override for only the next transaction attempt. Example usage: `window.superfluid_dashboard.advanced.nextGasOverrides.gasLimit = 1_000_000`

### `window.superfluid_dashboard.advanced.addCustomToken`

`addCustomToken` is a function that allows you to add a custom token to the Superfluid Dashboard. Example usage: `window.superfluid_dashboard.advanced.addCustomToken({ chainId: 1, customToken: "0xd27dd3deec7eb1f1f48d9eb66f4a548c8cc04889" })`