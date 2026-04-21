import * as THREE from 'three'

/** 获取 base path（GitHub Pages 子路径） */
function getBase(): string {
  // 开发模式：vite dev server，base 是 '/'
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return '/'
  // 生产模式：从当前 URL 推导 base
  const path = window.location.pathname
  // 如果路径是 /no-lake-is-blue/pages/xxx.html，base 是 /no-lake-is-blue/
  const match = path.match(/^\/[^\/]+\//)
  return match ? match[0] : '/'
}
const BASE = getBase()

/** 场景转场：淡出 → 跳转 */
export function transitionToScene(url: string, fadeColor = '#000', delay = 1500) {
  const resolved = url.startsWith('/') ? BASE + url.replace(/^\//, '') : url
  const fadeEl = document.getElementById('scene-fade')
  if (fadeEl) {
    fadeEl.style.background = fadeColor
    fadeEl.style.opacity = '1'
    setTimeout(() => { window.location.href = resolved }, 1200)
  } else {
    setTimeout(() => { window.location.href = resolved }, delay)
  }
}

/** 显示字幕 */
export function showSubtitle(text: string, duration = 3000) {
  const overlay = document.getElementById('subtitle-overlay') as HTMLElement
  const textEl = document.getElementById('subtitle-text') as HTMLElement
  if (!overlay || !textEl) return
  textEl.textContent = text
  overlay.style.opacity = '1'
  setTimeout(() => { overlay.style.opacity = '0' }, duration)
}

/** 隐藏加载屏 */
export function hideLoading() {
  const el = document.getElementById('loading-screen')
  if (el) el.classList.add('hidden')
}

/** 创建 Low-Poly 树 */
export function createTree(parent: THREE.Object3D, x: number, z: number, scale = 1) {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05 * scale, 0.08 * scale, 0.6 * scale, 5),
    new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.9 }),
  )
  trunk.position.y = 0.3 * scale
  trunk.castShadow = true
  g.add(trunk)

  const f1 = new THREE.Mesh(
    new THREE.ConeGeometry(0.4 * scale, 1.0 * scale, 6),
    new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.85 }),
  )
  f1.position.y = 1.0 * scale
  f1.castShadow = true
  g.add(f1)

  const f2 = new THREE.Mesh(
    new THREE.ConeGeometry(0.28 * scale, 0.65 * scale, 6),
    new THREE.MeshStandardMaterial({ color: 0x3a8a5c, roughness: 0.85 }),
  )
  f2.position.y = 1.35 * scale
  f2.castShadow = true
  g.add(f2)

  g.position.set(x, 0, z)
  parent.add(g)
  return g
}

/** 创建简化人形 */
export function createHumanFigure(bodyColor = 0x8B7355, height = 1.0): THREE.Group {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.8 })
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.13 * height, 0.5 * height, 4, 8), mat)
  body.position.y = 0.65 * height
  g.add(body)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.1 * height, 8, 8), mat)
  head.position.y = 1.1 * height
  g.add(head)
  return g
}

/** 缓动 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** 简单时间轴触发器 */
export class SimpleTimeline {
  private events: { time: number; action: () => void; fired: boolean }[] = []
  private elapsed = 0
  private active = false

  add(time: number, action: () => void) {
    this.events.push({ time, action, fired: false })
    this.events.sort((a, b) => a.time - b.time)
  }

  start() { this.active = true; this.elapsed = 0 }

  update(delta: number) {
    if (!this.active) return
    this.elapsed += delta
    for (const e of this.events) {
      if (!e.fired && this.elapsed >= e.time) {
        e.fired = true
        e.action()
      }
    }
  }

  getElapsed() { return this.elapsed }
  isComplete() { return this.events.length > 0 && this.events.every(e => e.fired) }
}
