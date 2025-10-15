<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router';
import { version } from '../package.json';
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <nav class="nav-links">
        <RouterLink to="/">Resources</RouterLink>
        <RouterLink to="/generators">Generators</RouterLink>
        <RouterLink to="/upgrades">Upgrades</RouterLink>
      </nav>
      <span class="version-display">v{{ version }}</span>
    </div>
  </header>
  <main class="content-wrapper">
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
</style>