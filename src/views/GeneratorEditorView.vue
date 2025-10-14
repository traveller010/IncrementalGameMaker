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

        <div v-if="newGenerator.baseCosts.length > 0 && newGenerator.baseCosts[0]">
            <div class="form-group">
                <label for="baseCostAmount">Base Cost Amount (for level 1):</label>
                <input 
                    id="baseCostAmount" 
                    v-model="newGenerator.baseCosts[0].amount" 
                    type="number" 
                    step="1" 
                    min="1"
                >
            </div>

            <div class="form-group">
                <label for="costResource">Resource Used for Cost:</label>
                <select id="costResource" v-model="newGenerator.baseCosts[0].resourceId" required>
                    <option value="" disabled>Select Cost Resource</option>
                    <option v-for="resource in blueprintStore.getResourceNames" :key="resource.id" :value="resource.id">
                        {{ resource.name }} ({{ resource.id }})
                    </option>
                </select>
            </div>
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

// --- Default Cost Initialization ---
const createDefaultCost = (): PurchaseCost => ({
    resourceId: '',
    amount: new Decimal(10), 
});


// --- Local state for the new generator form ---
const newGenerator = ref({
  name: '',
  baseProduction: 1,
  outputResource: '',
  
  // Initialize required Blueprint fields
  baseCosts: [createDefaultCost()], 
  requiredResources: [] as GeneratorRequirement[], 
  
  // Formulas
  productionFormula: createDefaultFormula(),
  costScalingFormula: createDefaultFormula(),
});


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
  // Defensive check to ensure the first cost object exists
  const cost = newGenerator.value.baseCosts[0]; 
  
  // Use explicit checks for null/undefined before accessing properties
  if (!cost) return false; 
  
  // Check form validity and use Decimal.gt() for comparison
  return newGenerator.value.name.trim() !== '' && 
         newGenerator.value.outputResource !== '' && 
         cost.resourceId !== '' &&         
         cost.amount.gt(0) && // Decimal comparison
         blueprintStore.blueprint.resources.length > 0;
});


// --- Action ---
const addNewGenerator = () => {
  if (!isFormValid.value) return;
  
  // Defensive check for cost object before use
  const costData = newGenerator.value.baseCosts[0];
  if (!costData) return;


  const generatorData: GeneratorBlueprint = {
    name: newGenerator.value.name.trim(),
    id: generatedId.value,
    
    // Core inputs
    baseProduction: new Decimal(newGenerator.value.baseProduction),
    outputResource: newGenerator.value.outputResource,

    // Correctly map the first cost object to the array required
    baseCosts: [{
        resourceId: costData.resourceId,
        amount: new Decimal(costData.amount), // Ensure final submission amount is a Decimal
    }],
    
    // Formulas 
    productionFormula: newGenerator.value.productionFormula,
    costScalingFormula: newGenerator.value.costScalingFormula,
    
    // Pass the required, initialized property
    requiredResources: newGenerator.value.requiredResources, 
  };

  blueprintStore.addGenerator(generatorData);

  // Reset form and reinitialize state
  newGenerator.value.name = '';
  newGenerator.value.baseProduction = 1;
  newGenerator.value.outputResource = '';
  
  // Reset cost and formulas
  newGenerator.value.baseCosts = [createDefaultCost()];
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
</style>