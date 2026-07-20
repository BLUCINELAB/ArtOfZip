import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { SessionMemory } from '../types'

interface ArtworkDatabase extends DBSchema {
  memory: {
    key: string
    value: SessionMemory
  }
}

export class IndexedDbStore {
  private database?: Promise<IDBPDatabase<ArtworkDatabase>>

  private db() {
    this.database ??= openDB<ArtworkDatabase>('mentre-non-guardavi', 1, {
      upgrade(database) {
        database.createObjectStore('memory', { keyPath: 'id' })
      },
    })
    return this.database
  }

  async read() {
    return (await this.db()).get('memory', 'local')
  }

  async write(memory: SessionMemory) {
    await (await this.db()).put('memory', memory)
  }

  async clear() {
    await (await this.db()).clear('memory')
  }
}
