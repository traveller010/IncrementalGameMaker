import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';

const routes = [
  { path: '/', component: { template: '<div>Home</div>' } },
  { path: '/generators', component: { template: '<div>Generators</div>' } },
  { path: '/upgrades', component: { template: '<div>Upgrades</div>' } },
  { path: '/tiers', component: { template: '<div>Tiers</div>' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

describe('App', () => {
  it('renders the main navigation links', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });

    await router.isReady();

    const links = wrapper.findAll('a');
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(wrapper.text()).toContain('Resources');
    expect(wrapper.text()).toContain('Generators');
  });
});
