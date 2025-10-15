# Project Roadmap

This document outlines the planned features and tasks for the Incremental Game Maker. The nested checklist format is used to break down large features into smaller, manageable sub-tasks.

- [x] **Project Scaffolding & Core UI**
    - [x] Set up Vue.js project with Vite and TypeScript.
    - [x] Implement basic routing for different views.
    - [x] Create the main `App.vue` layout.
    - [x] Add basic styling for a dark theme.

- [x] **Resource Management**
    - [x] Create `ResourceEditorView.vue` to define game resources.
    - [x] Implement logic to add new resources to the blueprint.
    - [x] Display a list of currently defined resources.

- [x] **Generator Management**
    - [x] Create `GeneratorEditorView.vue` to define generators.
    - [x] Implement logic to add new generators to the blueprint.
    - [x] Allow generators to have multiple resource costs.
        - [x] Refactor cost management into a reusable `CostEditor.vue` component.
        - [x] Fix reactivity issues related to cost updates.

- [ ] **Formula System**
    - [ ] Enhance `FormulaEditor.vue` with more functions and variables.
    - [ ] Add validation to prevent invalid formulas.
    - [ ] Implement a more user-friendly formula builder UI.

- [ ] **Prestige & Tiers**
    - [ ] Design the data structure for prestige tiers.
    - [ ] Create a `PrestigeView.vue` to manage prestige settings.
    - [ ] Implement the core prestige logic (resetting progress, awarding currency).
        - [ ] Define what resources and generators are affected by prestige.
        - [ ] Create a formula for calculating prestige currency gain.

- [ ] **Upgrades System**
    - [ ] Design the data structure for upgrades.
    - [ ] Create an `UpgradeEditorView.vue` to define different upgrades.
        - [ ] Allow upgrades to target generators, resources, or global stats.
        - [ ] Implement cost scaling for upgrades.
    - [ ] Create a UI for players to purchase upgrades in the final game.

- [ ] **Game Export & Playtesting**
    - [ ] Implement functionality to export the current blueprint as a playable game.
        - [ ] Generate a static HTML/JS file that can be hosted.
        - [ ] Create a simple game UI for players to interact with.
    - [ ] Add a "Playtest" view within the editor to quickly test the current blueprint.

- [ ] **Project Documentation & Maintenance**
    - [x] Add a `CHANGELOG.md` to track changes.
    - [x] Add a `DESIGN.md` for brainstorming and architectural notes.
    - [x] Add this `ROADMAP.md` for tracking features and tasks.
    - [x] Implement a version display in the UI.
    - [ ] Improve unit test coverage across all components.
    - [ ] Set up CI/CD for automated testing and deployment.