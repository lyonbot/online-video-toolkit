import { defineStore } from 'pinia'
import { MediaLibrary } from './MediaLibrary'
import { Track } from './Track'

export const useProject = defineStore('project', {
  state() {
    return {
      tracks: [new Track('Default Track')],
      mediaLibrary: new MediaLibrary(),
    }
  },
  actions: {
    addTrack(track: Track) {
      this.tracks.push(track)
    }
  }
})

export type Project = ReturnType<typeof useProject>
