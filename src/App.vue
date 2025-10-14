<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router';
</script>

<template>
  <header class="app-header">
    <nav class="nav-links">
      <RouterLink to="/">Resources</RouterLink>
      <RouterLink to="/generators">Generators</RouterLink>
      </nav>
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

.nav-links {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
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