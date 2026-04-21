import * as THREE from 'three'
import { RendererManager } from '../core/renderer'
import { FPSCameraControls } from '../core/camera-controls'
import { NarrativeEngine, SceneConfig } from '../core/narrative-engine'
import { showSubtitle, transitionToScene, hideLoading } from '../core/scene-helpers'

// ============================================================
// 场景2：庄房内（梦境1）—— 彩色世界，穿墙到书房，走向湖边
// ============================================================

export function createScene2(container: HTMLElement) {
  const rm = new RendererManager({
    container,
    antialias: true,
    xrEnabled: true,
    bgColor: 0x1a2a3a,
  })

  const controls = new FPSCameraControls(rm.camera, rm.renderer.domElement)
  const scene = rm.scene

  // --- 灯光（梦境：更明亮柔和） ---

  const ambient = new THREE.AmbientLight(0x667788, 0.8)
  scene.add(ambient)

  // 从窗口洒入的金色光
  const windowLight = new THREE.DirectionalLight(0xffeedd, 1.2)
  windowLight.position.set(5, 4, -2)
  windowLight.castShadow = true
  windowLight.shadow.mapSize.set(512, 512)
  scene.add(windowLight)

  // 室内暖光（灯笼感）
  const warmLight = new THREE.PointLight(0xffaa55, 0.8, 8)
  warmLight.position.set(0, 3, 0)
  scene.add(warmLight)

  // 湖边方向的蓝绿色光（引导视线）
  const lakeLight = new THREE.PointLight(0x3c92ca, 0.6, 10)
  lakeLight.position.set(0, 2, 8)
  scene.add(lakeLight)

  // 彩色后处理：轻微饱和
  rm.bwColorPass.uniforms['uSaturation'].value = -0.15  // 轻微过饱和，梦境感
  rm.bwColorPass.uniforms['uVignetteIntensity'].value = 0.25
  rm.bwColorPass.uniforms['uBrightness'].value = 1.1
  rm.bwColorPass.uniforms['uContrast'].value = 1.05

  // --- 房间结构（同场景1布局但色彩更丰富） ---

  const roomGroup = new THREE.Group()
  scene.add(roomGroup)

  // 地板 - 温暖木色
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.88, metalness: 0 })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 14), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  roomGroup.add(floor)

  // 墙壁 - 梦境中的暖色调墙壁
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.92, metalness: 0, side: THREE.DoubleSide })

  // 后墙
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 0.15), wallMat)
  backWall.position.set(0, 2, -7)
  backWall.receiveShadow = true
  roomGroup.add(backWall)

  // 左墙
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4, 14), wallMat)
  leftWall.position.set(-5, 2, 0)
  leftWall.receiveShadow = true
  roomGroup.add(leftWall)

  // 右墙（有一段可以穿过的"墙"——通往书房）
  const rightWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4, 5), wallMat)
  rightWall1.position.set(5, 2, -4.5)
  roomGroup.add(rightWall1)
  const rightWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4, 5), wallMat)
  rightWall2.position.set(5, 2, 5.5)
  roomGroup.add(rightWall2)

  // 天花板
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 14), wallMat)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = 4
  roomGroup.add(ceiling)

  // --- 窗户（右墙，大窗，透出彩光） ---

  const windowFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 2, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x5c4030, roughness: 0.7 }),
  )
  windowFrame.position.set(4.9, 2.5, -4.5)
  roomGroup.add(windowFrame)

  // 窗户光（温暖日光）
  const windowGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.7),
    new THREE.MeshBasicMaterial({ color: 0xffe4b5, transparent: true, opacity: 0.5 }),
  )
  windowGlow.position.set(4.8, 2.5, -4.5)
  windowGlow.rotation.y = -Math.PI / 2
  roomGroup.add(windowGlow)

  // --- 书架 + 书（后墙，更丰富的色彩） ---

  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.85 })

  for (let i = 0; i < 4; i++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(3, 0.04, 0.4), shelfMat)
    shelf.position.set(2, 0.8 + i * 0.9, -6.82)
    shelf.castShadow = true
    roomGroup.add(shelf)

    const bookColors = [0xc0392b, 0x2980b9, 0x27ae60, 0x8e44ad, 0xd35400, 0x16a085, 0xf39c12, 0x2c3e50]
    const bookCount = 6 + Math.floor(Math.random() * 5)
    let xOffset = 0.6
    for (let j = 0; j < bookCount; j++) {
      const w = 0.04 + Math.random() * 0.1
      const h = 0.22 + Math.random() * 0.2
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, 0.28),
        new THREE.MeshStandardMaterial({
          color: bookColors[Math.floor(Math.random() * bookColors.length)],
          roughness: 0.85,
        }),
      )
      book.position.set(xOffset + w / 2, 0.82 + i * 0.9 + h / 2, -6.82)
      book.castShadow = true
      book.rotation.z = (Math.random() - 0.5) * 0.06
      roomGroup.add(book)
      xOffset += w + 0.015
    }
  }

  // --- 桌子 + 毛笔 + 稿纸 ---

  const tableMat = new THREE.MeshStandardMaterial({ color: 0x7a5038, roughness: 0.82 })
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.07, 0.9), tableMat)
  tableTop.position.set(-2, 0.78, -4)
  tableTop.castShadow = true
  tableTop.receiveShadow = true
  roomGroup.add(tableTop)

  // 桌腿
  const legGeo = new THREE.BoxGeometry(0.06, 0.78, 0.06)
  ;[[-2.8, -4.35], [-1.2, -4.35], [-2.8, -3.65], [-1.2, -3.65]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, tableMat)
    leg.position.set(x, 0.39, z)
    leg.castShadow = true
    roomGroup.add(leg)
  })

  // 毛笔
  const brushHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.006, 0.25, 6),
    new THREE.MeshStandardMaterial({ color: 0x5c3d1e, roughness: 0.7 }),
  )
  brushHandle.position.set(-2.3, 0.93, -4.1)
  brushHandle.rotation.z = 0.2
  roomGroup.add(brushHandle)

  const brushTip = new THREE.Mesh(
    new THREE.ConeGeometry(0.008, 0.04, 6),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
  )
  brushTip.position.set(-2.42, 0.81, -4.1)
  brushTip.rotation.z = Math.PI + 0.2
  roomGroup.add(brushTip)

  // 稿纸（多张散落）
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.7, side: THREE.DoubleSide })
  for (let i = 0; i < 4; i++) {
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.35), paperMat)
    paper.position.set(-1.6 + i * 0.12 + Math.random() * 0.05, 0.82, -3.9 + Math.random() * 0.15)
    paper.rotation.x = -Math.PI / 2
    paper.rotation.z = (Math.random() - 0.5) * 0.15
    paper.receiveShadow = true
    roomGroup.add(paper)
  }

  // 墨砚
  const inkStone = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.04, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 }),
  )
  inkStone.position.set(-1.8, 0.81, -4.15)
  roomGroup.add(inkStone)

  // --- 穿墙标记（右墙缺口处的光门） ---

  const portalMat = new THREE.MeshBasicMaterial({
    color: 0x3c92ca,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
  })
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.5), portalMat)
  portal.position.set(4.95, 2, 0.5)
  portal.rotation.y = -Math.PI / 2
  roomGroup.add(portal)

  // --- 梦境粒子（更梦幻、更大、更亮） ---

  const particleCount = 500
  const pGeo = new THREE.BufferGeometry()
  const pPos = new Float32Array(particleCount * 3)
  const pColors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 9
    pPos[i * 3 + 1] = Math.random() * 3.8 + 0.2
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 13

    // 随机暖色/冷色粒子
    const isWarm = Math.random() > 0.4
    pColors[i * 3] = isWarm ? 1.0 : 0.4 + Math.random() * 0.3
    pColors[i * 3 + 1] = isWarm ? 0.7 + Math.random() * 0.3 : 0.6 + Math.random() * 0.2
    pColors[i * 3 + 2] = isWarm ? 0.3 + Math.random() * 0.3 : 0.8 + Math.random() * 0.2
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
  pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3))

  const pMat = new THREE.PointsMaterial({
    size: 0.018,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    vertexColors: true,
  })
  const particles = new THREE.Points(pGeo, pMat)
  scene.add(particles)

  // --- 叙事引擎 ---

  const sceneConfig: SceneConfig = {
    sceneId: 'scene-2-dream1',
    timeline: [
      { time: 1.5, type: 'subtitle', data: { text: '你站在房间里，却觉得哪里不对。', duration: 3500 } },
      { time: 6.0, type: 'subtitle', data: { text: '墙壁上有一道光……仿佛在邀请你穿过。', duration: 4000 } },
      { time: 12.0, type: 'subtitle', data: { text: '桌上散落的稿纸，写着一些看不清的字迹。', duration: 4000 } },
    ],
  }

  const narrative = new NarrativeEngine(sceneConfig)
  narrative.init()
  narrative.start()

  // --- 渲染循环 ---

  rm.onAnimate((delta, elapsed) => {
    controls.update(delta)
    narrative.update(delta)

    // 粒子飘动（更活跃）
    const positions = particles.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += Math.sin(elapsed * 0.25 + i * 1.3) * 0.0005
      positions[i * 3 + 1] += Math.sin(elapsed * 0.15 + i * 0.7) * 0.0003
      positions[i * 3 + 2] += Math.cos(elapsed * 0.2 + i * 1.1) * 0.0004
    }
    particles.geometry.attributes.position.needsUpdate = true

    // 光门呼吸效果
    portal.material.opacity = 0.12 + Math.sin(elapsed * 0.8) * 0.05
    portalMat.color.setHSL(0.55 + Math.sin(elapsed * 0.3) * 0.05, 0.6, 0.55)

    // 灯光微动
    warmLight.intensity = 0.8 + Math.sin(elapsed * 0.5) * 0.1
    lakeLight.intensity = 0.6 + Math.sin(elapsed * 0.7 + 1) * 0.15

    // 叙事完成后自动跳转场景3
    if (narrative.isComplete()) {
      if (!transitionTriggered) {
        transitionTriggered = true
        setTimeout(() => {
          showSubtitle('墙上的光……似乎通向某个地方。', 3000)
          setTimeout(() => transitionToScene('/pages/scene-3.html'), 3500)
        }, 1500)
      }
    }
  })

  let transitionTriggered = false

  // --- 隐藏加载屏 ---
  setTimeout(() => {
    hideLoading()
  }, 600)

  return { rendererManager: rm, controls, narrative }
}

// --- 自动初始化 ---
const container = document.getElementById('scene-container')
if (container) {
  createScene2(container)
}
