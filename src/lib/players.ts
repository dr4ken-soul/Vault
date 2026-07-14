import type { Player } from './types'

function history(base: number, volatility = 0.06): number[] {
  const points: number[] = []
  let v = base * (0.92 + Math.random() * 0.04)
  for (let i = 0; i < 12; i += 1) {
    v = Math.max(1, v * (1 + (Math.random() - 0.48) * volatility))
    points.push(Math.round(v * 100) / 100)
  }
  points[points.length - 1] = base
  return points
}

/** Illustrative, internally consistent player pool for the demo. Not a live sports feed. */
export const PLAYER_POOL: Player[] = [
  {
    id: 'p-alisson',
    name: 'Alisson',
    position: 'GK',
    club: 'Liverpool',
    value: 42.5,
    formScore: 8.4,
    attributes: { pace: 62, shooting: 28, passing: 74, defending: 88, physical: 82, form: 84 },
    valueHistory: history(42.5),
    strengths: 'Command of the box and distribution under pressure.',
    style: 'Sweeper keeper who starts attacks early.',
  },
  {
    id: 'p-saliba',
    name: 'William Saliba',
    position: 'DEF',
    club: 'Arsenal',
    value: 58.2,
    formScore: 8.7,
    attributes: { pace: 78, shooting: 32, passing: 76, defending: 91, physical: 86, form: 87 },
    valueHistory: history(58.2),
    strengths: 'Recovery pace and calm progressive passing.',
    style: 'Ball playing centre back with elite timing.',
  },
  {
    id: 'p-van-dijk',
    name: 'Virgil van Dijk',
    position: 'DEF',
    club: 'Liverpool',
    value: 51.0,
    formScore: 8.2,
    attributes: { pace: 72, shooting: 40, passing: 78, defending: 92, physical: 90, form: 82 },
    valueHistory: history(51.0),
    strengths: 'Aerial dominance and leadership of the line.',
    style: 'Classic organiser who rarely concedes space.',
  },
  {
    id: 'p-trippier',
    name: 'Kieran Trippier',
    position: 'DEF',
    club: 'Newcastle',
    value: 28.4,
    formScore: 7.6,
    attributes: { pace: 68, shooting: 55, passing: 88, defending: 74, physical: 70, form: 76 },
    valueHistory: history(28.4),
    strengths: 'Set piece delivery and crossing accuracy.',
    style: 'Attacking full back who pins the touchline.',
  },
  {
    id: 'p-gvardiol',
    name: 'Josko Gvardiol',
    position: 'DEF',
    club: 'Man City',
    value: 46.8,
    formScore: 8.1,
    attributes: { pace: 80, shooting: 48, passing: 80, defending: 84, physical: 85, form: 81 },
    valueHistory: history(46.8),
    strengths: 'Carries from deep and covers wide channels.',
    style: 'Modern hybrid defender with midfield range.',
  },
  {
    id: 'p-rodri',
    name: 'Rodri',
    position: 'MID',
    club: 'Man City',
    value: 72.0,
    formScore: 9.1,
    attributes: { pace: 58, shooting: 72, passing: 92, defending: 86, physical: 88, form: 91 },
    valueHistory: history(72.0),
    strengths: 'Tempo control and progressive security.',
    style: 'Deep pivot who dictates every phase.',
  },
  {
    id: 'p-odegaard',
    name: 'Martin Ødegaard',
    position: 'MID',
    club: 'Arsenal',
    value: 64.5,
    formScore: 8.6,
    attributes: { pace: 74, shooting: 80, passing: 91, defending: 52, physical: 66, form: 86 },
    valueHistory: history(64.5),
    strengths: 'Half space creation and late box arrivals.',
    style: 'Number ten who presses from the front.',
  },
  {
    id: 'p-bruno',
    name: 'Bruno Fernandes',
    position: 'MID',
    club: 'Man United',
    value: 55.3,
    formScore: 8.0,
    attributes: { pace: 70, shooting: 84, passing: 89, defending: 58, physical: 72, form: 80 },
    valueHistory: history(55.3),
    strengths: 'Chance volume and long range threat.',
    style: 'High usage creator who never stops asking.',
  },
  {
    id: 'p-palmer',
    name: 'Cole Palmer',
    position: 'MID',
    club: 'Chelsea',
    value: 68.9,
    formScore: 8.9,
    attributes: { pace: 78, shooting: 88, passing: 86, defending: 42, physical: 64, form: 89 },
    valueHistory: history(68.9),
    strengths: 'Composure in the final third and dead ball threat.',
    style: 'Left footed creator with elite shot selection.',
  },
  {
    id: 'p-saka',
    name: 'Bukayo Saka',
    position: 'FWD',
    club: 'Arsenal',
    value: 78.4,
    formScore: 9.0,
    attributes: { pace: 88, shooting: 84, passing: 82, defending: 48, physical: 70, form: 90 },
    valueHistory: history(78.4),
    strengths: '1v1 isolation and end product from the right.',
    style: 'Wide forward who inverts into the half space.',
  },
  {
    id: 'p-haaland',
    name: 'Erling Haaland',
    position: 'FWD',
    club: 'Man City',
    value: 95.0,
    formScore: 9.3,
    attributes: { pace: 90, shooting: 95, passing: 68, defending: 38, physical: 92, form: 93 },
    valueHistory: history(95.0),
    strengths: 'Penalty box dominance and conversion rate.',
    style: 'Central striker built for vertical service.',
  },
  {
    id: 'p-salah',
    name: 'Mohamed Salah',
    position: 'FWD',
    club: 'Liverpool',
    value: 82.1,
    formScore: 8.8,
    attributes: { pace: 91, shooting: 90, passing: 80, defending: 40, physical: 74, form: 88 },
    valueHistory: history(82.1),
    strengths: 'Consistent output across open play and set pieces.',
    style: 'Inverted winger who finishes from tight angles.',
  },
  {
    id: 'p-watkins',
    name: 'Ollie Watkins',
    position: 'FWD',
    club: 'Aston Villa',
    value: 48.6,
    formScore: 8.3,
    attributes: { pace: 86, shooting: 82, passing: 74, defending: 36, physical: 78, form: 83 },
    valueHistory: history(48.6),
    strengths: 'Pressing trigger and runs in behind.',
    style: 'Mobile nine who links and finishes.',
  },
  {
    id: 'p-gordon',
    name: 'Anthony Gordon',
    position: 'FWD',
    club: 'Newcastle',
    value: 39.7,
    formScore: 7.9,
    attributes: { pace: 89, shooting: 76, passing: 72, defending: 44, physical: 72, form: 79 },
    valueHistory: history(39.7),
    strengths: 'Direct carries and defensive work rate.',
    style: 'High energy wide forward with aggressive press.',
  },
  {
    id: 'p-rice',
    name: 'Declan Rice',
    position: 'MID',
    club: 'Arsenal',
    value: 70.2,
    formScore: 8.5,
    attributes: { pace: 72, shooting: 70, passing: 84, defending: 88, physical: 86, form: 85 },
    valueHistory: history(70.2),
    strengths: 'Ball recovery and progressive range.',
    style: 'Box to box controller with set piece threat.',
  },
  {
    id: 'p-dias',
    name: 'Rúben Dias',
    position: 'DEF',
    club: 'Man City',
    value: 49.5,
    formScore: 8.0,
    attributes: { pace: 68, shooting: 34, passing: 80, defending: 90, physical: 88, form: 80 },
    valueHistory: history(49.5),
    strengths: 'Positioning and compact defensive structure.',
    style: 'Disciplined centre back who organises the unit.',
  },
  {
    id: 'p-ederson',
    name: 'Ederson',
    position: 'GK',
    club: 'Man City',
    value: 38.0,
    formScore: 8.1,
    attributes: { pace: 60, shooting: 30, passing: 86, defending: 82, physical: 78, form: 81 },
    valueHistory: history(38.0),
    strengths: 'Long range distribution and build up security.',
    style: 'Playmaking goalkeeper for possession sides.',
  },
  {
    id: 'p-foden',
    name: 'Phil Foden',
    position: 'MID',
    club: 'Man City',
    value: 76.3,
    formScore: 8.7,
    attributes: { pace: 84, shooting: 86, passing: 88, defending: 46, physical: 68, form: 87 },
    valueHistory: history(76.3),
    strengths: 'Tight space combination play and finishing.',
    style: 'Versatile creator across the front line.',
  },
  {
    id: 'p-isak',
    name: 'Alexander Isak',
    position: 'FWD',
    club: 'Newcastle',
    value: 66.4,
    formScore: 8.6,
    attributes: { pace: 88, shooting: 87, passing: 76, defending: 34, physical: 80, form: 86 },
    valueHistory: history(66.4),
    strengths: 'Hold up play and clinical finishing.',
    style: 'Elegant striker who drifts into channels.',
  },
  {
    id: 'p-gabriel',
    name: 'Gabriel',
    position: 'DEF',
    club: 'Arsenal',
    value: 44.1,
    formScore: 8.2,
    attributes: { pace: 74, shooting: 48, passing: 72, defending: 88, physical: 90, form: 82 },
    valueHistory: history(44.1),
    strengths: 'Physical duels and set piece threat.',
    style: 'Aggressive centre back who steps into midfield.',
  },
  {
    id: 'p-mac-allister',
    name: 'Alexis Mac Allister',
    position: 'MID',
    club: 'Liverpool',
    value: 52.8,
    formScore: 8.1,
    attributes: { pace: 70, shooting: 78, passing: 86, defending: 72, physical: 76, form: 81 },
    valueHistory: history(52.8),
    strengths: 'Press resistance and late arriving shots.',
    style: 'Balanced midfielder for high tempo systems.',
  },
  {
    id: 'p-pope',
    name: 'Nick Pope',
    position: 'GK',
    club: 'Newcastle',
    value: 24.5,
    formScore: 7.5,
    attributes: { pace: 54, shooting: 22, passing: 62, defending: 84, physical: 80, form: 75 },
    valueHistory: history(24.5),
    strengths: 'Shot stopping and command on crosses.',
    style: 'Traditional keeper with strong hands.',
  },
]

