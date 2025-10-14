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

import CostEditor from '../components/CostEditor.vue';

describe('GeneratorEditorView', () => {
  it('renders the CostEditor component', () => {
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

    expect(wrapper.findComponent(CostEditor).exists()).toBe(true);
  });
});