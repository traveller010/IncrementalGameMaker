// src/types/Blueprint.ts

import Decimal from 'break_infinity.js';

// --- I. CORE FORMULA STRUCTURES ---

// Represents a single mathematical operation step
export interface FormulaComponent {
    // Defines the input source: a constant, a generator's level, a resource amount, etc.
    type: 'constant' | 'generator_level' | 'resource_amount' | 'upgrade_level';
    
    // The value to use: The literal number (as a string) OR the ID of the target component (e.g., 'landPlot', 'cash')
    value: string; 
    
    // The operation to perform on the current running total.
    operation: 'set' | 'add' | 'multiply' | 'power' | 'sub' | 'divide'; 
}

// A generic structure for any custom calculation (e.g., production, cost, effect)
export interface StructuredFormula {
    steps: FormulaComponent[];
}

// --- II. BLUEPRINT INTERFACES ---

// Represents a resource (e.g., Cash, Dirt, Influence)
export interface ResourceBlueprint {
    id: string; // Unique identifier (e.g., 'cash')
    name: string;
    initialAmount: Decimal; // Starting amount
}

// Represents a production unit (e.g., Land Plot, Server Farm)
export interface GeneratorBlueprint {
    id: string; 
    name: string;
    
    // Production
    outputResource: string; // ID of the resource it produces
    baseProduction: Decimal;
    productionFormula: StructuredFormula; 

    // Cost Scaling
    baseCost: Decimal;
    costScalingFormula: StructuredFormula; 
    
    // Dependencies/Requirements (e.g., requires 5 Manpower to build)
    requiredResources: { resourceId: string, minLevel: number }[]; 
}

// Represents a multiplier or global upgrade category
export interface UpgradeBlueprint {
    id: string; 
    name: string;
    type: 'additive' | 'multiplicative';
    levels: number; 

    // Upgrade Effect
    effectFormula: StructuredFormula; 
    
    // Cost Scaling
    costFormula: StructuredFormula;   
    
    // Unlock Conditions (e.g., requires 1e10 Cash to unlock)
    unlockConditions: { resourceId: string, value: Decimal }[];
}


// --- III. THE MAIN BLUEPRINT (Schema for the entire user-created game) ---

export interface GameBlueprint {
    gameTitle: string;
    version: number;
    resources: ResourceBlueprint[];
    generators: GeneratorBlueprint[];
    upgrades: UpgradeBlueprint[];
    // Future: Unlocks, automations, display settings
}