<h1 align="center">Welcome to the Superfluid Dashboard v2 Repo👋</h1>

<p>
  <a href="https://twitter.com/Superfluid_HQ/status/" target="_blank">
    <img alt="Twitter: Superfluid_HQ" src="https://img.shields.io/twitter/follow/Superfluid_HQ.svg?style=social" />
  </a>
</p>

## Superfluid Dashboard v2

The Superfluid Dashboard is the primary user-facing window into the Superfluid protocol.

It allows users to send and receive streaming payments as well as see their various flows visualised. </br>
It provides a jumping-off point for users in the Superfluid ecosystem to access value-add products. </br>
It teaches end-users and developers the fundamental principles of streaming 

This repository implements the Superfluid Dashboard v2 as a Next.js web app built on Superfluid's SDK-CORE and SDK-REDUX. 

## Resources for the Superfluid Dashboard

### ⚡ [Dashboard v2 Product Requirements Notion](https://www.notion.so/superfluidhq/Superfluid-Dashboard-98caed8aab04448aaa6d22a8be0aadbb)

### 📃 [Dashboard v2 Backlog Notion](https://www.notion.so/superfluidhq/4c888d49859043f6b9a5712007d5007b?v=62de36cb74c044258b8b0edc8d96a481)

### 📲 [Dashboard v2 Figma](https://www.figma.com/file/FzYRC5kTtAW8HYhhvIUIsQ/User-Dashboard-v2)

### 📊 [Superfluid Design System Figma](https://www.figma.com/file/jjsALikq4lj8gHI8p9xAFy/Design-System-v2---MUI)


## Resources for the Superfluid Protocol

### 🏠 [Homepage](https://superfluid.finance)

### ✨ [Superfluid Dashboard v1](https://app.superfluid.finance/)

### ✨ [Superfluid Console](https://console.superfluid.finance/)

### 📖 [Docs](https://docs.superfluid.finance)

## Notes

### `window.superfluid_dashboard.advanced.nextGasOverrides`

Gas settings (`gasLimit`, `gasPrice`, `maxFeePerGas`, `maxPriorityFeePerGas` as `bigint`, `number` or `string`) to override for only the next transaction attempt. Example usage: `window.superfluid_dashboard.advanced.nextGasOverrides.gasLimit = 1_000_000`

### `window.superfluid_dashboard.advanced.addCustomToken`

`addCustomToken` is a function that allows you to add a custom token to the Superfluid Dashboard. Example usage: `window.superfluid_dashboard.advanced.addCustomToken({ chainId: 1, customToken: "0xd27dd3deec7eb1f1f48d9eb66f4a548c8cc04889" })`