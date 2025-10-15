<template>
  <div class="upgrade-editor">
    <h2>Game Upgrades</h2>
    <p class="description">Define upgrades that provide bonuses or unlock new features.</p>

    <div class="upgrade-list">
      <h3>Defined Upgrades ({{ blueprintStore.blueprint.upgrades.length }})</h3>
      <div v-for="upgrade in blueprintStore.blueprint.upgrades" :key="upgrade.id" class="upgrade-item">
        <span class="upgrade-name">{{ upgrade.name }}</span>
        <span class="upgrade-id">({{ upgrade.id }})</span>
        <span class="upgrade-target">Targets: {{ upgrade.targetId }}</span>
      </div>
      <p v-if="blueprintStore.blueprint.upgrades.length === 0" class="no-items">No upgrades defined yet.</p>
    </div>

    <hr>

    <div class="add-upgrade-form">
      <h3>Add New Upgrade</h3>
      <form @submit.prevent="addNewUpgrade">
        <div class="form-group">
          <label for="upgradeName">Display Name:</label>
          <input id="upgradeName" v-model="newUpgrade.name" type="text" required>
        </div>

        <div class="form-group">
          <label for="upgradeDescription">Description:</label>
          <textarea id="upgradeDescription" v-model="newUpgrade.description"></textarea>
        </div>

        <div class="form-group">
          <label for="upgradeTarget">Target:</label>
          <select id="upgradeTarget" v-model="newUpgrade.targetId" required>
            <option value="" disabled>Select Target</option>
            <optgroup label="Generators">
              <option v-for="gen in blueprintStore.blueprint.generators" :key="gen.id" :value="gen.id">
                {{ gen.name }}
              </option>
            </optgroup>
            <optgroup label="Resources">
              <option v-for="res in blueprintStore.blueprint.resources" :key="res.id" :value="res.id">
                {{ res.name }}
              </option>
            </optgroup>
          </select>
        </div>

        <CostEditor v-model="newUpgrade.baseCosts" />

        <div class="formula-spacing"></div>

        <FormulaEditor v-model:formula="newUpgrade.effectFormula" title="Effect" />

        <div class="formula-spacing"></div>

        <FormulaEditor v-model:formula="newUpgrade.costFormula" title="Cost Scaling" />

        <hr>

        <button type="submit" :disabled="!isFormValid">Add Upgrade</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBlueprintStore } from '@/stores/blueprintStore';
import type { UpgradeBlueprint, StructuredFormula, PurchaseCost, UnlockCondition } from '@/types/Blueprint';
import Decimal from 'break_infinity.js';
import FormulaEditor from '@/components/FormulaEditor.vue';
import CostEditor from '@/components/CostEditor.vue';

const blueprintStore = useBlueprintStore();

const createDefaultFormula = (): StructuredFormula => ({
  steps: [{ type: 'constant', value: '1', operation: 'set' }],
});

const newUpgrade = ref({
  name: '',
  description: '',
  targetId: '',
  baseCosts: [] as PurchaseCost[],
  effectFormula: createDefaultFormula(),
  costFormula: createDefaultFormula(),
  unlockConditions: [] as UnlockCondition[],
});

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '_');
};

const generatedId = computed(() => {
  const baseSlug = slugify(newUpgrade.value.name);
  if (!baseSlug) return '';
  let uniqueId = baseSlug;
  let counter = 1;
  while (blueprintStore.blueprint.upgrades.some(u => u.id === uniqueId)) {
    uniqueId = `${baseSlug}_${counter}`;
    counter++;
  }
  return uniqueId;
});

const isFormValid = computed(() => {
  return (
    newUpgrade.value.name.trim() !== '' &&
    newUpgrade.value.targetId !== '' &&
    newUpgrade.value.baseCosts.length > 0 &&
    newUpgrade.value.baseCosts.every(cost => cost.resourceId !== '' && cost.amount.gt(0))
  );
});

const addNewUpgrade = () => {
  if (!isFormValid.value) return;

  const upgradeData: UpgradeBlueprint = {
    id: generatedId.value,
    name: newUpgrade.value.name.trim(),
    description: newUpgrade.value.description.trim(),
    targetId: newUpgrade.value.targetId,
    baseCosts: newUpgrade.value.baseCosts.map(cost => ({
      ...cost,
      amount: new Decimal(cost.amount),
    })),
    effectFormula: newUpgrade.value.effectFormula,
    costFormula: newUpgrade.value.costFormula,
    unlockConditions: newUpgrade.value.unlockConditions,
  };

  blueprintStore.addUpgrade(upgradeData);

  // Reset form
  newUpgrade.value.name = '';
  newUpgrade.value.description = '';
  newUpgrade.value.targetId = '';
  newUpgrade.value.baseCosts = [];
  newUpgrade.value.effectFormula = createDefaultFormula();
  newUpgrade.value.costFormula = createDefaultFormula();
  newUpgrade.value.unlockConditions = [];
};
</script>

<style scoped>
.upgrade-editor {
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
.no-items { color: #888; font-style: italic; margin-top: 10px; }

.upgrade-list {
  margin-bottom: 1.5rem;
}

.upgrade-item {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dotted #333;
  color: #fff;
}

.upgrade-name { font-weight: bold; color: #76c7c0; }
.upgrade-id { font-style: italic; color: #555; }
.upgrade-target { color: #888; }

.add-upgrade-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #ccc;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: #fff;
  box-sizing: border-box;
  font-size: 1em;
}

textarea {
  min-height: 80px;
  resize: vertical;
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

hr { border-color: #333; margin: 20px 0; }
.formula-spacing { margin-bottom: 20px; }
</style>