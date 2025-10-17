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

// Represents a linked group of a resource, generator, and upgrade within a tier.
export interface TierItemGroup {
    id: string; // A unique ID for this group (e.g., a timestamp or a simple counter)
    resourceId?: string;
    generatorId?: string;
    upgradeId?: string;
}

export interface TierBlueprint {
    id: string;
    name: string;
    itemGroups: TierItemGroup[]; // A list of resource/generator/upgrade groups
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
    description: string;

    // Effect
    effectFormula: StructuredFormula; 
    targetId: string;
    
    // Cost
    baseCosts: PurchaseCost[];
    costFormula: StructuredFormula;
    
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

// --- VI. FORM-SPECIFIC DATA-TRANSFER-OBJECTS (DTOs) ---
// These types are used in the Vue components to handle form data, where `Decimal` objects
// are temporarily converted to strings or numbers for v-model binding.

// A version of PurchaseCost where the amount is a string for form inputs
export type FormPurchaseCost = Omit<PurchaseCost, 'amount'> & { amount: string };

// DTO for the Resource Editor form
export type ResourceFormData = Omit<ResourceBlueprint, 'initialAmount'> & {
    initialAmount: string;
};

// DTO for the Generator Editor form
export type GeneratorFormData = Omit<GeneratorBlueprint, 'baseProduction' | 'baseCosts'> & {
    baseProduction: number;
    baseCosts: FormPurchaseCost[];
};

// DTO for the Upgrade Editor form
export type UpgradeFormData = Omit<UpgradeBlueprint, 'baseCosts'> & {
    baseCosts: FormPurchaseCost[];
};