// src/stores/blueprintStore.ts

import { defineStore } from 'pinia';
import type { 
    GameBlueprint, 
    ResourceBlueprint, 
    StructuredFormula 
} from '@/types/Blueprint.ts';
import Decimal from 'break_infinity.js';

// --- Default Formula Structure ---
// A simple formula resulting in (1 * Level)
const defaultFormula: StructuredFormula = {
    steps: [
        { type: 'constant', value: '1', operation: 'set' },
        { type: 'generator_level', value: 'landPlot', operation: 'multiply' },
    ]
};

// --- Default Game State ---
const defaultBlueprint: GameBlueprint = {
    gameTitle: 'My New Incremental Game',
    version: 1,
    resources: [
        { 
            id: 'cash', 
            name: 'Cash', 
            initialAmount: new Decimal(0) 
        },
        { 
            id: 'gen_resource', 
            name: 'Generated Resource', 
            initialAmount: new Decimal(0) 
        },
    ] as ResourceBlueprint[], // Assert as ResourceBlueprint[]
    
    generators: [
        {
            id: 'landPlot',
            name: 'Land Plot',
            baseProduction: new Decimal(1),
            outputResource: 'gen_resource',

            productionFormula: defaultFormula, 
            
            baseCost: new Decimal(10),
            costScalingFormula: {
                steps: [
                    { type: 'constant', value: '10', operation: 'set' },
                    { type: 'generator_level', value: 'landPlot', operation: 'power' }, // Example: 10 * 1.15^level
                    { type: 'constant', value: '1.15', operation: 'multiply' },
                ]
            },
            requiredResources: [],
        }
    ],
    upgrades: [],
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
        addGenerator(generator: GameBlueprint['generators'][0]) {
             // Basic validation here
            this.currentBlueprint.generators.push(generator);
        },

        // --- Persistence (Will be updated for database later) ---
        loadBlueprint(blueprintData: GameBlueprint) {
            // NOTE: Full rehydration logic needed here when loading from JSON
            this.currentBlueprint = blueprintData;
        },
    },
});