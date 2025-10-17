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

        const canAfford = (costs) => {
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
                    cost: new Decimal(gen.baseCosts[0]?.amount || 0) // Simplified cost for now
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
            const genBlueprint = blueprint.value.generators.find(g => g.id === generatorId);
            if (!genBlueprint) return;

            if (canAfford(genBlueprint.baseCosts)) {
                // Deduct costs
                genBlueprint.baseCosts.forEach(cost => {
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
                    <div v-for="cost in gen.baseCosts" :key="cost.resourceId">
                        {{ formatNumber(cost.amount) }} {{ blueprint.resources.find(r => r.id === cost.resourceId)?.name || 'N/A' }}
                    </div>
                </div>
                <button @click="purchaseGenerator(gen.id)" :disabled="!canAfford(gen.baseCosts)" class="buy-button">
                    Buy
                </button>
            </div>
        </div>
    `
});

app.mount('#app');