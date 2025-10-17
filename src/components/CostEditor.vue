<template>
  <div class="costs-section">
    <h4>Base Costs (for level 1)</h4>
    <div v-for="(cost, index) in localCosts" :key="index" class="cost-item">
      <div class="form-group">
        <label :for="'costAmount-' + index">Cost Amount:</label>
        <input
          :id="'costAmount-' + index"
          :value="cost.amount.toString()"
          @input="updateAmount(index, $event)"
          type="number"
          step="1"
          min="1"
        />
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
      <button type="button" @click="removeCost(index)" class="remove-btn">
        —
      </button>
    </div>
    <button type="button" @click="addCost" class="add-cost-btn">
      + Add Cost
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PurchaseCost, FormPurchaseCost } from '@/types/Blueprint';
import { useBlueprintStore } from '@/stores/blueprintStore';
import Decimal from 'break_infinity.js';

interface Props {
  modelValue: (PurchaseCost | FormPurchaseCost)[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: (PurchaseCost | FormPurchaseCost)[]): void;
}>();

const blueprintStore = useBlueprintStore();

const localCosts = computed({
  get: () => props.modelValue,
  set: (newVal) => {
    emit('update:modelValue', newVal);
  },
});

const addCost = () => {
  const newCost: FormPurchaseCost = {
    resourceId: '',
    amount: '10',
  };
  localCosts.value = [...localCosts.value, newCost];
};

const removeCost = (index: number) => {
  localCosts.value = localCosts.value.filter((_, i) => i !== index);
};

const updateAmount = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const newAmount = target.value;
  const updatedCosts = [...localCosts.value];
  if (updatedCosts[index]) {
    updatedCosts[index].amount = newAmount;
    localCosts.value = updatedCosts;
  }
};
</script>

<style scoped>
.costs-section {
  padding: 15px;
  border: 1px solid #333;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  background-color: #2a2a2a;
}

.cost-item {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  align-items: end;
  padding: 10px;
  border-bottom: 1px solid #2a2a2a;
}
.cost-item:last-child {
  border-bottom: none;
}

.form-group {
  margin-bottom: 0;
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
  background-color: #333;
  color: #fff;
  box-sizing: border-box;
  font-size: 1em;
}

.add-cost-btn {
  background-color: #28a745;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  margin-top: 10px;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  height: 40px;
}

.remove-btn:disabled {
  background-color: #555;
  cursor: not-allowed;
}
</style>