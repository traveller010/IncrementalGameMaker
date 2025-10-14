import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import GeneratorEditorView from '../views/GeneratorEditorView.vue';
import { useBlueprintStore } from '../stores/blueprintStore';

const pinia = createPinia();

vi.mock('@/stores/blueprintStore', () => {
    const actual = vi.importActual('@/stores/blueprintStore');
    return {
        ...actual,
        useBlueprintStore: vi.fn(),
    };
});

describe('GeneratorEditorView', () => {
  it('adds and removes costs', async () => {
    const mockStore = {
        blueprint: {
            resources: [{ id: 'gold', name: 'Gold' }],
            generators: [],
        },
        getResourceNames: [{ id: 'gold', name: 'Gold' }],
        addGenerator: vi.fn(),
    };
    vi.mocked(useBlueprintStore).mockReturnValue(mockStore);

    const wrapper = mount(GeneratorEditorView, {
      global: {
        plugins: [pinia],
      },
    });

    // Add a cost
    await wrapper.find('.add-cost-btn').trigger('click');
    expect(wrapper.findAll('.cost-item')).toHaveLength(1);

    // Add another cost
    await wrapper.find('.add-cost-btn').trigger('click');
    expect(wrapper.findAll('.cost-item')).toHaveLength(2);

    // Remove a cost
    await wrapper.find('.remove-cost-btn').trigger('click');
    expect(wrapper.findAll('.cost-item')).toHaveLength(1);
  });
});