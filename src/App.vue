<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from '@/components/HelloWorld.vue'
import { requestNewFile, requestRecentFile } from '@/helpers/FileAccess'

async function showStuff() {
  const r = await requestNewFile()
  console.log("r", r)
  debugger
}

async function reuseStuff() {
  const r = await requestRecentFile("96bf1fd:a6d06fbef53d7"	)
  console.log("r", r)
  debugger
}
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />

  <button @click="showStuff">roll</button>
  <button @click="reuseStuff">reuse</button>

</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
