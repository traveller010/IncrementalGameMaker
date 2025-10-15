// src/stores/blueprintStore.ts

import { defineStore } from 'pinia';
import type {
    GameBlueprint,
    ResourceBlueprint,
    StructuredFormula,
    GeneratorBlueprint,
    GameSettings,
    TierBlueprint,
    AutomationBlueprint,
    PurchaseCost,
    UpgradeBlueprint
} from '@/types/Blueprint.ts';
import Decimal from 'break_infinity.js';

// --- Default Game State ---
const defaultBlueprint: GameBlueprint = {
    gameTitle: 'My New Incremental Game',
    version: 1,

    // ⚡️ NEW SETTINGS (Required for Offline Progression)
    settings: {
        offlineProgressEnabled: true,
    },

    tiers: [],
    resources: [] as ResourceBlueprint[],
    generators: [] as GeneratorBlueprint[],
    upgrades: [],
    automations: [],
};

export const useBlueprintStore = defineStore('blueprint', {
    state: () => ({
        currentBlueprint: defaultBlueprint,
        isEditing: false,
    }),

    getters: {
        blueprint: (state) => state.currentBlueprint,
        hasResources: (state) => state.currentBlueprint.resources.length > 0,
        getResourceNames: (state) => state.currentBlueprint.resources.map(r => ({ id: r.id, name: r.name })),
    },

    actions: {
        setGameTitle(title: string) {
            this.currentBlueprint.gameTitle = title;
        },

        // --- Resource Management ---
        addResource(newResource: ResourceBlueprint) {
            if (!newResource.id || this.currentBlueprint.resources.some(r => r.id === newResource.id)) {
                console.error("Resource ID invalid or already exists.");
                return;
            }
            this.currentBlueprint.resources.push(newResource);
        },

        // --- Generator Management ---
addGenerator(generator: GeneratorBlueprint) { 
    // 1. Check if the generator was created without any cost options
    if (generator.baseCosts.length === 0 && this.currentBlueprint.resources.length > 0 && this.currentBlueprint.resources[0]) {
        
        // 2. Default the cost to 10 units of the first available resource.
        const defaultCost: PurchaseCost = {
            resourceId: this.currentBlueprint.resources[0].id,
            amount: new Decimal(10), 
        };
        
        generator.baseCosts.push(defaultCost);
    }
    
    // Add the generator to the blueprint array
    this.currentBlueprint.generators.push(generator);
},

        addUpgrade(upgrade: UpgradeBlueprint) {
            if (!upgrade.id || this.currentBlueprint.upgrades.some(u => u.id === upgrade.id)) {
                console.error("Upgrade ID invalid or already exists.");
                return;
            }
            this.currentBlueprint.upgrades.push(upgrade);
        },

        addTier(tier: TierBlueprint) {
            if (!tier.id || this.currentBlueprint.tiers.some(t => t.id === tier.id)) {
                console.error("Tier ID invalid or already exists.");
                return;
            }
            this.currentBlueprint.tiers.push(tier);
        },

        addItemToTier(tierId: string, itemType: 'resources' | 'generators' | 'upgrades', itemId: string) {
            const tier = this.currentBlueprint.tiers.find(t => t.id === tierId);
            if (tier && !tier[itemType].includes(itemId)) {
                tier[itemType].push(itemId);
            }
        },

        removeItemFromTier(tierId: string, itemType: 'resources' | 'generators' | 'upgrades', itemId: string) {
            const tier = this.currentBlueprint.tiers.find(t => t.id === tierId);
            if (tier) {
                const index = tier[itemType].indexOf(itemId);
                if (index > -1) {
                    tier[itemType].splice(index, 1);
                }
            }
        },


        // --- Persistence (Will be updated for database later) ---
        loadBlueprint(blueprintData: GameBlueprint) {
            // NOTE: Full rehydration logic needed here when loading from JSON
            this.currentBlueprint = blueprintData;
        },
    },
});