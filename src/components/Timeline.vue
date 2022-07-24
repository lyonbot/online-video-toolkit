<script lang="ts" setup>
import { Track } from '@/types/project';
import { computed } from 'vue';

const props = defineProps<{
  value: Track
}>()

const track = computed(() => props.value)
</script>

<template>
  <div>
    {{ track.name }}
  </div>
</template>