import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';

// Mock routes, even if empty, are often necessary for components using <router-view>
const routes = [
  { path: '/', component: { template: '<div>Home</div>' } },
  { path: '/generators', component: { template: '<div>Generators</div>' } },
  { path: '/upgrades', component: { template: '<div>Upgrades</div>' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

describe('App', () => {
  it('renders the main navigation links', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router] // Provide the router to the component
      }
    });

    // Wait for the router to be ready and views to be rendered
    await router.isReady();

    // Check for key navigation elements
    const links = wrapper.findAll('a');
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(wrapper.text()).toContain('Resources');
    expect(wrapper.text()).toContain('Generators');
  });
});
