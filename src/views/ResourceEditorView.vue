<template>
  <div class="resource-editor">
    <h2>Define Resources</h2>
    <p class="description">Create the primary currencies or materials for your game, like Wood, Gold, or Science Points.</p>
    
    <!-- Edit Section -->
    <div class="edit-resource-section">
        <h3>Edit Existing Resource</h3>
        <select v-model="editingResourceId" class="edit-select">
            <option :value="null">-- Create a new resource --</option>
            <option v-for="res in blueprintStore.blueprint.resources" :key="res.id" :value="res.id">
                {{ res.name }} ({{ res.id }})
            </option>
        </select>
    </div>

    <hr>

    <div class="add-resource-form">
      <h3>{{ editingResourceId ? 'Edit Resource' : 'Add New Resource' }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="resourceName">Display Name:</label>
          <input id="resourceName" v-model="newResource.name" type="text" required>
          <small>The name players will see (e.g., "Mana Points").</small>
        </div>

        <div class="form-group">
          <label for="resourceId">Generated ID:</label>
          <input id="resourceId" :value="generatedId" type="text" disabled>
          <small>A unique ID for this resource, used in formulas. Cannot be changed after creation.</small>
        </div>

        <div class="form-group">
          <label for="initialAmount">Initial Amount:</label>
          <input id="initialAmount" v-model="newResource.initialAmount" type="number" step="any" required>
          <small>The amount of this resource the player starts with.</small>
        </div>

        <div class="form-group checkbox-group">
          <input id="isPermanent" v-model="newResource.isPermanent" type="checkbox">
          <label for="isPermanent">Is Permanent?</label>
          <small>Does this resource persist through prestiges? (Feature coming soon).</small>
        </div>

        <button type="submit" :disabled="!isFormValid">{{ editingResourceId ? 'Save Changes' : 'Add Resource' }}</button>
         <button type="button" v-if="editingResourceId" @click="editingResourceId = null" class="cancel-btn">Cancel Edit</button>
      </form>
    </div>

    <hr>

    <div class="resource-list">
      <h3>Defined Resources ({{ blueprintStore.blueprint.resources.length }})</h3>
      <div v-if="blueprintStore.blueprint.resources.length === 0" class="no-items">
        No resources defined yet.
      </div>
      <ul>
        <li v-for="res in blueprintStore.blueprint.resources" :key="res.id">
          <span class="resource-name">{{ res.name }}</span>
          <span class="resource-id">({{ res.id }})</span>
          <span class="resource-details">
            Initial: {{ res.initialAmount.toString() }}, Permanent: {{ res.isPermanent ? 'Yes' : 'No' }}
          </span>
           <button @click="editingResourceId = res.id" class="edit-btn">Edit</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useBlueprintStore } from '@/stores/blueprintStore';
import type { ResourceBlueprint, ResourceFormData } from '@/types/Blueprint';
import Decimal from 'break_infinity.js';

const blueprintStore = useBlueprintStore();

const newResource = ref<ResourceFormData>({
  id: '',
  name: '',
  initialAmount: '0',
  isPermanent: false,
});

const editingResourceId = ref<string | null>(null);

// Watch for changes in the selected resource to edit
watch(editingResourceId, (newId) => {
    if (newId) {
        const resourceToEdit = blueprintStore.blueprint.resources.find(r => r.id === newId);
        if (resourceToEdit) {
            newResource.value = {
                id: resourceToEdit.id,
                name: resourceToEdit.name,
                initialAmount: resourceToEdit.initialAmount.toString(),
                isPermanent: resourceToEdit.isPermanent,
            };
        }
    } else {
        // Reset form when not editing
        newResource.value = { id: '', name: '', initialAmount: '0', isPermanent: false };
    }
});

const slugify = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s-]+/g, '_');

const generatedId = computed(() => {
    if (editingResourceId.value) return editingResourceId.value; // Keep ID stable when editing
    const baseSlug = slugify(newResource.value.name);
    if (!baseSlug) return '';
    let uniqueId = baseSlug;
    let counter = 1;
    // Ensure ID is unique only when creating a new resource
    if (!editingResourceId.value) {
        while (blueprintStore.blueprint.resources.some(r => r.id === uniqueId)) {
            uniqueId = `${baseSlug}_${counter}`;
            counter++;
        }
    }
    return uniqueId;
});

const isFormValid = computed(() => {
  return newResource.value.name.trim() !== '' && !isNaN(parseFloat(newResource.value.initialAmount));
});

const handleSubmit = () => {
    if (!isFormValid.value) {
        alert('Please fill out the form correctly.');
        return;
    }
    const resourceData: ResourceBlueprint = {
        id: generatedId.value,
        name: newResource.value.name.trim(),
        initialAmount: new Decimal(newResource.value.initialAmount),
        isPermanent: newResource.value.isPermanent,
    };

    if (editingResourceId.value) {
        blueprintStore.updateResource(resourceData);
    } else {
        blueprintStore.addResource(resourceData);
    }

    // Reset form and editing state
    newResource.value = { id: '', name: '', initialAmount: '0', isPermanent: false };
    editingResourceId.value = null;
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

h2 { color: #ccc; }
h3 { color: #aaa; border-bottom: 1px solid #333; padding-bottom: 5px; }
.description { color: #888; margin-bottom: 2rem; }

.edit-resource-section, .add-resource-form, .resource-list {
  background-color: #2a2a2a;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.edit-select {
    width: 100%;
    padding: 8px;
    background-color: #333;
    color: #fff;
    border: 1px solid #555;
    border-radius: 4px;
}

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 5px; }
.form-group input[type="text"],
.form-group input[type="number"] {
  width: 100%;
  padding: 8px;
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
}
.form-group small { display: block; color: #888; margin-top: 4px; font-size: 0.8em; }

.checkbox-group { display: flex; align-items: center; }
.checkbox-group input { margin-right: 10px; }

button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}
button:disabled { background-color: #555; }
.cancel-btn { background-color: #6c757d; }
.edit-btn {
    background-color: #ffc107;
    color: #212529;
    padding: 5px 10px;
    font-size: 0.9em;
}

hr { border-color: #333; margin: 20px 0; }
.no-items { color: #888; font-style: italic; }
.resource-list ul { list-style: none; padding: 0; }
.resource-list li {
  background-color: #333;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}
.resource-name { font-weight: bold; flex-grow: 1; }
.resource-id { color: #aaa; font-family: monospace; }
.resource-details { color: #ccc; font-size: 0.9em; }
</style>