export function getPlayer(id: string): Player | undefined {
  return PLAYER_POOL.find((p) => p.id === id)
}

export function getPlayers(ids: string[]): Player[] {
  return ids.map((id) => getPlayer(id)).filter((p): p is Player => Boolean(p))
}

export function squadValue(ids: string[]): number {
  return Math.round(getPlayers(ids).reduce((sum, p) => sum + p.value, 0) * 100) / 100
}

const USER_SQUAD_SEED = [
  'p-alisson',
  'p-saliba',
  'p-van-dijk',
  'p-trippier',
  'p-gvardiol',
  'p-rodri',
  'p-bruno',
  'p-rice',
  'p-saka',
  'p-watkins',
  'p-gordon',
]

const COUNTERPART_SQUAD_SEED = [
  'p-ederson',
  'p-dias',
  'p-gabriel',
  'p-gvardiol',
  'p-saliba',
  'p-odegaard',
  'p-palmer',
  'p-foden',
  'p-mac-allister',
  'p-haaland',
  'p-salah',
]

/** Counterpart uses a disjoint high quality pool for clean demo trades. */
const COUNTERPART_SQUAD = [
  'p-ederson',
  'p-dias',
  'p-gabriel',
  'p-pope',
  'p-odegaard',
  'p-palmer',
  'p-foden',
  'p-mac-allister',
  'p-haaland',
  'p-salah',
  'p-isak',
]

export function buildUserSquadIds(): string[] {
  return [...USER_SQUAD_SEED]
}

export function buildCounterpartSquadIds(): string[] {
  return [...COUNTERPART_SQUAD]
}

// Silence unused seed if tree shaken elsewhere
void COUNTERPART_SQUAD_SEED
