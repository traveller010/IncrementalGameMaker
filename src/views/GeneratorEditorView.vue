<template>
  <div class="generator-editor">
    <h2>Game Generators</h2>
    <p class="description">Define the production units that convert resources into others (e.g., Land Plot).</p>

    <!-- Edit Section -->
    <div class="edit-generator-section">
        <h3>Edit Existing Generator</h3>
        <select v-model="editingGeneratorId" class="edit-select">
            <option :value="null">-- Create a new generator --</option>
            <option v-for="gen in blueprintStore.blueprint.generators" :key="gen.id" :value="gen.id">
                {{ gen.name }} ({{ gen.id }})
            </option>
        </select>
    </div>

    <hr>

    <div class="add-generator-form">
      <h3>{{ editingGeneratorId ? 'Edit Generator' : 'Add New Generator' }}</h3>
      <form @submit.prevent="handleSubmit">
        
        <div class="form-group">
          <label for="generatorName">Display Name:</label>
          <input id="generatorName" v-model="newGenerator.name" type="text" required>
        </div>
        
        <div class="form-group">
          <label for="outputResource">Resource Produced:</label>
          <select id="outputResource" v-model="newGenerator.outputResource" required>
            <option value="" disabled>Select Output Resource</option>
            <option v-for="resource in blueprintStore.getResourceNames" :key="resource.id" :value="resource.id">
              {{ resource.name }} ({{ resource.id }})
            </option>
          </select>
          <p v-if="blueprintStore.blueprint.resources.length === 0" class="error-message">
            Please define resources first.
          </p>
        </div>
        
        <div class="form-group">
          <label for="baseProduction">Base Production Amount:</label>
          <input id="baseProduction" v-model="newGenerator.baseProduction" type="number" step="1" min="0">
        </div>

        <CostEditor v-model="newGenerator.baseCosts" />

        <hr>

        <FormulaEditor 
          v-model:formula="newGenerator.productionFormula" 
          title="Production" 
        />
        
        <div class="formula-spacing"></div>

        <FormulaEditor 
          v-model:formula="newGenerator.costScalingFormula" 
          title="Cost Scaling" 
        />

        <hr>

        <button type="submit" :disabled="!isFormValid">{{ editingGeneratorId ? 'Save Changes' : 'Add Generator' }}</button>
        <button type="button" v-if="editingGeneratorId" @click="editingGeneratorId = null" class="cancel-btn">Cancel Edit</button>
      </form>
    </div>

    <hr>

    <div class="generator-list">
      <h3>Defined Generators ({{ blueprintStore.blueprint.generators.length }})</h3>
      <div v-for="generator in blueprintStore.blueprint.generators" :key="generator.id" class="generator-item">
        <span class="generator-name">{{ generator.name }}</span>
        <span class="generator-id">({{ generator.id }})</span>
        <span class="generator-output">Produces: {{ generator.outputResource }}</span>
        <button @click="editingGeneratorId = generator.id" class="edit-btn">Edit</button>
      </div>
      <p v-if="blueprintStore.blueprint.generators.length === 0" class="no-items">No generators defined yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useBlueprintStore } from '@/stores/blueprintStore';
import type {
    GeneratorBlueprint,
    StructuredFormula,
    GeneratorRequirement,
    GeneratorFormData,
    FormPurchaseCost
} from '@/types/Blueprint';
import Decimal from 'break_infinity.js';
import FormulaEditor from '@/components/FormulaEditor.vue';
import CostEditor from '@/components/CostEditor.vue';

const blueprintStore = useBlueprintStore();

const createDefaultFormula = (): StructuredFormula => ({
  steps: [{ type: 'constant', value: '1', operation: 'set' }]
});

const getInitialGeneratorState = (): GeneratorFormData => ({
    id: '',
    name: '',
    baseProduction: 1,
    outputResource: '',
    baseCosts: [] as FormPurchaseCost[],
    requiredResources: [] as GeneratorRequirement[],
    productionFormula: createDefaultFormula(),
    costScalingFormula: createDefaultFormula(),
});

const newGenerator = ref<GeneratorFormData>(getInitialGeneratorState());
const editingGeneratorId = ref<string | null>(null);

watch(editingGeneratorId, (newId) => {
    if (newId) {
        const genToEdit = blueprintStore.blueprint.generators.find(g => g.id === newId);
        if (genToEdit) {
            newGenerator.value = {
                ...genToEdit,
                baseProduction: genToEdit.baseProduction.toNumber(),
                baseCosts: genToEdit.baseCosts.map(c => ({ ...c, amount: c.amount.toString() })),
                productionFormula: JSON.parse(JSON.stringify(genToEdit.productionFormula)),
                costScalingFormula: JSON.parse(JSON.stringify(genToEdit.costScalingFormula)),
            };
        }
    } else {
        newGenerator.value = getInitialGeneratorState();
    }
});

const slugify = (text: string): string => {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s-]+/g, '_');
};

const generatedId = computed(() => {
    if (editingGeneratorId.value) return editingGeneratorId.value;
    const baseSlug = slugify(newGenerator.value.name);
    if (!baseSlug) return '';
    let uniqueId = baseSlug;
    let counter = 1;
    while (blueprintStore.blueprint.generators.some(g => g.id === uniqueId)) {
        uniqueId = `${baseSlug}_${counter}`;
        counter++;
    }
    return uniqueId;
});

const isFormValid = computed(() => {
  const areCostsValid = newGenerator.value.baseCosts.every(cost =>
    cost.resourceId !== '' && new Decimal(cost.amount).gt(0)
  );
  
  return newGenerator.value.name.trim() !== '' && 
         newGenerator.value.outputResource !== '' &&
         newGenerator.value.baseCosts.length > 0 &&
         areCostsValid &&
         blueprintStore.blueprint.resources.length > 0;
});

const handleSubmit = () => {
  if (!isFormValid.value) return;

  const generatorData: GeneratorBlueprint = {
    id: generatedId.value,
    name: newGenerator.value.name.trim(),
    outputResource: newGenerator.value.outputResource,
    baseProduction: new Decimal(newGenerator.value.baseProduction),
    productionFormula: newGenerator.value.productionFormula,
    costScalingFormula: newGenerator.value.costScalingFormula,
    requiredResources: newGenerator.value.requiredResources,
    baseCosts: newGenerator.value.baseCosts.map(cost => ({
      resourceId: cost.resourceId,
      amount: new Decimal(cost.amount),
    })),
  };

  if (editingGeneratorId.value) {
      blueprintStore.updateGenerator(generatorData);
  } else {
      blueprintStore.addGenerator(generatorData);
  }

  newGenerator.value = getInitialGeneratorState();
  editingGeneratorId.value = null;
};

</script>

<style scoped>
.generator-editor {
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

.edit-generator-section {
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

.generator-list {
  margin-bottom: 1.5rem;
}

.generator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dotted #333;
  color: #fff;
}

.generator-name { font-weight: bold; color: #76c7c0; }
.generator-id { font-style: italic; color: #555; }
.generator-output { color: #888; }

.add-generator-form {
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
.form-group select {
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

.error-message {
  color: #dc3545;
  margin-top: 10px;
}

hr { border-color: #333; margin: 20px 0; }
.formula-spacing { margin-bottom: 20px; } 
</style>