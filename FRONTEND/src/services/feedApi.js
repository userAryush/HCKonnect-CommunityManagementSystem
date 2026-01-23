const TYPES = ['announcement', 'event', 'discussion', 'resource', 'post']

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function makeId() {
  return Math.random().toString(36).slice(2)
}

function makeCommunity() {
  const names = ['Devcorps', 'Herald Bizcore', 'EthicalHCK', 'UIVisuals', 'IOT Innovators']
  const name = randomItem(names)
  return {
    id: makeId(),
    name,
    logoText: name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
  }
}

function makeAuthor() {
  const first = ['Maya', 'Ravi', 'Elena', 'Aarav', 'Sita', 'Kiran']
  const last = ['I.', 'S.', 'V.', 'P.', 'T.', 'K.']
  return `${randomItem(first)} ${randomItem(last)}`
}

function makeTitle(type) {
  const map = {
    announcement: 'Club Update',
    event: 'Weekly Meetup',
    discussion: 'Topic: AI in Campus',
    resource: 'New Resources Added',
    post: 'Highlights from last event',
  }
  return map[type]
}

function makeDescription(type) {
  const base =
    'Stay tuned for more details. Engage with your peers and make the most of campus life with HCKonnect.'
  if (type === 'event') return 'Join us this Friday at 5 PM. Snacks provided. RSVP required.'
  if (type === 'resource') return 'Slides and recordings have been uploaded. Check the resources section.'
  if (type === 'discussion') return 'Share your thoughts and experiences. Constructive insights welcome.'
  if (type === 'announcement') return 'Important notice for all members regarding upcoming schedules.'
  return base
}

function makeItem(idx) {
  const type = randomItem(TYPES)
  const community = makeCommunity()
  const now = Date.now()
  const createdAt = new Date(now - idx * 60 * 60 * 1000 - Math.random() * 30 * 60 * 1000).toISOString()
  return {
    id: makeId(),
    type, // announcement | event | discussion | resource | post
    title: makeTitle(type),
    description: makeDescription(type),
    community,
    author: makeAuthor(),
    likes: Math.floor(Math.random() * 120),
    comments: Math.floor(Math.random() * 20),
    created_at: createdAt,
  }
}

const PAGE_SIZE = 10

export async function fetchFeed({ page = 1, filter = 'all', hiddenTypes = [], hiddenCommunities = [] } = {}) {
  await new Promise((res) => setTimeout(res, 800))

  const start = (page - 1) * PAGE_SIZE
  const items = Array.from({ length: PAGE_SIZE }, (_, i) => makeItem(start + i))

  let results = items.filter((it) => !hiddenTypes.includes(it.type))
  if (hiddenCommunities.length) {
    const set = new Set(hiddenCommunities)
    results = results.filter((it) => !set.has(it.community.name))
  }
  if (filter !== 'all') results = results.filter((it) => it.type === filter)

  results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const nextPage = page < 5 ? page + 1 : null
  return { results, nextPage }
}

export const CONTENT_TYPES = ['all', ...TYPES]

