const { createApp, ref, onMounted, computed } = Vue;

const app = createApp({
    setup() {
        // --- DATA ---
        const blueprint = ref(JSON.parse(document.getElementById('blueprint-data').textContent));
        const gameState = ref({
            resources: {},
            generators: {},
        });

        // --- HELPER FUNCTIONS ---
        const formatNumber = (num) => {
            if (!(num instanceof Decimal)) {
                num = new Decimal(num);
            }
            if (num.lt(1000)) {
                return num.toFixed(2);
            }
            return num.toExponential(2);
        };

        const evaluateFormula = (formula, level) => {
            let result = new Decimal(0);
            for (const step of formula.steps) {
                let value;
                switch (step.type) {
                    case 'constant':
                        value = new Decimal(step.value);
                        break;
                    case 'generator_level':
                        value = level;
                        break;
                    // Other cases like resource_amount can be added here
                    default:
                        value = new Decimal(0);
                }

                switch (step.operation) {
                    case 'set': result = value; break;
                    case 'add': result = result.plus(value); break;
                    case 'multiply': result = result.times(value); break;
                    case 'power': result = result.pow(value); break;
                }
            }
            return result;
        };

        const getActualGeneratorCost = (generatorId) => {
            const genBlueprint = blueprint.value.generators.find(g => g.id === generatorId);
            const genState = gameState.value.generators[generatorId];
            if (!genBlueprint || !genState) return [];

            const costMultiplier = evaluateFormula(genBlueprint.costScalingFormula, genState.level);

            return genBlueprint.baseCosts.map(baseCost => ({
                resourceId: baseCost.resourceId,
                amount: new Decimal(baseCost.amount).times(costMultiplier),
            }));
        };

        const canAfford = (costs) => {
            if (!costs || costs.length === 0) return false;
            return costs.every(cost => {
                const resourceAmount = gameState.value.resources[cost.resourceId] || new Decimal(0);
                return resourceAmount.gte(cost.amount);
            });
        };

        // --- INITIALIZATION ---
        onMounted(() => {
            // Initialize resources
            blueprint.value.resources.forEach(res => {
                gameState.value.resources[res.id] = new Decimal(res.initialAmount);
            });

            // Initialize generators
            blueprint.value.generators.forEach(gen => {
                gameState.value.generators[gen.id] = {
                    level: new Decimal(0),
                };
            });

            // Start game loop
            setInterval(gameTick, 1000);
        });

        // --- GAME LOGIC ---
        const gameTick = () => {
            blueprint.value.generators.forEach(gen => {
                const genState = gameState.value.generators[gen.id];
                if (genState && genState.level.gt(0)) {
                    const production = new Decimal(gen.baseProduction).times(genState.level);
                    gameState.value.resources[gen.outputResource] = (gameState.value.resources[gen.outputResource] || new Decimal(0)).plus(production);
                }
            });
        };

        const purchaseGenerator = (generatorId) => {
            const actualCosts = getActualGeneratorCost(generatorId);
            if (canAfford(actualCosts)) {
                // Deduct costs
                actualCosts.forEach(cost => {
                    gameState.value.resources[cost.resourceId] = gameState.value.resources[cost.resourceId].minus(cost.amount);
                });

                // Increment generator level
                gameState.value.generators[generatorId].level = gameState.value.generators[generatorId].level.plus(1);
            }
        };

        // --- COMPUTED PROPERTIES ---
        const visibleGenerators = computed(() => {
            // For now, all generators are visible. This could be expanded with unlock conditions.
            return blueprint.value.generators;
        });

        return {
            blueprint,
            gameState,
            formatNumber,
            purchaseGenerator,
            canAfford,
            visibleGenerators,
            getActualGeneratorCost,
        };
    },
    template: `
        <h1>{{ blueprint.gameTitle }}</h1>

        <div class="resource-display">
            <h2>Resources</h2>
            <div v-for="resource in blueprint.resources" :key="resource.id" class="resource-item">
                <span class="resource-name">{{ resource.name }}</span>
                <span class="resource-amount">{{ formatNumber(gameState.resources[resource.id] || 0) }}</span>
            </div>
        </div>

        <div class="generators-grid">
            <div v-for="gen in visibleGenerators" :key="gen.id" class="generator-item">
                <div class="generator-header">
                    <span>{{ gen.name }}</span>
                    <span>Level: {{ formatNumber(gameState.generators[gen.id]?.level || 0) }}</span>
                </div>
                <div class="generator-production">
                    Produces: {{ formatNumber(gen.baseProduction) }} {{ blueprint.resources.find(r => r.id === gen.outputResource)?.name || 'N/A' }} /s
                </div>
                <div class="generator-costs">
                    <strong>Cost:</strong>
                    <div v-for="cost in getActualGeneratorCost(gen.id)" :key="cost.resourceId">
                        {{ formatNumber(cost.amount) }} {{ blueprint.resources.find(r => r.id === cost.resourceId)?.name || 'N/A' }}
                    </div>
                </div>
                <button @click="purchaseGenerator(gen.id)" :disabled="!canAfford(getActualGeneratorCost(gen.id))" class="buy-button">
                    Buy
                </button>
            </div>
        </div>
    `
});

app.mount('#app');