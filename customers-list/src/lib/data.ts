export type Customer = {
  id: number
  name: string
  phone: string
  email: string
  score: number
  lastMessageAt: number // epoch ms
  addedBy: string
  avatar: string // data URL or path
}

// Deterministic pseudo-random generator
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const firstNames = ['John', 'Jane', 'Alex', 'Sam', 'Chris', 'Pat', 'Taylor', 'Jordan', 'Morgan', 'Casey']
const lastNames = ['Doe', 'Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson']
const users = ['Kartikey Mishra', 'Alex Rivera', 'Priya Shah', 'Mina Park']

export function generateCustomers(count: number, seed = 42): Customer[] {
  const rand = mulberry32(seed)
  const now = Date.now()
  const rows: Customer[] = new Array(count)
  for (let i = 0; i < count; i++) {
    const fn = firstNames[Math.floor(rand() * firstNames.length)]
    const ln = lastNames[Math.floor(rand() * lastNames.length)]
    const name = `${fn} ${ln}`
    const score = Math.floor(rand() * 100)
    const daysAgo = Math.floor(rand() * 365)
    const lastMessageAt = now - daysAgo * 24 * 60 * 60 * 1000
    const phone = `+1${String(Math.floor(rand() * 9_000_000_000 + 1_000_000_000))}`
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`
    const addedBy = users[Math.floor(rand() * users.length)]
    const color = Math.floor(rand() * 360)
    const avatar = `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'><rect width='100%' height='100%' fill='hsl(${color},70%,70%)'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14'>${fn[0]}${ln[0]}</text></svg>`
    )}`

    rows[i] = { id: i + 1, name, phone, email, score, lastMessageAt, addedBy, avatar }
  }
  return rows
}
