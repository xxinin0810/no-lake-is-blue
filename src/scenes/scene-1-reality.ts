import * as THREE from 'three'
import { RendererManager } from '../core/renderer'
import { FPSCameraControls } from '../core/camera-controls'

// ============================================================
// 场景1：庄房内（现实）—— 黑白世界
// ============================================================

export function createScene1(container: HTMLElement) {
  const rm = new RendererManager({
    container,
    antialias: true,
    xrEnabled: true,
    bgColor: 0x111111,
  })

  const controls = new FPSCameraControls(rm.camera, rm.renderer.domElement)

  const scene = rm.scene

  // --- 灯光 ---

  const ambient = new THREE.AmbientLight(0x404040, 0.4)
  scene.add(ambient)

  // 烛光（暖黄，带阴影）
  const candleLight = new THREE.PointLight(0xffaa44, 2.0, 12)
  candleLight.position.set(-1.2, 2.2, -3.2)
  candleLight.castShadow = true
  candleLight.shadow.mapSize.set(512, 512)
  candleLight.shadow.radius = 4
  scene.add(candleLight)

  // 窗户透进来的冷光
  const windowLight = new THREE.PointLight(0x6688aa, 0.6, 8)
  windowLight.position.set(3.8, 2.5, -1)
  scene.add(windowLight)

  // --- 房间 ---

  const roomGroup = new THREE.Group()
  scene.add(roomGroup)

  // 地板 - 深色木纹
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.92, metalness: 0 })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  roomGroup.add(floor)

  // 墙壁 - 斑驳石灰
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xb8a88a, roughness: 0.95, metalness: 0, side: THREE.DoubleSide })

  // 后墙
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.15), wallMat)
  backWall.position.set(0, 2, -5)
  backWall.receiveShadow = true
  backWall.castShadow = true
  roomGroup.add(backWall)

  // 左墙
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4, 10), wallMat)
  leftWall.position.set(-4, 2, 0)
  leftWall.receiveShadow = true
  roomGroup.add(leftWall)

  // 右墙
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4, 10), wallMat)
  rightWall.position.set(4, 2, 0)
  rightWall.receiveShadow = true
  roomGroup.add(rightWall)

  // 前墙（留门口）
  const frontWL = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 0.15), wallMat)
  frontWL.position.set(-2.75, 2, 5)
  roomGroup.add(frontWL)
  const frontWR = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 0.15), wallMat)
  frontWR.position.set(2.75, 2, 5)
  roomGroup.add(frontWR)
  const frontWT = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 0.15), wallMat)
  frontWT.position.set(0, 3.6, 5)
  roomGroup.add(frontWT)

  // 天花板
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), wallMat)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = 4
  roomGroup.add(ceiling)

  // 地板纹理线条（木地板缝隙）
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x2a1a0a })
  for (let i = -3.5; i <= 3.5; i += 0.8) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 10), lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(i, 0.001, 0)
    roomGroup.add(line)
  }

  // --- 窗户（右墙） ---

  const windowFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 1.5, 2),
    new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.8 }),
  )
  windowFrame.position.set(3.9, 2.5, -1)
  roomGroup.add(windowFrame)

  // 窗户光晕
  const windowGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 1.2),
    new THREE.MeshBasicMaterial({ color: 0x7799bb, transparent: true, opacity: 0.25 }),
  )
  windowGlow.position.set(3.83, 2.5, -1)
  windowGlow.rotation.y = -Math.PI / 2
  roomGroup.add(windowGlow)

  // 窗外景色层（彩色时显现：天光 + 远山轮廓）
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.0 })
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), skyMat)
  sky.position.set(3.82, 2.5, -1.01)
  sky.rotation.y = -Math.PI / 2
  roomGroup.add(sky)

  const mountainMat = new THREE.MeshBasicMaterial({ color: 0x2d6a4f, transparent: true, opacity: 0.0 })
  const mountain = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), mountainMat)
  mountain.position.set(3.81, 2.25, -1.015)
  mountain.rotation.y = -Math.PI / 2
  roomGroup.add(mountain)

  // 窗框十字
  const crossMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.8 })
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.8), crossMat)
  crossH.position.set(3.84, 2.5, -1)
  roomGroup.add(crossH)
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.3, 0.05), crossMat)
  crossV.position.set(3.84, 2.5, -1)
  roomGroup.add(crossV)

  // --- 桌子 ---

  const tableMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.85, metalness: 0 })

  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.07, 0.7), tableMat)
  tableTop.position.set(-1.5, 0.78, -3.2)
  tableTop.castShadow = true
  tableTop.receiveShadow = true
  roomGroup.add(tableTop)

  // 桌腿
  const legGeo = new THREE.BoxGeometry(0.05, 0.78, 0.05)
  ;[[-2.1, -3.5], [-0.9, -3.5], [-2.1, -2.9], [-0.9, -2.9]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, tableMat)
    leg.position.set(x, 0.39, z)
    leg.castShadow = true
    roomGroup.add(leg)
  })

  // --- 花盆 ---

  const potMat = new THREE.MeshStandardMaterial({ color: 0x7a3a1a, roughness: 0.9 })

  const potBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.22, 8), potMat)
  potBody.position.set(-1.5, 0.94, -3.2)
  potBody.castShadow = true
  roomGroup.add(potBody)

  const potRim = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.015, 6, 12), potMat)
  potRim.position.set(-1.5, 1.05, -3.2)
  potRim.rotation.x = Math.PI / 2
  roomGroup.add(potRim)

  // 土壤
  const soil = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 8),
    new THREE.MeshStandardMaterial({ color: 0x2e1a0e }),
  )
  soil.position.set(-1.5, 1.045, -3.2)
  soil.rotation.x = -Math.PI / 2
  roomGroup.add(soil)

  // 花茎 + 花朵（鲜艳色彩，过渡后对比强烈）
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a7738 })
  const flowers: THREE.Mesh[] = []
  const vividFlowerColors = [0xe63946, 0xf4a261, 0xe9c46a, 0x2a9d8f, 0xe76f51]
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + 0.3
    const r = 0.03 + Math.random() * 0.03
    const height = 0.2 + Math.random() * 0.15

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, height, 4), stemMat)
    stem.position.set(-1.5 + Math.cos(angle) * r, 1.05 + height / 2, -3.2 + Math.sin(angle) * r)
    stem.rotation.z = (Math.random() - 0.5) * 0.25
    roomGroup.add(stem)

    // 鲜艳花朵
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 6, 6),
      new THREE.MeshStandardMaterial({ color: vividFlowerColors[i], roughness: 0.6 }),
    )
    flower.position.set(
      stem.position.x + Math.sin(stem.rotation.z) * height * 0.5,
      stem.position.y + height * 0.4,
      stem.position.z,
    )
    roomGroup.add(flower)
    flowers.push(flower)
  }

  // --- 蜡烛 ---

  const candleMat = new THREE.MeshStandardMaterial({ color: 0xf0e8d0, roughness: 0.8 })
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.14, 8), candleMat)
  candle.position.set(-1.2, 0.885, -3.4)
  roomGroup.add(candle)

  // 烛台底座
  const candleBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.06, 0.02, 12),
    new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.7, metalness: 0.3 }),
  )
  candleBase.position.set(-1.2, 0.81, -3.4)
  roomGroup.add(candleBase)

  // 火焰（自发光球体）
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffcc33 })
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), flameMat)
  flame.position.set(-1.2, 0.98, -3.4)
  flame.scale.set(1, 2.5, 1)
  roomGroup.add(flame)

  // 火焰光源（微弱的环境光补充）
  const flameLight = new THREE.PointLight(0xffaa22, 0.3, 3)
  flameLight.position.copy(flame.position)
  roomGroup.add(flameLight)

  // --- 书架（后墙右侧） ---

  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x4e3020, roughness: 0.85 })

  for (let i = 0; i < 3; i++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.35), shelfMat)
    shelf.position.set(2.2, 0.9 + i * 1.0, -4.72)
    shelf.castShadow = true
    roomGroup.add(shelf)

    // 书本
    const bookColors = [0x2c3e50, 0x34495e, 0x1a1a2e, 0x16213e, 0x0f3460, 0x3d2b1f, 0x4a3728]
    const bookCount = 5 + Math.floor(Math.random() * 4)
    let xOffset = 1.2
    for (let j = 0; j < bookCount; j++) {
      const w = 0.04 + Math.random() * 0.08
      const h = 0.25 + Math.random() * 0.2
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, 0.22),
        new THREE.MeshStandardMaterial({
          color: bookColors[Math.floor(Math.random() * bookColors.length)],
          roughness: 0.9,
        }),
      )
      book.position.set(xOffset + w / 2, 0.92 + i * 1.0 + h / 2, -4.72)
      book.castShadow = true
      book.rotation.z = (Math.random() - 0.5) * 0.05
      roomGroup.add(book)
      xOffset += w + 0.01
    }
  }

  // --- 椅子（桌子前） ---

  const chairMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.85 })

  // 座面
  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.45), chairMat)
  chairSeat.position.set(-1.5, 0.48, -2.5)
  chairSeat.castShadow = true
  roomGroup.add(chairSeat)

  // 靠背
  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.04), chairMat)
  chairBack.position.set(-1.5, 0.8, -2.73)
  chairBack.castShadow = true
  roomGroup.add(chairBack)

  // 椅腿
  const cLegGeo = new THREE.BoxGeometry(0.04, 0.48, 0.04)
  ;[[-1.7, -2.65], [-1.3, -2.65], [-1.7, -2.35], [-1.3, -2.35]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(cLegGeo, chairMat)
    leg.position.set(x, 0.24, z)
    leg.castShadow = true
    roomGroup.add(leg)
  })

  // --- 帛书卷轴（桌上） ---

  const scrollMat = new THREE.MeshStandardMaterial({ color: 0xd4c5a0, roughness: 0.7 })
  const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), scrollMat)
  scroll.position.set(-1.7, 0.84, -3.0)
  scroll.rotation.z = Math.PI / 2
  scroll.rotation.y = 0.3
  scroll.castShadow = true
  roomGroup.add(scroll)

  // --- 墙面装饰画（左墙，彩色后对比强烈） ---

  const paintingFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.8, 0.55),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.8 }),
  )
  paintingFrame.position.set(-3.9, 2.2, -2)
  paintingFrame.rotation.y = Math.PI / 2
  roomGroup.add(paintingFrame)

  // 画布 - 用多个色块模拟山水画
  const paintingColors = [
    { color: 0x264653, pos: [0, 0.15, 0] },     // 深蓝（山）
    { color: 0x2a9d8f, pos: [0.1, -0.05, 0] },   // 青绿（水）
    { color: 0xe9c46a, pos: [-0.08, 0.25, 0] },  // 金黄（日）
    { color: 0xf4a261, pos: [0.05, -0.2, 0] },   // 橙色
    { color: 0xe76f51, pos: [-0.1, -0.1, 0] },   // 赤红
  ]
  paintingColors.forEach(({ color, pos }) => {
    const s = new THREE.Mesh(
      new THREE.PlaneGeometry(0.35 + Math.random() * 0.1, 0.2 + Math.random() * 0.1),
      new THREE.MeshStandardMaterial({ color, roughness: 0.7 }),
    )
    s.position.set(-3.82, 2.2 + pos[1], -2 + pos[2])
    s.rotation.y = -Math.PI / 2
    roomGroup.add(s)
  })

  // --- 地毯（彩色花纹，色彩世界时非常醒目） ---

  const rugMat = new THREE.MeshStandardMaterial({ color: 0x8b2500, roughness: 0.95 })
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.5), rugMat)
  rug.rotation.x = -Math.PI / 2
  rug.position.set(-1.5, 0.005, -2.5)
  rug.receiveShadow = true
  roomGroup.add(rug)

  // 地毯花纹边框
  const rugBorderMat = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.9 })
  const rugBorder = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.2), rugBorderMat)
  rugBorder.rotation.x = -Math.PI / 2
  rugBorder.position.set(-1.5, 0.006, -2.5)
  roomGroup.add(rugBorder)

  const rugInnerMat = new THREE.MeshStandardMaterial({ color: 0x1a4a6e, roughness: 0.95 })
  const rugInner = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.8), rugInnerMat)
  rugInner.rotation.x = -Math.PI / 2
  rugInner.position.set(-1.5, 0.007, -2.5)
  roomGroup.add(rugInner)

  // --- 尘埃粒子 ---

  const particleCount = 300
  const pGeo = new THREE.BufferGeometry()
  const pPos = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 7.5
    pPos[i * 3 + 1] = Math.random() * 3.5 + 0.3
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 9.5
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
  const pMat = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.012,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
  })
  const particles = new THREE.Points(pGeo, pMat)
  scene.add(particles)

  // ============================================================
  // 黑白 → 彩色 过渡
  // ============================================================

  let transitionActive = false
  let transitionProgress = 0
  const TRANSITION_DURATION = 5.0 // 秒

  // 初始：全黑白
  rm.bwColorPass.uniforms['uSaturation'].value = 1.0

  const triggerTransition = () => {
    if (transitionActive) return
    transitionActive = true
    transitionProgress = 0

    const hint = document.getElementById('transition-hint')
    if (hint) hint.style.opacity = '0'

    // 字幕：梦境开始
    showSubtitle('……意识开始模糊……')
  }

  // 空格键 / 提示按钮
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault()
      triggerTransition()
    }
  })

  // 按钮点击
  document.getElementById('btn-enter-dream')?.addEventListener('click', triggerTransition)

  // --- 字幕系统 ---
  function showSubtitle(text: string, duration = 3000) {
    const overlay = document.getElementById('subtitle-overlay') as HTMLElement
    const textEl = document.getElementById('subtitle-text') as HTMLElement
    if (!overlay || !textEl) return
    textEl.textContent = text
    overlay.style.opacity = '1'
    setTimeout(() => {
      overlay.style.opacity = '0'
    }, duration)
  }

  // --- 缓动函数 ---
  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  // ============================================================
  // 渲染循环
  // ============================================================

  let subtitleShown1 = false
  let subtitleShown2 = false
  let subtitleShown3 = false
  let sceneEnded = false

  rm.onAnimate((delta, elapsed) => {
    controls.update(delta)

    // 尘埃飘动
    const positions = particles.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += Math.sin(elapsed * 0.3 + i * 1.7) * 0.0003
      positions[i * 3 + 1] += Math.sin(elapsed * 0.2 + i * 0.9) * 0.0002
      positions[i * 3 + 2] += Math.cos(elapsed * 0.25 + i * 1.3) * 0.0003
    }
    particles.geometry.attributes.position.needsUpdate = true

    // 蜡烛闪烁
    candleLight.intensity = 2.0 + Math.sin(elapsed * 8) * 0.3 + Math.sin(elapsed * 13) * 0.15
    flameLight.intensity = 0.3 + Math.sin(elapsed * 8) * 0.1
    flame.scale.y = 2.5 + Math.sin(elapsed * 10) * 0.4
    flame.scale.x = 1 + Math.sin(elapsed * 7) * 0.15
    flameMat.color.setHSL(0.12, 1, 0.6 + Math.sin(elapsed * 12) * 0.1)

    // 花朵微微摇曳
    flowers.forEach((f, i) => {
      f.rotation.z = Math.sin(elapsed * 0.8 + i * 2) * 0.05
      f.position.y += Math.sin(elapsed * 0.5 + i) * 0.00005
    })

    // --- 过渡动画 ---
    if (transitionActive && transitionProgress < 1) {
      transitionProgress += delta / TRANSITION_DURATION
      transitionProgress = Math.min(transitionProgress, 1)

      const t = easeInOutCubic(transitionProgress)

      // 饱和度：1(黑白) → 0(彩色)
      rm.bwColorPass.uniforms['uSaturation'].value = 1.0 - t

      // 暗角减弱（梦境更通透）
      rm.bwColorPass.uniforms['uVignetteIntensity'].value = 0.45 - t * 0.25

      // 亮度逐渐提升
      rm.bwColorPass.uniforms['uBrightness'].value = 0.9 + t * 0.2

      // 灯光变暖变亮
      candleLight.intensity = 2.0 + t * 2.0
      candleLight.color.setRGB(1.0, 0.67 + t * 0.2, 0.27 + t * 0.4)

      ambient.intensity = 0.4 + t * 0.5
      ambient.color.setRGB(0.4 + t * 0.2, 0.4 + t * 0.15, 0.5 + t * 0.1)

      // 窗户光变蓝（梦境感）
      windowLight.intensity = 0.6 + t * 0.8
      windowLight.color.setRGB(0.4 + t * 0.1, 0.53 + t * 0.2, 0.67 + t * 0.25)

      // 窗外景色逐渐显现
      skyMat.opacity = t * 0.7
      mountainMat.opacity = t * 0.8

      // 阶段字幕
      if (t > 0.1 && !subtitleShown1) {
        subtitleShown1 = true
        showSubtitle('色彩，从裂缝中蔓延开来……', 2500)
      }
      if (t > 0.45 && !subtitleShown2) {
        subtitleShown2 = true
        showSubtitle('花盆碎裂的声音……很轻', 2500)
      }
      if (t > 0.8 && !subtitleShown3) {
        subtitleShown3 = true
        showSubtitle('或者，那只是一场梦的开始', 3500)
      }

      // 粒子在过渡时变亮变暖（梦幻感）
      pMat.opacity = 0.35 + t * 0.35
      pMat.size = 0.012 + t * 0.008
      pMat.color.setRGB(1.0, 0.85 + t * 0.15, 0.6 + t * 0.35)
    }

    // --- 过渡完成：淡出 → 跳转场景2 ---
    if (transitionActive && transitionProgress >= 1 && !sceneEnded) {
      sceneEnded = true
      controls.disabled = true

      // 1.5秒后淡出并跳转
      setTimeout(() => {
        const fadeEl = document.getElementById('scene-fade')
        if (fadeEl) {
          fadeEl.style.opacity = '1'
          setTimeout(() => {
            window.location.href = '/pages/scene-2.html'
          }, 1200)
        } else {
          window.location.href = '/pages/scene-2.html'
        }
      }, 1500)
    }
  })

  // --- 隐藏加载屏 ---
  setTimeout(() => {
    const loading = document.getElementById('loading-screen')
    if (loading) loading.classList.add('hidden')
    showSubtitle('一间老旧的房间。烛光摇曳。', 4000)
  }, 800)

  return { rendererManager: rm, controls }
}

// --- 自动初始化 ---
const container = document.getElementById('scene-container')
if (container) {
  createScene1(container)
}
