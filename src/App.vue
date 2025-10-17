<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView, RouterLink } from 'vue-router';
import { version } from '../package.json';
import { useBlueprintStore } from '@/stores/blueprintStore';

const blueprintStore = useBlueprintStore();

// Load the blueprint from local storage when the app is first mounted
onMounted(() => {
  blueprintStore.loadBlueprintFromLocalStorage();
});
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <nav class="nav-links">
        <RouterLink to="/">Resources</RouterLink>
        <RouterLink to="/generators">Generators</RouterLink>
        <RouterLink to="/upgrades">Upgrades</RouterLink>
        <RouterLink to="/tiers">Tiers</RouterLink>
      </nav>
      <span class="version-display">v{{ version }}</span>
    </div>
  </header>
  <main class="content-wrapper">
    <div class="persistence-controls">
      <button @click="blueprintStore.saveBlueprintToLocalStorage()">Save Blueprint</button>
      <button @click="blueprintStore.loadBlueprintFromLocalStorage()">Load Blueprint</button>
      <button @click="blueprintStore.resetBlueprint()" class="reset-btn">Reset to Default</button>
      <button @click="blueprintStore.exportGame()" class="export-btn">Export Game</button>
    </div>
    <RouterView />
  </main>
</template>

<style>
/* Global Styling Reset */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #121212; 
}
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0;
  font-weight: normal;
}

/* Header and Navigation Styles */
.app-header {
  background-color: #1e1e1e;
  padding: 15px 0;
  border-bottom: 2px solid #333;
  margin-bottom: 20px;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.version-display {
  color: #888;
  font-size: 0.9em;
  font-style: italic;
}

.nav-links a {
  color: #76c7c0;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1em;
  padding-bottom: 5px;
  border-bottom: 2px solid transparent;
  transition: border-bottom 0.2s;
}

.nav-links a.router-link-exact-active {
  color: #fff;
  border-bottom-color: #007bff; /* Active tab underline color */
}

.content-wrapper {
  padding-top: 10px;
}

.persistence-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #2a2a2a;
  border-radius: 6px;
}

.persistence-controls button {
  background-color: #007bff;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.persistence-controls .reset-btn {
  background-color: #6c757d;
}

.persistence-controls .export-btn {
  background-color: #28a745;
}
</style>