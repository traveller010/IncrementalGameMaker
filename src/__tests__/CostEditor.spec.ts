import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import CostEditor from '../components/CostEditor.vue';
import { useBlueprintStore } from '../stores/blueprintStore';

const pinia = createPinia();

vi.mock('@/stores/blueprintStore', () => {
    const actual = vi.importActual('@/stores/blueprintStore');
    return {
        ...actual,
        useBlueprintStore: vi.fn(),
    };
});

describe('CostEditor', () => {
  it('adds, updates, and removes costs', async () => {
    const mockStore = {
      blueprint: {
        resources: [{ id: 'gold', name: 'Gold' }],
      },
      getResourceNames: [{ id: 'gold', name: 'Gold' }],
    };
    vi.mocked(useBlueprintStore).mockReturnValue(mockStore);

    const wrapper = mount(CostEditor, {
      props: {
        modelValue: [],
      },
      global: {
        plugins: [pinia],
      },
    });

    // 1. Add a cost
    await wrapper.find('.add-cost-btn').trigger('click');
    let emittedEvent = wrapper.emitted('update:modelValue');
    expect(emittedEvent).toHaveLength(1);
    expect(emittedEvent[0][0]).toHaveLength(1);
    expect(emittedEvent[0][0][0].amount).toBe('10');

    // 2. Update the amount
    await wrapper.setProps({ modelValue: emittedEvent[0][0] });
    const amountInput = wrapper.find('input[type="number"]');
    await amountInput.setValue('123');
    emittedEvent = wrapper.emitted('update:modelValue');
    expect(emittedEvent).toHaveLength(2);
    expect(emittedEvent[1][0][0].amount).toBe('123');

    // 3. Remove the cost
    await wrapper.setProps({ modelValue: emittedEvent[1][0] });
    await wrapper.find('.remove-btn').trigger('click');
    emittedEvent = wrapper.emitted('update:modelValue');
    expect(emittedEvent).toHaveLength(3);
    expect(emittedEvent[2][0]).toHaveLength(0);
  });
});