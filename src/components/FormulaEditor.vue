<template>
  <div class="formula-editor">
    <h4>{{ title }} Formula:</h4>
    <p class="formula-preview">
      Preview: <strong>{{ formulaPreview }}</strong>
    </p>

    <div v-for="(step, index) in localFormula.steps" :key="index" class="formula-step">
      
      <select v-model="step.operation" class="operation-select">
        <option value="set" :disabled="index !== 0">
          {{ index === 0 ? 'Start with' : 'ERROR: Must be first step' }}
        </option>
        <option value="add" :disabled="index === 0">Add</option>
        <option value="sub" :disabled="index === 0">Subtract</option>
        <option value="multiply" :disabled="index === 0">Multiply by</option>
        <option value="divide" :disabled="index === 0">Divide by</option>
        <option value="power" :disabled="index === 0">Power of</option>
      </select>

      <select v-model="step.type" class="type-select">
        <option value="constant">Constant Value</option>
        <option value="generator_level">Generator Level</option>
        <option value="resource_amount">Resource Amount</option>
        <option value="upgrade_level">Upgrade Level</option>
      </select>
      
      <div class="value-input-group">
        <div class="input-wrapper">
          <input
            v-if="step.type === 'constant'"
            v-model="step.value"
            type="text"
            placeholder="e.g., 1.15 or 1e6"
            class="value-input"
            :class="{ 'input-error': errors[index] }"
            required
          />
          <select v-else v-model="step.value" class="value-select" required>
            <option value="" disabled>Select a target...</option>
            <optgroup v-if="step.type === 'generator_level'" label="Generators">
            <option v-for="gen in allGenerators" :key="gen.id" :value="gen.id">
              {{ gen.name }} (Level)
            </option>
          </optgroup>
          <optgroup v-if="step.type === 'resource_amount'" label="Resources">
            <option v-for="res in allResources" :key="res.id" :value="res.id">
              {{ res.name }} (Amount)
            </option>
          </optgroup>
          <optgroup v-if="step.type === 'upgrade_level'" label="Upgrades">
            <option v-for="upg in allUpgrades" :key="upg.id" :value="upg.id">
              {{ upg.name }} (Level)
            </option>
          </optgroup>
        </select>
          <p v-if="errors[index]" class="error-message">{{ errors[index] }}</p>
        </div>
        <button
          type="button"
          @click="removeStep(index)"
          class="remove-btn"
          :disabled="localFormula.steps.length === 1 && index === 0"
          title="Remove this step"
        >
          —
        </button>
      </div>
    </div>

    <button type="button" @click="addStep" class="add-step-btn">
      + Add Step
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { StructuredFormula, FormulaComponent } from '@/types/Blueprint';
import { useBlueprintStore } from '@/stores/blueprintStore';
import Decimal from 'break_infinity.js';

// --- Props & Emits ---
interface Props {
  formula: StructuredFormula;
  title: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:formula', value: StructuredFormula): void;
}>();

const blueprintStore = useBlueprintStore();

// --- Local Reactivity Setup (Computed with Setter) ---

// This computed property reads the prop and emits a change when the setter is used,
// making local manipulation possible while supporting v-model.
const localFormula = computed({
    get: () => props.formula,
    set: (newVal) => {
        emit('update:formula', newVal);
    }
});

// --- Validation ---
const errors = ref<Record<number, string>>({});

const validateFormula = () => {
  const newErrors: Record<number, string> = {};
  localFormula.value.steps.forEach((step, index) => {
    if (step.type === 'constant') {
      try {
        new Decimal(step.value);
      } catch (e) {
        newErrors[index] = 'Invalid number';
      }
    } else if (!step.value) {
      newErrors[index] = 'Value is required';
    }
  });
  errors.value = newErrors;
};

watch(localFormula, validateFormula, { deep: true, immediate: true });


// Data sources for selector options
const allResources = computed(() => blueprintStore.blueprint.resources);
const allGenerators = computed(() => blueprintStore.blueprint.generators);
const allUpgrades = computed(() => blueprintStore.blueprint.upgrades);


