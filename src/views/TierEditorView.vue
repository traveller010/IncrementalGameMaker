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

        <!-- New Item Group Display -->
        <div class="item-group-list">
            <h4>Item Groups in this Tier ({{ tier.itemGroups.length }})</h4>
            <div v-if="tier.itemGroups.length === 0" class="no-items">No item groups added yet.</div>
            <table v-else>
                <thead>
                    <tr>
                        <th>Resource</th>
                        <th>Generator</th>
                        <th>Upgrade</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="group in tier.itemGroups" :key="group.id">
                        <td>{{ getResourceName(group.resourceId) || 'N/A' }}</td>
                        <td>{{ getGeneratorName(group.generatorId) || 'N/A' }}</td>
                        <td>{{ getUpgradeName(group.upgradeId) || 'N/A' }}</td>
                        <td>
                            <button @click="removeItemGroup(tier.id, group.id)" class="remove-item-btn">&times;</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- New Item Group Form -->
        <div class="item-group-form">
            <h4>Add New Item Group</h4>
            <form @submit.prevent="addItemGroup(tier.id)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Resource:</label>
                        <select v-model="newItemGroup[tier.id].resourceId">
                            <option :value="undefined">-- None --</option>
                            <option v-for="res in availableResources(tier)" :key="res.id" :value="res.id">{{ res.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Generator:</label>
                        <select v-model="newItemGroup[tier.id].generatorId">
                            <option :value="undefined">-- None --</option>
                            <option v-for="gen in availableGenerators(tier)" :key="gen.id" :value="gen.id">{{ gen.name }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Upgrade:</label>
                        <select v-model="newItemGroup[tier.id].upgradeId">
                            <option :value="undefined">-- None --</option>
                            <option v-for="upg in availableUpgrades(tier)" :key="upg.id" :value="upg.id">{{ upg.name }}</option>
                        </select>
                    </div>
                </div>
                <button type="submit">Add Group</button>
            </form>
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
import { ref, computed, watch } from 'vue';
import { useBlueprintStore } from '@/stores/blueprintStore';
import type { TierBlueprint, TierItemGroup } from '@/types/Blueprint';

const blueprintStore = useBlueprintStore();

const newTier = ref({ name: '' });
const newItemGroup = ref<Record<string, Omit<TierItemGroup, 'id'>>>({});

// Initialize newItemGroup state for each tier
watch(() => blueprintStore.blueprint.tiers, (tiers) => {
    tiers.forEach(tier => {
        if (!newItemGroup.value[tier.id]) {
            newItemGroup.value[tier.id] = { resourceId: undefined, generatorId: undefined, upgradeId: undefined };
        }
    });
}, { immediate: true, deep: true });

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
    const tierData = {
        id: generatedId.value,
        name: newTier.value.name.trim(),
    };
    blueprintStore.addTier(tierData);
    newTier.value.name = '';
};

const getResourceName = (id?: string) => blueprintStore.blueprint.resources.find(r => r.id === id)?.name || id;
const getGeneratorName = (id?: string) => blueprintStore.blueprint.generators.find(g => g.id === id)?.name || id;
const getUpgradeName = (id?: string) => blueprintStore.blueprint.upgrades.find(u => u.id === id)?.name || id;

// These computed properties now determine availability based on what's already in *any* group in the tier
const availableResources = (tier: TierBlueprint) => {
    const usedIds = new Set(tier.itemGroups.map(g => g.resourceId));
    return blueprintStore.blueprint.resources.filter(r => !usedIds.has(r.id));
};
const availableGenerators = (tier: TierBlueprint) => {
    const usedIds = new Set(tier.itemGroups.map(g => g.generatorId));
    return blueprintStore.blueprint.generators.filter(g => !usedIds.has(g.id));
};
const availableUpgrades = (tier: TierBlueprint) => {
    const usedIds = new Set(tier.itemGroups.map(g => g.upgradeId));
    return blueprintStore.blueprint.upgrades.filter(u => !usedIds.has(u.id));
};

const addItemGroup = (tierId: string) => {
    const group = newItemGroup.value[tierId];
    if (!group || (!group.resourceId && !group.generatorId && !group.upgradeId)) {
        alert("Please select at least one item for the group.");
        return;
    }
    blueprintStore.addItemGroupToTier(tierId, group);
    // Reset form for that tier
    newItemGroup.value[tierId] = { resourceId: undefined, generatorId: undefined, upgradeId: undefined };
};

const removeItemGroup = (tierId: string, groupId: string) => {
    blueprintStore.removeItemGroupFromTier(tierId, groupId);
};

</script>

<style scoped>
.tier-editor { max-width: 960px; margin: 2rem auto; padding: 20px; background-color: #1e1e1e; border-radius: 8px; color: #fff; }
h2 { color: #ccc; }
h3, h4 { color: #aaa; border-bottom: 1px solid #333; padding-bottom: 5px; margin-top: 1.5rem; }
.description { color: #888; margin-bottom: 2rem; }
.no-items { color: #888; font-style: italic; margin-top: 10px; }
.tier-item { background-color: #2a2a2a; border: 1px solid #333; border-radius: 6px; margin-bottom: 2rem; padding: 20px; }
.tier-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.tier-name { font-weight: bold; color: #76c7c0; font-size: 1.4em; }

.item-group-list { margin-top: 20px; }
.item-group-list table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.item-group-list th, .item-group-list td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #444; }
.item-group-list th { color: #ccc; }
.item-group-list td { color: #ddd; }

.item-group-form { margin-top: 20px; padding: 15px; background-color: #303030; border-radius: 5px; }
.item-group-form .form-row { display: flex; gap: 15px; margin-bottom: 10px; }
.form-group { flex: 1; }
.form-group label { display: block; margin-bottom: 5px; font-size: 0.9em; color: #bbb; }
.form-group select { width: 100%; padding: 8px; background-color: #3d3d3d; color: #fff; border: 1px solid #555; border-radius: 4px; }

.remove-item-btn { background: none; border: none; color: #dc3545; font-size: 1.5em; cursor: pointer; padding: 0; line-height: 1; }

.add-tier-form { margin-top: 20px; }
button { background-color: #007bff; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; transition: background-color 0.2s; }
button:hover { background-color: #0056b3; }
button:disabled { background-color: #555; cursor: not-allowed; }
hr { border-color: #333; margin: 30px 0; }
</style>