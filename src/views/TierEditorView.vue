<template>
  <div class="tier-editor">
    <h2>Tiers / Locations</h2>
    <p class="description">Define different stages or locations for your game and assign resources, generators, and upgrades to them.</p>

    <div class="tier-list">
      <h3>Defined Tiers ({{ blueprintStore.blueprint.tiers.length }})</h3>
      <div v-for="tier in blueprintStore.blueprint.tiers" :key="tier.id" class="tier-item">
        <div class="tier-header">
          <span class="tier-name">{{ tier.name }}</span>
          <span class="tier-id">({{ tier.id }})</span>
        </div>
        <div class="tier-content">
          <div class="item-selection">
            <h4>Add Items to Tier</h4>
            <div class="form-group">
              <label>Select Resource:</label>
              <select @change="addItemToTier(tier.id, 'resources', $event)">
                <option disabled selected>-- add resource --</option>
                <option v-for="res in availableResources(tier)" :key="res.id" :value="res.id">{{ res.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Select Generator:</label>
              <select @change="addItemToTier(tier.id, 'generators', $event)">
                <option disabled selected>-- add generator --</option>
                <option v-for="gen in availableGenerators(tier)" :key="gen.id" :value="gen.id">{{ gen.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Select Upgrade:</label>
              <select @change="addItemToTier(tier.id, 'upgrades', $event)">
                <option disabled selected>-- add upgrade --</option>
                <option v-for="upg in availableUpgrades(tier)" :key="upg.id" :value="upg.id">{{ upg.name }}</option>
              </select>
            </div>
          </div>
          <div class="item-lists">
            <div v-if="tier.resources.length > 0">
              <h4>Resources in this Tier</h4>
              <ul>
                <li v-for="resId in tier.resources" :key="resId">
                  {{ getResourceName(resId) }}
                  <button @click="removeItemFromTier(tier.id, 'resources', resId)" class="remove-item-btn">&times;</button>
                </li>
              </ul>
            </div>
            <div v-if="tier.generators.length > 0">
              <h4>Generators in this Tier</h4>
              <ul>
                <li v-for="genId in tier.generators" :key="genId">
                  {{ getGeneratorName(genId) }}
                  <button @click="removeItemFromTier(tier.id, 'generators', genId)" class="remove-item-btn">&times;</button>
                </li>
              </ul>
            </div>
            <div v-if="tier.upgrades.length > 0">
              <h4>Upgrades in this Tier</h4>
              <ul>
                <li v-for="upgId in tier.upgrades" :key="upgId">
                  {{ getUpgradeName(upgId) }}
                  <button @click="removeItemFromTier(tier.id, 'upgrades', upgId)" class="remove-item-btn">&times;</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <p v-if="blueprintStore.blueprint.tiers.length === 0" class="no-items">No tiers defined yet.</p>
    </div>

    <hr>

    <div class="add-tier-form">
      <h3>Add New Tier</h3>
      <form @submit.prevent="addNewTier">
        <div class="form-group">
          <label for="tierName">Display Name:</label>
          <input id="tierName" v-model="newTier.name" type="text" required>
        </div>
        <button type="submit" :disabled="!isFormValid">Add Tier</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBlueprintStore } from '@/stores/blueprintStore';
import type { TierBlueprint } from '@/types/Blueprint';

const blueprintStore = useBlueprintStore();

const newTier = ref({ name: '' });

const slugify = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s-]+/g, '_');

const generatedId = computed(() => {
  const baseSlug = slugify(newTier.value.name);
  if (!baseSlug) return '';
  let uniqueId = baseSlug;
  let counter = 1;
  while (blueprintStore.blueprint.tiers.some(t => t.id === uniqueId)) {
    uniqueId = `${baseSlug}_${counter}`;
    counter++;
  }
  return uniqueId;
});

const isFormValid = computed(() => newTier.value.name.trim() !== '');

const addNewTier = () => {
  if (!isFormValid.value) return;
  const tierData: TierBlueprint = {
    id: generatedId.value,
    name: newTier.value.name.trim(),
    generators: [],
    upgrades: [],
    resources: [],
  };
  blueprintStore.addTier(tierData);
  newTier.value.name = '';
};

const getResourceName = (id: string) => blueprintStore.blueprint.resources.find(r => r.id === id)?.name || id;
const getGeneratorName = (id: string) => blueprintStore.blueprint.generators.find(g => g.id === id)?.name || id;
const getUpgradeName = (id: string) => blueprintStore.blueprint.upgrades.find(u => u.id === id)?.name || id;

const availableResources = (tier: TierBlueprint) => blueprintStore.blueprint.resources.filter(r => !tier.resources.includes(r.id));
const availableGenerators = (tier: TierBlueprint) => blueprintStore.blueprint.generators.filter(g => !tier.generators.includes(g.id));
const availableUpgrades = (tier: TierBlueprint) => blueprintStore.blueprint.upgrades.filter(u => !tier.upgrades.includes(u.id));

const addItemToTier = (tierId: string, itemType: 'resources' | 'generators' | 'upgrades', event: Event) => {
  const select = event.target as HTMLSelectElement;
  const itemId = select.value;
  blueprintStore.addItemToTier(tierId, itemType, itemId);
  select.value = ''; // Reset dropdown
};

const removeItemFromTier = (tierId: string, itemType: 'resources' | 'generators' | 'upgrades', itemId: string) => {
  blueprintStore.removeItemFromTier(tierId, itemType, itemId);
};

</script>

<style scoped>
.tier-editor { max-width: 800px; margin: 2rem auto; padding: 20px; background-color: #1e1e1e; border-radius: 8px; color: #fff; }
h2 { color: #ccc; }
h3 { color: #aaa; border-bottom: 1px solid #333; padding-bottom: 5px; }
.description { color: #888; margin-bottom: 2rem; }
.no-items { color: #888; font-style: italic; }
.tier-item { background-color: #2a2a2a; border: 1px solid #333; border-radius: 6px; margin-bottom: 1rem; padding: 15px; }
.tier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.tier-name { font-weight: bold; color: #76c7c0; font-size: 1.2em; }
.tier-content { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.item-selection h4, .item-lists h4 { margin-top: 0; color: #aaa; }
.form-group { margin-bottom: 10px; }
.form-group label { display: block; margin-bottom: 5px; }
.form-group select { width: 100%; padding: 8px; background-color: #333; color: #fff; border: 1px solid #555; border-radius: 4px; }
.item-lists ul { list-style: none; padding: 0; }
.item-lists li { display: flex; justify-content: space-between; align-items: center; padding: 5px 0; }
.remove-item-btn { background: none; border: none; color: #dc3545; font-size: 1.2em; cursor: pointer; }
.add-tier-form { margin-top: 20px; }
button { background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
button:disabled { background-color: #555; }
hr { border-color: #333; margin: 20px 0; }
</style>