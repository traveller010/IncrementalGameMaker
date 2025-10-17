<template>
  <div class="upgrade-editor">
    <h2>Game Upgrades</h2>
    <p class="description">Define upgrades that provide bonuses or unlock new features.</p>

    <!-- Edit Section -->
    <div class="edit-upgrade-section">
        <h3>Edit Existing Upgrade</h3>
        <select v-model="editingUpgradeId" class="edit-select">
            <option :value="null">-- Create a new upgrade --</option>
            <option v-for="upg in blueprintStore.blueprint.upgrades" :key="upg.id" :value="upg.id">
                {{ upg.name }} ({{ upg.id }})
            </option>
        </select>
    </div>

    <hr>

    <div class="add-upgrade-form">
      <h3>{{ editingUpgradeId ? 'Edit Upgrade' : 'Add New Upgrade' }}</h3>
      <form @submit.prevent="handleSubmit">
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

        <button type="submit" :disabled="!isFormValid">{{ editingUpgradeId ? 'Save Changes' : 'Add Upgrade' }}</button>
        <button type="button" v-if="editingUpgradeId" @click="editingUpgradeId = null" class="cancel-btn">Cancel Edit</button>
      </form>
    </div>

    <hr>

    <div class="upgrade-list">
      <h3>Defined Upgrades ({{ blueprintStore.blueprint.upgrades.length }})</h3>
      <div v-for="upgrade in blueprintStore.blueprint.upgrades" :key="upgrade.id" class="upgrade-item">
        <span class="upgrade-name">{{ upgrade.name }}</span>
        <span class="upgrade-id">({{ upgrade.id }})</span>
        <span class="upgrade-target">Targets: {{ upgrade.targetId }}</span>
        <button @click="editingUpgradeId = upgrade.id" class="edit-btn">Edit</button>
      </div>
      <p v-if="blueprintStore.blueprint.upgrades.length === 0" class="no-items">No upgrades defined yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useBlueprintStore } from '@/stores/blueprintStore';
import type {
    UpgradeBlueprint,
    StructuredFormula,
    UnlockCondition,
    UpgradeFormData,
    FormPurchaseCost
} from '@/types/Blueprint';
import Decimal from 'break_infinity.js';
import FormulaEditor from '@/components/FormulaEditor.vue';
import CostEditor from '@/components/CostEditor.vue';

const blueprintStore = useBlueprintStore();

const createDefaultFormula = (): StructuredFormula => ({
  steps: [{ type: 'constant', value: '1', operation: 'set' }],
});

const getInitialUpgradeState = (): UpgradeFormData => ({
    id: '',
    name: '',
    description: '',
    targetId: '',
    baseCosts: [] as FormPurchaseCost[],
    effectFormula: createDefaultFormula(),
    costFormula: createDefaultFormula(),
    unlockConditions: [] as UnlockCondition[],
});

const newUpgrade = ref<UpgradeFormData>(getInitialUpgradeState());
const editingUpgradeId = ref<string | null>(null);

watch(editingUpgradeId, (newId) => {
    if (newId) {
        const upgToEdit = blueprintStore.blueprint.upgrades.find(u => u.id === newId);
        if (upgToEdit) {
            newUpgrade.value = {
                ...upgToEdit,
                baseCosts: upgToEdit.baseCosts.map(c => ({ ...c, amount: c.amount.toString() })),
                effectFormula: JSON.parse(JSON.stringify(upgToEdit.effectFormula)),
                costFormula: JSON.parse(JSON.stringify(upgToEdit.costFormula)),
            };
        }
    } else {
        newUpgrade.value = getInitialUpgradeState();
    }
});

const slugify = (text: string): string => {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s-]+/g, '_');
};

const generatedId = computed(() => {
    if (editingUpgradeId.value) return editingUpgradeId.value;
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
    newUpgrade.value.baseCosts.every(cost => cost.resourceId !== '' && new Decimal(cost.amount).gt(0))
  );
});

const handleSubmit = () => {
  if (!isFormValid.value) return;

  const upgradeData: UpgradeBlueprint = {
    id: generatedId.value,
    name: newUpgrade.value.name.trim(),
    description: newUpgrade.value.description.trim(),
    targetId: newUpgrade.value.targetId,
    effectFormula: newUpgrade.value.effectFormula,
    costFormula: newUpgrade.value.costFormula,
    unlockConditions: newUpgrade.value.unlockConditions,
    baseCosts: newUpgrade.value.baseCosts.map(cost => ({
      resourceId: cost.resourceId,
      amount: new Decimal(cost.amount),
    })),
  };

  if (editingUpgradeId.value) {
      blueprintStore.updateUpgrade(upgradeData);
  } else {
      blueprintStore.addUpgrade(upgradeData);
  }

  newUpgrade.value = getInitialUpgradeState();
  editingUpgradeId.value = null;
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

.edit-upgrade-section {
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

.upgrade-list {
  margin-bottom: 1.5rem;
}

.upgrade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  margin-right: 10px;
}

button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.cancel-btn { background-color: #6c757d; }
.edit-btn {
    background-color: #ffc107;
    color: #212529;
    padding: 5px 10px;
    font-size: 0.9em;
}

hr { border-color: #333; margin: 20px 0; }
.formula-spacing { margin-bottom: 20px; }
</style>