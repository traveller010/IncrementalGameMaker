# Incremental Game Maker (Blueprint Editor)

This repository contains the source code for the **Incremental Game Maker**, a web-based tool designed to help you create and prototype incremental games without writing any code. It uses Vue 3, Pinia, and TypeScript to provide a flexible and powerful editor for defining game "blueprints."

The core idea is to define all aspects of your game—resources, generators, costs, and formulas—in a structured data format. This blueprint can then be used to generate a playable game.

## Project Documentation

To help organize development and provide clarity, this project includes several key documents:

-   **[DESIGN.md](DESIGN.md):** Outlines the high-level design principles, architecture, and core concepts of the application. A great place to start for understanding the "why" behind the code.
-   **[ROADMAP.md](ROADMAP.md):** A nested checklist that tracks planned features and tasks. See what's coming next and where you can contribute.
-   **[CHANGELOG.md](CHANGELOG.md):** A log of all notable changes, fixes, and new features for each version.

## Features

-   **Resource Editor:** Define the core currencies and materials for your game.
-   **Generator Editor:** Create production units that generate resources.
-   **Dynamic Costing:** Assign multiple, variable resource costs to generators.
-   **Formula Engine:** Use a simple formula system to define production and cost scaling.
-   **Live Versioning:** The current version of the application is always visible in the header.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

---

## Recommended IDE and Browser Setup

-   **IDE:** [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (Vetur should be disabled).
-   **Browser DevTools:**
    -   **Chrome:** [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
    -   **Firefox:** [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
    -   Enable the "Custom Object Formatter" in your browser's developer tools for a better debugging experience.