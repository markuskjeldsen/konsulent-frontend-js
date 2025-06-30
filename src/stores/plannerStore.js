// stores/plannerStore.js
import { defineStore } from 'pinia'

export const usePlannerStore = defineStore('usePlannerStore', {
  state: () => ({
    activeTab: 'createVisits',
  }),
  actions: {
    switchTab(tab) {
      this.activeTab = tab
    },
  },
})