// --- Formula Manipulation Actions ---
const addStep = () => {
    // 1. Create the new default step
    const newStep: FormulaComponent = {
        type: 'constant',
        value: '1',
        operation: 'add',
    };
    
    // 2. Create a NEW array and object to ensure reactivity update
    const updatedSteps = [...localFormula.value.steps, newStep];
    
    // 3. Emit the brand new object back to the parent store
    localFormula.value = { steps: updatedSteps };
};

const removeStep = (index: number) => {
    if (index === 0 && localFormula.value.steps.length === 1) return; // Prevent removing the last step

    // Create a NEW array by filtering out the step at the given index
    const updatedSteps = localFormula.value.steps.filter((_, i) => i !== index);
    localFormula.value = { steps: updatedSteps };
};


// --- Formula Preview Generator ---
const formulaPreview = computed(() => {
  if (!localFormula.value || !localFormula.value.steps || localFormula.value.steps.length === 0) {
    return 'Start by adding a formula step.';
  }

  const getDisplayName = (id: string, type: string): string => {
    const findIn = (collection: any[], id: string) => collection.find(item => item.id === id)?.name || `[${id}]`;
    if (type === 'generator_level') return `Level of '${findIn(allGenerators.value, id)}'`;
    if (type === 'resource_amount') return `Amount of '${findIn(allResources.value, id)}'`;
    if (type === 'upgrade_level') return `Level of '${findIn(allUpgrades.value, id)}'`;
    return id; // Fallback for constant or unknown
  };

  const tokens = localFormula.value.steps.map((step, index) => {
    const opMap: Record<string, string> = {
      set: '=',
      add: '+',
      sub: '-',
      multiply: '×',
      divide: '÷',
      power: '^',
    };

    const valueStr = step.type === 'constant' ? step.value : getDisplayName(step.value, step.type);
    
    if (index === 0) {
      return `Result ${opMap[step.operation]} ${valueStr}`;
    }
    return `${opMap[step.operation]} ${valueStr}`;
  });

  return tokens.join(' ');
});


// --- Initialization (Your proven, defensive logic is preserved and corrected) ---

// 1. Ensure the formula array exists and is not empty.
if (!localFormula.value.steps || localFormula.value.steps.length === 0) {
  localFormula.value = { // Must reassign the entire object to trigger reactivity
      steps: [{ type: 'constant', value: '1', operation: 'set' }] 
  };
}

// 2. Restore your explicitly confirmed defensive check for the 'set' operation
if (
    localFormula.value.steps.length > 0 &&
    localFormula.value.steps[0] !== undefined &&
    localFormula.value.steps[0].operation !== 'set'
) {
  localFormula.value.steps[0].operation = 'set';
}
</script>

<style scoped>
.formula-editor {
  border: 1px solid #444;
  padding: 15px;
  border-radius: 6px;
  background-color: #2a2a2a;
}

h4 {
  color: #ccc;
  margin-top: 0;
  margin-bottom: 10px;
}

.formula-preview {
  background-color: #1e1e1e;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  color: #a2d2fb; /* A lighter, more readable blue */
  font-family: 'Courier New', Courier, monospace;
  font-size: 1em;
  word-break: break-all;
  border-left: 3px solid #007bff;
}

.formula-preview strong {
  color: #fff;
  font-weight: normal; /* The color difference is enough */
}

.formula-step {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  align-items: center;
}

.operation-select,
.type-select,
.value-input-group select,
.value-input-group input {
  padding: 8px;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #333;
  color: #fff;
  font-size: 1em;
}

.operation-select {
  flex-basis: 120px;
}

.type-select {
  flex-basis: 150px;
}

.value-input-group {
  flex-grow: 1;
  display: flex;
  gap: 8px;
}

.value-input-group input,
.value-input-group select {
  flex-grow: 1;
}

.input-wrapper {
  flex-grow: 1;
  position: relative;
}

.input-error {
  border-color: #dc3545 !important;
}

.error-message {
  color: #dc3545;
  font-size: 0.8em;
  position: absolute;
  bottom: -18px;
  left: 5px;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
}

.remove-btn:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.add-step-btn {
  background-color: #28a745;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  margin-top: 5px;
}
</style>