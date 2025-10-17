// src/stores/blueprintStore.ts

import { defineStore } from 'pinia';
import { toRaw } from 'vue';
import type {
    GameBlueprint,
    ResourceBlueprint,
    StructuredFormula,
    GeneratorBlueprint,
    GameSettings,
    TierBlueprint,
    TierItemGroup,
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

        addTier(tier: Omit<TierBlueprint, 'itemGroups'>) {
            if (!tier.id || this.currentBlueprint.tiers.some(t => t.id === tier.id)) {
                console.error("Tier ID invalid or already exists.");
                return;
            }
            const newTier: TierBlueprint = {
                ...tier,
                itemGroups: [],
            };
            this.currentBlueprint.tiers.push(newTier);
        },

        addItemGroupToTier(tierId: string, newGroup: Omit<TierItemGroup, 'id'>) {
            const tier = this.currentBlueprint.tiers.find(t => t.id === tierId);
            if (!tier) {
                console.error(`Tier with ID ${tierId} not found.`);
                return;
            }
            const newId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            tier.itemGroups.push({ ...newGroup, id: newId });
        },

        removeItemGroupFromTier(tierId: string, itemGroupId: string) {
            const tier = this.currentBlueprint.tiers.find(t => t.id === tierId);
            if (tier) {
                const index = tier.itemGroups.findIndex(group => group.id === itemGroupId);
                if (index > -1) {
                    tier.itemGroups.splice(index, 1);
                }
            }
        },

        // --- Item Editing ---
        updateResource(updatedResource: ResourceBlueprint) {
            const resource = this.currentBlueprint.resources.find(r => r.id === updatedResource.id);
            if (resource) {
                Object.assign(resource, updatedResource);
            }
        },

        updateGenerator(updatedGenerator: GeneratorBlueprint) {
            const generator = this.currentBlueprint.generators.find(g => g.id === updatedGenerator.id);
            if (generator) {
                Object.assign(generator, updatedGenerator);
            }
        },

        updateUpgrade(updatedUpgrade: UpgradeBlueprint) {
            const upgrade = this.currentBlueprint.upgrades.find(u => u.id === updatedUpgrade.id);
            if (upgrade) {
                Object.assign(upgrade, updatedUpgrade);
            }
        },

        // --- Persistence ---
        saveBlueprintToLocalStorage() {
            try {
                const replacer = (key: string, value: any) => {
                    if (value instanceof Decimal) {
                        return { __type: 'Decimal', value: value.toString() };
                    }
                    return value;
                };
                const rawBlueprint = toRaw(this.currentBlueprint);
                const serializedBlueprint = JSON.stringify(rawBlueprint, replacer, 2);
                localStorage.setItem('incremental-game-blueprint', serializedBlueprint);
                console.log("Blueprint saved to Local Storage.");
            } catch (error) {
                console.error("Failed to save blueprint to Local Storage:", error);
            }
        },

        loadBlueprintFromLocalStorage() {
            try {
                const serializedBlueprint = localStorage.getItem('incremental-game-blueprint');
                if (serializedBlueprint) {
                    const loadedBlueprint = JSON.parse(serializedBlueprint) as GameBlueprint;

                    // Migration step: ensure all decimal-like values are Decimal objects
                    loadedBlueprint.resources.forEach(r => r.initialAmount = new Decimal(r.initialAmount));
                    loadedBlueprint.generators.forEach(g => {
                        g.baseProduction = new Decimal(g.baseProduction);
                        g.baseCosts.forEach(c => c.amount = new Decimal(c.amount));
                    });
                    loadedBlueprint.upgrades.forEach(u => {
                        u.baseCosts.forEach(c => c.amount = new Decimal(c.amount));
                    });

                    // Use $patch to merge the loaded state
                    this.$patch({
                        currentBlueprint: loadedBlueprint
                    });

                    console.log("Blueprint loaded and patched from Local Storage.");
                }
            } catch (error) {
                console.error("Failed to load blueprint from Local Storage:", error);
            }
        },

        resetBlueprint() {
            // Reset state to a deep copy of the default blueprint
            this.currentBlueprint = JSON.parse(JSON.stringify(defaultBlueprint));
            // Also remove it from local storage
            localStorage.removeItem('incremental-game-blueprint');
            console.log("Blueprint has been reset to default.");
        },

        // Legacy load function, can be kept for other purposes or removed if not needed
        loadBlueprint(blueprintData: GameBlueprint) {
            this.currentBlueprint = blueprintData;
        },

        async exportGame() {
            try {
                // 1. Fetch template files
                const [templateHtml, styleCss, engineJs] = await Promise.all([
                    fetch('/game-template/template.html').then(res => res.text()),
                    fetch('/game-template/style.css').then(res => res.text()),
                    fetch('/game-template/engine.js').then(res => res.text()),
                ]);

                // 2. Serialize the blueprint
                const replacer = (key: string, value: any) => {
                    if (value instanceof Decimal) {
                        return { __type: 'Decimal', value: value.toString() };
                    }
                    return value;
                };
                const serializedBlueprint = JSON.stringify(this.currentBlueprint, replacer);

                // 3. Inject data into the template
                let finalHtml = templateHtml
                    .replace('{{GAME_TITLE}}', this.currentBlueprint.gameTitle)
                    .replace('/* {{CSS_PLACEHOLDER}} */', styleCss)
                    .replace('/* {{BLUEPRINT_PLACEHOLDER}} */', serializedBlueprint)
                    .replace('/* {{ENGINE_JS_PLACEHOLDER}} */', engineJs);

                // 4. Trigger download
                const blob = new Blob([finalHtml], { type: 'text/html' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${this.currentBlueprint.gameTitle.toLowerCase().replace(/\s+/g, '_') || 'my_game'}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);

                console.log("Game exported successfully!");

            } catch (error) {
                console.error("Failed to export game:", error);
                alert("Error exporting game. See console for details.");
            }
        },
    },
});