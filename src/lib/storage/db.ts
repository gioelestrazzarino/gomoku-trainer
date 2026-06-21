import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { GameRecord } from '../game/types'

interface GomokuDB extends DBSchema {
  games: {
    key: string
    value: GameRecord
    indexes: { 'by-timestamp': number }
  }
}

let dbPromise: Promise<IDBPDatabase<GomokuDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<GomokuDB>('gomoku-trainer', 1, {
      upgrade(db) {
        const store = db.createObjectStore('games', { keyPath: 'id' })
        store.createIndex('by-timestamp', 'timestamp')
      },
    })
  }
  return dbPromise
}

export async function saveGame(game: GameRecord): Promise<void> {
  const db = await getDB()
  await db.put('games', game)
}

export async function loadGame(id: string): Promise<GameRecord | undefined> {
  const db = await getDB()
  return db.get('games', id)
}

export async function loadAllGames(): Promise<GameRecord[]> {
  const db = await getDB()
  const games = await db.getAllFromIndex('games', 'by-timestamp')
  return games.reverse() // most recent first
}

export async function deleteGame(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('games', id)
}

export async function updateGameAnalysis(id: string, analysis: GameRecord['analysis']): Promise<void> {
  const db = await getDB()
  const game = await db.get('games', id)
  if (game) {
    game.analysis = analysis
    await db.put('games', game)
  }
}

export function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
