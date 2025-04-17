<template>
    <div class="item">
        <p class="name">= {{ name }} =</p>
        <div class="value-container">
            <p class="value" v-if="autoDataUnit === false">{{ value.toFixed(2) }}</p>
            <p class="value" v-else>{{ (value / POW1024[pIdx]).toFixed(2) }}</p>
            <p class="unit" v-if="autoDataUnit === false">{{ unit }}</p>
            <p class="unit" v-else>{{ DATA_SIZE_UNIT[pIdx] }}</p>
        </div>
    </div>
</template>

<script setup>
// TODO implement automatic aggregate tag by importing AGGREGATE
import { computed } from 'vue';

const POW1024 = [1, 1024, Math.pow(1024, 2), Math.pow(1024, 3), Math.pow(1024, 4)];
const DATA_SIZE_UNIT = ["Bytes", "KB", "MB", "GB", "TB"];

const props = defineProps({
    name: {
        type: String,
        default: "Unknown",
    },
    value: {
        type: Number,
        default: 0,
    },
    unit: {
        type: String,
        defualt: "",
    },
    autoDataUnit: { // Scale the value to fit in range [1, 1024), except the value exceeds 1024TB.
        type: Boolean,
        default: false,
    },
});

let pIdx;
if (props.autoDataUnit) {
    pIdx = computed(() => {
        for (let i = 4; i > 0; i--) {
            if (props.value / POW1024[i] >= 1) return i;
        }
        return 0;
    });
}
</script>

<style scoped>
.name {
    font-weight: bold;
}

.value-container > p {
    margin: 0;
    padding: 0;
}

.value {
    font-size: 1.5rem;
    display: inline-block;
}

.unit {
    display: inline-block;
}
</style>
