import 'dotenv/config'
import { createHash, timingSafeEqual } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'

const PORT = Number(process.env.PORT || 8788)
const PUBLIC_ORIGIN = (process.env.PUBLIC_ORIGIN || `http://localhost:${PORT}`).replace(/\/$/, '')
const DISCORD_INVITE_CODE = process.env.DISCORD_INVITE_CODE || 'AxrmbN5Ygr'
const BOT_STATUS_TOKEN = process.env.PARADOX_BOT_STATUS_TOKEN || ''
const STATUS_MAX_AGE = Math.max(30, Number(process.env.STATUS_MAX_AGE_SECONDS || 180)) * 1000
const publicDir = join(dirname(fileURLToPath(import.meta.url)), 'public')

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: PUBLIC_ORIGIN.startsWith('https://') ? [] : null,
    },
  },
}))
app.use(rateLimit({ windowMs: 15 * 60_000, limit: 500, standardHeaders: 'draft-8', legacyHeaders: false }))
app.use(express.json({ limit: '8kb' }))

let discordCache = { online: 11, members: 18, checkedAt: 0 }
let gameStatus = { connected: false, online: 0, capacity: null, map: null, updatedAt: 0 }

function safeTokenEqual(received, expected) {
  if (!received || !expected) return false
  const receivedHash = createHash('sha256').update(received).digest()
  const expectedHash = createHash('sha256').update(expected).digest()
  return timingSafeEqual(receivedHash, expectedHash)
}

async function refreshDiscordCounts() {
  if (Date.now() - discordCache.checkedAt < 60_000) return
  try {
    const response = await fetch(`https://discord.com/api/v10/invites/${DISCORD_INVITE_CODE}?with_counts=true`)
    if (!response.ok) throw new Error(`Discord invite ${response.status}`)
    const invite = await response.json()
    discordCache = {
      online: Number.isFinite(invite.approximate_presence_count) ? invite.approximate_presence_count : discordCache.online,
      members: Number.isFinite(invite.approximate_member_count) ? invite.approximate_member_count : discordCache.members,
      checkedAt: Date.now(),
    }
  } catch (error) {
    discordCache.checkedAt = Date.now()
    console.warn('Conteggi Discord non aggiornati:', error instanceof Error ? error.message : error)
  }
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'paradox-community-site', origin: PUBLIC_ORIGIN })
})

app.get('/api/status', async (_request, response) => {
  await refreshDiscordCounts()
  const gameConnected = gameStatus.connected && Date.now() - gameStatus.updatedAt <= STATUS_MAX_AGE
  response.setHeader('Cache-Control', 'public, max-age=30')
  response.json({
    discord: { online: discordCache.online, members: discordCache.members },
    game: {
      connected: gameConnected,
      online: gameConnected ? gameStatus.online : 0,
      capacity: gameConnected ? gameStatus.capacity : null,
      map: gameConnected ? gameStatus.map : null,
    },
  })
})

app.post('/api/bot/status', rateLimit({ windowMs: 60_000, limit: 90, standardHeaders: 'draft-8', legacyHeaders: false }), (request, response) => {
  if (!BOT_STATUS_TOKEN) return response.status(503).json({ error: 'Integrazione bot non configurata' })
  const authorization = request.headers.authorization || ''
  const receivedToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!safeTokenEqual(receivedToken, BOT_STATUS_TOKEN)) return response.status(401).json({ error: 'Token non valido' })

  const online = Number(request.body?.online)
  const capacity = request.body?.capacity == null ? null : Number(request.body.capacity)
  if (!Number.isInteger(online) || online < 0 || online > 200) return response.status(400).json({ error: 'Numero giocatori non valido' })
  if (capacity !== null && (!Number.isInteger(capacity) || capacity < online || capacity > 200)) return response.status(400).json({ error: 'Capienza non valida' })

  gameStatus = {
    connected: request.body?.connected !== false,
    online,
    capacity,
    map: typeof request.body?.map === 'string' ? request.body.map.slice(0, 80) : null,
    updatedAt: Date.now(),
  }
  response.json({ ok: true })
})

app.use(express.static(publicDir, { extensions: ['html'], maxAge: '1h' }))
app.use((_request, response) => response.sendFile(join(publicDir, 'index.html')))

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Paradox Community Site pronto su ${PUBLIC_ORIGIN} (porta ${PORT})`)
})
