// src/types/Blueprint.ts

import Decimal from 'break_infinity.js';

// --- I. CORE FORMULA STRUCTURES ---

// Represents a single mathematical operation step
export interface FormulaComponent {
    type: 'constant' | 'generator_level' | 'resource_amount' | 'upgrade_level';
    value: string; // The literal number (as a string) OR the ID of the target component
    operation: 'set' | 'add' | 'multiply' | 'power' | 'sub' | 'divide'; 
}

// A generic structure for any custom calculation (e.g., production, cost, effect)
export interface StructuredFormula {
    steps: FormulaComponent[];
}

// --- II. UNLOCK / COST STRUCTURES & SETTINGS ---

// Defines a condition that must be met to unlock/purchase something (Used for Tiers and Upgrades)
export interface UnlockCondition {
    resourceId: string;
    value: Decimal; // The amount required
}

// Defines a condition based on a required component level (Used for Generator requirements)
export interface GeneratorRequirement {
    resourceId: string;
    minLevel: number; // The required level of the generator or upgrade
}

// Defines a single currency/amount pair for purchase (Used for multi-cost generators/upgrades)
export interface PurchaseCost {
    resourceId: string;
    amount: Decimal;
}

export interface GameSettings {
    offlineProgressEnabled: boolean; // Controlled by the user
}

// --- III. TIERS AND AUTOMATION ---

export interface AutomationBlueprint {
    id: string;
    name: string;
    targetId: string; 
    type: 'auto_buy_generator' | 'auto_buy_upgrade' | 'auto_sell_resource';
    condition: UnlockCondition[]; 
}

export interface TierBlueprint {
    id: string;
    name: string;
    isPrestigeTier: boolean;

    unlockConditions: UnlockCondition[];

    prestigeCurrencyId: string;
    prestigeFormula: StructuredFormula; 
}


// --- IV. CORE ENTITIES ---

export interface ResourceBlueprint {
    id: string;
    name: string;
    initialAmount: Decimal;
    isPermanent: boolean; // ⬅️ The field that caused the last error
}

export interface GeneratorBlueprint {
    id: string; 
    name: string;
    
    // Production
    outputResource: string;
    baseProduction: Decimal;
    productionFormula: StructuredFormula; 

    // Cost (Multi-cost structure)
    baseCosts: PurchaseCost[]; // Array of cost options
    costScalingFormula: StructuredFormula; 
    
    // Requirements (Using GeneratorRequirement)
    requiredResources: GeneratorRequirement[]; 
    
    // NOTE: unlockConditions is NOT here; it's only for Tiers/Upgrades
}

export interface UpgradeBlueprint {
    id: string; 
    name: string;
    type: 'additive' | 'multiplicative';
    levels: number; 

    // Effect
    effectFormula: StructuredFormula; 
    effectTargetId: string; 
    
    // Cost
    costFormula: StructuredFormula;   
    costResource: string;
    
    // Unlock
    unlockConditions: UnlockCondition[];
}


// --- V. THE MAIN BLUEPRINT ---

export interface GameBlueprint {
    gameTitle: string;
    version: number;

    settings: GameSettings;
    tiers: TierBlueprint[];

    resources: ResourceBlueprint[]; 
    generators: GeneratorBlueprint[];
    upgrades: UpgradeBlueprint[];
    automations: AutomationBlueprint[];
}