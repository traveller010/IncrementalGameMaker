<template>
  <div class="resource-editor">
    <h2>Game Resources</h2>
    <p class="description">Define the resources players will accumulate (e.g., Cash, Energy, Dirt).</p>

    <div class="resource-list">
      <h3>Defined Resources ({{ blueprintStore.blueprint.resources.length }})</h3>
      <div v-for="resource in blueprintStore.blueprint.resources" :key="resource.id" class="resource-item">
        <span class="resource-name">{{ resource.name }}</span>
        <span class="resource-id">({{ resource.id }})</span>
        <span class="resource-initial">Starts at {{ formatNumber(resource.initialAmount) }}</span>
        <span v-if="resource.isPermanent" class="resource-initial">(PERMANENT)</span>
      </div>
    </div>
    
    <hr>

    <div class="add-resource-form">
      <h3>Add New Resource</h3>
      <form @submit.prevent="addNewResource">
        <div class="form-group">
          <label for="resourceName">Display Name:</label>
          <input id="resourceName" v-model="newResource.name" type="text" required>
        </div>

        <div class="form-group">
          <label for="initialAmount">Starting Amount:</label>
          <input id="initialAmount" v-model="newResource.initialAmount" type="number" step="1" min="0">
        </div>

        <div class="form-group checkbox-group">
          <input id="isPermanent" v-model="newResource.isPermanent" type="checkbox">
          <label for="isPermanent">Resource is Permanent (Does NOT reset on Prestige)</label>
        </div>
        
        <button type="submit" :disabled="!isFormValid">Add Resource</button>
        <p v-if="!isFormValid" class="error-message">Please ensure the display name is valid and unique.</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBlueprintStore } from '@/stores/blueprintStore';
import type { ResourceBlueprint } from '@/types/Blueprint';
import Decimal from 'break_infinity.js';

const blueprintStore = useBlueprintStore();

// --- Local state for the new resource form ---
const newResource = ref({
  name: '',
  initialAmount: 0,
  isPermanent: false, // ⬅️ INITIALIZED
});

// Helper function
const formatNumber = (value: Decimal | number): string => {
  if (value instanceof Decimal) {
    return value.toString();
  }
  return value.toLocaleString();
};

// Function to convert display name to a unique ID
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '_');
};

// The ID that will be used for the new resource, including a numerical suffix for uniqueness
const generatedId = computed(() => {
  const baseSlug = slugify(newResource.value.name);
  if (!baseSlug) return '';

  let uniqueId = baseSlug;
  let counter = 1;
  
  while (blueprintStore.blueprint.resources.some(r => r.id === uniqueId)) {
    uniqueId = `${baseSlug}_${counter}`;
    counter++;
  }
  return uniqueId;
});

const isFormValid = computed(() => {
  // Only need to check if the name is filled out, as ID is auto-generated
  return newResource.value.name.trim() !== '';
});

// --- Action ---
const addNewResource = () => {
  if (isFormValid.value) {
    const resourceData: ResourceBlueprint = {
      name: newResource.value.name.trim(),
      id: generatedId.value, 
      initialAmount: new Decimal(newResource.value.initialAmount),
      isPermanent: newResource.value.isPermanent, // ⬅️ PASSED
    };

    blueprintStore.addResource(resourceData);

    // Reset form
    newResource.value.name = '';
    newResource.value.initialAmount = 0;
    newResource.value.isPermanent = false;
  }
};
</script>

<style scoped>
.resource-editor {
  max-width: 800px;
  margin: 2rem auto;
  padding: 20px;
  background-color: #1e1e1e; 
  border-radius: 8px;
  color: #fff;
}

h2 { color: #ccc; margin-bottom: 0.5rem; }
h3 { color: #aaa; margin-top: 1.5rem; border-bottom: 1px solid #333; padding-bottom: 5px; }
.description { color: #888; margin-bottom: 2rem; }

.resource-list {
  margin-bottom: 1.5rem;
}

.resource-item {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dotted #333;
  color: #fff;
}

.resource-name { font-weight: bold; color: #76c7c0; }
.resource-id { font-style: italic; color: #555; }
.resource-initial { color: #888; }

.form-group {
  margin-bottom: 15px;
}
.checkbox-group { /* Basic style for the new checkbox layout */
    display: flex;
    align-items: center;
}
.checkbox-group input {
    width: auto;
    margin-right: 10px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #ccc;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: #fff;
  box-sizing: border-box;
  font-size: 1em;
}

button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
}

hr { border-color: #333; margin: 20px 0; }
</style>