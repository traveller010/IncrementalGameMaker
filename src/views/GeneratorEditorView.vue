<template>
  <div class="generator-editor">
    <h2>Game Generators</h2>
    <p class="description">Define the production units that convert resources into others (e.g., Land Plot).</p>

    <div class="generator-list">
      <h3>Defined Generators ({{ blueprintStore.blueprint.generators.length }})</h3>
      <div v-for="generator in blueprintStore.blueprint.generators" :key="generator.id" class="generator-item">
        <span class="generator-name">{{ generator.name }}</span>
        <span class="generator-id">({{ generator.id }})</span>
        <span class="generator-output">Produces: {{ generator.outputResource }}</span>
      </div>
      <p v-if="blueprintStore.blueprint.generators.length === 0" class="no-items">No generators defined yet.</p>
    </div>
    
    <hr>

    <div class="add-generator-form">
      <h3>Add New Generator</h3>
      <form @submit.prevent="addNewGenerator">
        
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

        <!-- Multiple Costs Section -->
        <div class="costs-section">
            <h4>Base Costs (for level 1)</h4>
            <div v-for="(cost, index) in newGenerator.baseCosts" :key="index" class="cost-item">

                <div class="form-group">
                    <label :for="'costAmount-' + index">Cost Amount:</label>
                    <input
                        :id="'costAmount-' + index"
                        v-model="cost.amount"
                        type="number"
                        step="1"
                        min="1"
                    >
                </div>

                <div class="form-group">
                    <label :for="'costResource-' + index">Cost Resource:</label>
                    <select :id="'costResource-' + index" v-model="cost.resourceId" required>
                        <option value="" disabled>Select Resource</option>
                        <option v-for="resource in blueprintStore.getResourceNames" :key="resource.id" :value="resource.id">
                            {{ resource.name }} ({{ resource.id }})
                        </option>
                    </select>
                </div>

                <button type="button" @click="removeCost(index)" class="remove-cost-btn">
                  -
                </button>
            </div>

            <button type="button" @click="addCost" class="add-cost-btn">
              + Add Cost
            </button>
        </div>

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

        <button type="submit" :disabled="!isFormValid">Add Generator</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useBlueprintStore } from '@/stores/blueprintStore';
import type { 
    GeneratorBlueprint, 
    StructuredFormula, 
    PurchaseCost, 
    GeneratorRequirement 
} from '@/types/Blueprint';
import Decimal from 'break_infinity.js';
import FormulaEditor from '@/components/FormulaEditor.vue';

const blueprintStore = useBlueprintStore();

// --- Default Formula Initialization ---
const createDefaultFormula = (): StructuredFormula => ({
  steps: [{ type: 'constant', value: '1', operation: 'set' }]
});

// --- Local state for the new generator form ---
const newGenerator = ref({
  name: '',
  baseProduction: 1,
  outputResource: '',
  
  baseCosts: [] as PurchaseCost[],
  requiredResources: [] as GeneratorRequirement[], 
  
  productionFormula: createDefaultFormula(),
  costScalingFormula: createDefaultFormula(),
});

// --- Cost Management ---
const addCost = () => {
  newGenerator.value.baseCosts.push({
    resourceId: '',
    amount: new Decimal(10),
  });
};

const removeCost = (index: number) => {
  newGenerator.value.baseCosts.splice(index, 1);
};


// Function to convert display name to a unique ID
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '_');
};

// Auto-generate a unique ID for the new generator
const generatedId = computed(() => {
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
    cost.resourceId !== '' && cost.amount.gt(0)
  );
  
  return newGenerator.value.name.trim() !== '' && 
         newGenerator.value.outputResource !== '' &&
         newGenerator.value.baseCosts.length > 0 &&
         areCostsValid &&
         blueprintStore.blueprint.resources.length > 0;
});


// --- Action ---
const addNewGenerator = () => {
  if (!isFormValid.value) return;

  const generatorData: GeneratorBlueprint = {
    name: newGenerator.value.name.trim(),
    id: generatedId.value,
    
    baseProduction: new Decimal(newGenerator.value.baseProduction),
    outputResource: newGenerator.value.outputResource,

    baseCosts: newGenerator.value.baseCosts.map(cost => ({
      resourceId: cost.resourceId,
      amount: new Decimal(cost.amount),
    })),
    
    productionFormula: newGenerator.value.productionFormula,
    costScalingFormula: newGenerator.value.costScalingFormula,
    
    requiredResources: newGenerator.value.requiredResources, 
  };

  blueprintStore.addGenerator(generatorData);

  // Reset form and reinitialize state
  newGenerator.value.name = '';
  newGenerator.value.baseProduction = 1;
  newGenerator.value.outputResource = '';
  
  newGenerator.value.baseCosts = [];
  newGenerator.value.requiredResources = [];
  newGenerator.value.productionFormula = createDefaultFormula();
  newGenerator.value.costScalingFormula = createDefaultFormula();
};

// Helper for display
const formatNumber = (value: Decimal | number): string => {
  if (value instanceof Decimal) {
    return value.toString();
  }
  return value.toLocaleString();
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
h4 { color: #bbb; margin-bottom: 1rem; }
.description { color: #888; margin-bottom: 2rem; }
.no-items { color: #888; font-style: italic; margin-top: 10px; }

.generator-list {
  margin-bottom: 1.5rem;
}

.generator-item {
  display: flex;
  justify-content: flex-start;
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
.formula-spacing { margin-bottom: 20px; } 

.costs-section {
  padding: 15px;
  border: 1px solid #333;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.cost-item {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #2a2a2a;
}
.cost-item:last-child {
  border-bottom: none;
}

.add-cost-btn {
  background-color: #28a745;
  margin-top: 10px;
}
.add-cost-btn:hover {
  background-color: #218838;
}

.remove-cost-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  height: fit-content;
  align-self: end;
  margin-bottom: 2px;
}
.remove-cost-btn:hover {
  background-color: #c82333;
}
</style>