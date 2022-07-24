import { defineStore } from 'pinia'

export const useLayoutState = defineStore('layoutState', {
  state() {
    return {
      /** how many pixels per second, in timeline */
      timeScale: 100,
    }
  },
  actions: {
  }
})

export type LayoutState = ReturnType<typeof useLayoutState>
