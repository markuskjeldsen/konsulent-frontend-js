// stores/settingsStore.js
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('useSettingsStore', {
  state: () => ({
    activeSection: 'createUser', // default section
  }),
  actions: {
    switchSection(section) {
      this.activeSection = section
    },
  },
})
