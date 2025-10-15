# Design Document

This document outlines the high-level design principles, architecture, and core concepts for the Incremental Game Maker. It is intended to be a living document that evolves with the project.

## 1. Core Concepts

*   **Blueprints:** The entire game is defined by a single, comprehensive "blueprint" object. This object contains all the definitions for resources, generators, upgrades, and other game entities. This approach makes game state easy to save, load, and modify.
*   **Generators:** These are the primary production units in the game. They consume resources to be built and produce other resources over time. Their production and cost can be defined by complex formulas.
*   **Decoupled UI:** The UI components are designed to be as decoupled as possible from the core game logic. They primarily read from and write to the blueprint store, which acts as a single source of truth.

## 2. Architecture

*   **Frontend Framework:** Vue.js 3 with the Composition API.
*   **State Management:** Pinia is used for centralized state management, holding the master game blueprint.
*   **Data Model:** The game's structure is defined in `src/types/Blueprint.ts`, which provides strong typing for all game entities.

## 3. Future Ideas & Brainstorming

*(This section is for brainstorming and capturing ideas that may or may not be implemented.)*

*   **Prestige System:** Introduce prestige tiers that reset progress in exchange for powerful, permanent bonuses.
*   **Upgrades:** Implement a system for purchasing upgrades that can affect generator production, costs, or other game mechanics.
*   **Automation:** Add automation features that can be unlocked to perform tasks automatically, such as buying generators.
*   **Skill Tree:** A visual skill tree where players can spend prestige points to unlock unique abilities or bonuses.
*   **Modding Support:** Could the blueprint system be extended to allow users to easily create and share their own game mods?