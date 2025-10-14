import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import CostEditor from '../components/CostEditor.vue';
import { useBlueprintStore } from '../stores/blueprintStore';
import Decimal from 'break_infinity.js';

const pinia = createPinia();

vi.mock('@/stores/blueprintStore', () => {
    const actual = vi.importActual('@/stores/blueprintStore');
    return {
        ...actual,
        useBlueprintStore: vi.fn(),
    };
});

describe('CostEditor', () => {
  it('adds and removes costs', async () => {
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

    // Add a cost
    await wrapper.find('.add-cost-btn').trigger('click');
    expect(wrapper.emitted('update:modelValue')[0][0]).toHaveLength(1);
    await wrapper.setProps({ modelValue: wrapper.emitted('update:modelValue')[0][0] });

    // Add another cost
    await wrapper.find('.add-cost-btn').trigger('click');
    expect(wrapper.emitted('update:modelValue')[1][0]).toHaveLength(2);
    await wrapper.setProps({ modelValue: wrapper.emitted('update:modelValue')[1][0] });

    // Remove a cost
    await wrapper.find('.remove-btn').trigger('click');
    expect(wrapper.emitted('update:modelValue')[2][0]).toHaveLength(1);
    await wrapper.setProps({ modelValue: wrapper.emitted('update:modelValue')[2][0] });

    await wrapper.find('.remove-btn').trigger('click');
    expect(wrapper.emitted('update:modelValue')[3][0]).toHaveLength(0);
  });
});