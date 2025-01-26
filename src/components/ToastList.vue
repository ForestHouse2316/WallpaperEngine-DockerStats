<template>
    <div class="toast-list-container">
        <ToastMessage v-for="(msg, key) in messages" :key="key" :msg="msg" @finish="remove()" />
    </div>
</template>

<script setup>
import ToastMessage from "./ToastMessage.vue";

const props = defineProps({ messages: { type: Object } });
const emit = defineEmits(["finish"]);

function remove() {
    emit("finish");
}
</script>

<style scoped>
.toast-list-container {
    position: absolute;
    right: 10px;
    bottom: 20px;
    width: 20rem;
    max-width: 20rem;

    display: flex;
    flex-direction: column;

    overflow-x: hidden;
}
</style>
