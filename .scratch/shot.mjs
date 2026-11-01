import { chromium } from 'playwright-core'
import fs from 'node:fs'

const [scenario, wArg = '390', hArg = '844', extra = ''] = process.argv.slice(2)
const W = Number(wArg)
const H = Number(hArg)
fs.mkdirSync('out', { recursive: true })

const seed = {
  stage: 'quiz',
  index: 4,
  unlocked: 0,
  answers: {
    q1: { wrong: [], correct: true, found: [1] },
    q2: { wrong: [], correct: true, found: [0] },
    q3: { wrong: [], correct: true, found: [3] },
    q4: { wrong: [], correct: true, found: [0, 3] },
  },
}
if (extra.includes('tried')) seed.answers.q5 = { wrong: [0, 1], correct: false }
if (extra.includes('done')) seed.answers.q5 = { wrong: [], correct: true, found: [3] }

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, reducedMotion: extra.includes('reduced') ? 'reduce' : 'no-preference' })
await ctx.addInitScript((s) => localStorage.setItem('anniv-surprise:v1', JSON.stringify(s)), seed)
const page = await ctx.newPage()
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()))
await page.goto('http://localhost:5400/')
await page.waitForSelector('.ac__stage')
const stage = page.locator('.ac__stage')
const t0 = Date.now()
const snap = async (name, full = false) => {
  if (full) await page.screenshot({ path: `out/${scenario}-${name}.png` })
  else await stage.screenshot({ path: `out/${scenario}-${name}.png` })
}
const at = async (ms, name, full) => {
  const d = ms - (Date.now() - t0)
  if (d > 0) await page.waitForTimeout(d)
  await snap(name, full)
}

const games = { mc: 'Minecraft', rl: 'Rocket League', sg: 'Rainbow Six Siege', fifa: 'FIFA' }

if (scenario === 'idle') {
  await page.waitForTimeout(3600)
  await snap('idle')
  if (extra.includes('hover')) {
    await page.hover('[aria-label="FIFA"] .ac-hit')
    await page.waitForTimeout(700)
    await snap('hover')
  }
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.waitForTimeout(500)
  await snap('focus')
} else if (extra.includes('still') || extra.includes('tried') || extra.includes('done')) {
  await page.waitForTimeout(3000)
  await snap('state', true)
} else {
  await page.waitForTimeout(3600)
  const t = Date.now()
  await page.locator(`[aria-label="${games[scenario]}"]`).dispatchEvent('click')
  const times = {
    mc: [700, 1500, 2200, 2500, 2800, 3300, 5000],
    rl: [500, 900, 1300, 1700, 2100, 2600, 4200],
    sg: [500, 900, 1300, 1700, 2200, 2800, 4500],
    fifa: [500, 1400, 2800, 3700, 4400, 5300, 6800, 8000, 8750, 8950, 9500, 9800, 10300, 12500],
  }[scenario]
  const base = Date.now() - t0 - (Date.now() - t)
  for (const ms of times) {
    const d = t + ms - Date.now()
    if (d > 0) await page.waitForTimeout(d)
    await snap(String(ms).padStart(5, '0'))
  }
  await page.waitForTimeout(800)
  await snap('end', true)
  void base
}
await browser.close()
