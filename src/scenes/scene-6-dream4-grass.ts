import * as THREE from 'three'
import { RendererManager } from '../core/renderer'
import { FPSCameraControls } from '../core/camera-controls'
import { showSubtitle, hideLoading, transitionToScene, easeInOutCubic, SimpleTimeline } from '../core/scene-helpers'

// ============================================================
// 场景6：草地上-梦境4 —— 化为孩童，蝴蝶放飞
// ============================================================

export function createScene6(container: HTMLElement) {
  // 入场白屏（从场景5白光过渡）
  const rm = new RendererManager({ container, bgColor: 0xf5f0e0 })
  rm.bwColorPass.uniforms['uSaturation'].value = -0.05
  rm.bwColorPass.uniforms['uVignetteIntensity'].value = 0.15
  rm.bwColorPass.uniforms['uBrightness'].value = 1.2
  rm.bwColorPass.uniforms['uContrast'].value = 1.0

  const controls = new FPSCameraControls(rm.camera, rm.renderer.domElement)
  const scene = rm.scene

  // 入场白蒙版淡出
  const fadeEl = document.getElementById('scene-fade') as HTMLElement
  if (fadeEl) { fadeEl.style.background = '#fff'; fadeEl.style.opacity = '1'; fadeEl.style.pointerEvents = 'none' }

  // 灯光（温暖的午后阳光）
  scene.add(new THREE.AmbientLight(0xfff5e0, 0.8))
  const sun = new THREE.DirectionalLight(0xffeedd, 1.2)
  sun.position.set(5, 8, 3)
  sun.castShadow = true
  scene.add(sun)

  // --- 草地 ---
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x5a8a3a, roughness: 0.95 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 草丛细节（小三角锥散布）
  const grassBladeMat = new THREE.MeshStandardMaterial({ color: 0x4a7a2a, roughness: 0.95, side: THREE.DoubleSide })
  for (let i = 0; i < 200; i++) {
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.03, 0.1 + Math.random() * 0.08, 3),
      grassBladeMat,
    )
    blade.position.set(
      (Math.random() - 0.5) * 20,
      0.05,
      (Math.random() - 0.5) * 20,
    )
    blade.rotation.z = (Math.random() - 0.5) * 0.3
    scene.add(blade)
  }

  // --- 远处的树 ---
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x3a7a4a, roughness: 0.85 })
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.5
    const r = 12 + Math.random() * 5
    const tree = new THREE.Group()
    const trunk6 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.5, 5), new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.9 }))
    trunk6.position.set(0, 0.75, 0)
    tree.add(trunk6)
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.8 + Math.random() * 0.4, 6, 6), treeMat)
    canopy.position.set(0, 2.0, 0)
    tree.add(canopy)
    tree.position.set(Math.cos(a) * r, 0, Math.sin(a) * r)
    scene.add(tree)
  }

  // --- 小花点缀 ---
  const flowerColors = [0xe63946, 0xf4a261, 0xe9c46a, 0xff6b6b, 0xcc8899]
  for (let i = 0; i < 40; i++) {
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 5, 5),
      new THREE.MeshStandardMaterial({ color: flowerColors[i % 5], roughness: 0.6 }),
    )
    flower.position.set((Math.random() - 0.5) * 15, 0.04, (Math.random() - 0.5) * 15)
    scene.add(flower)
  }

  // --- 相机：孩童视角（低） ---
  rm.camera.position.set(0, 0.9, 0) // 孩童高度约0.9m
  let cameraTransitioning = true
  let cameraTransT = 0

  // --- 蝴蝶 ---
  const BUTTERFLY_COUNT = 12
  const butterflies: { group: THREE.Group; phase: number; radius: number; speed: number; yOffset: number; cx: number; cz: number }[] = []

  for (let i = 0; i < BUTTERFLY_COUNT; i++) {
    const bGroup = new THREE.Group()

    // 翅膀
    const wingMat = new THREE.MeshBasicMaterial({
      color: [0xe63946, 0xf4a261, 0x3c92ca, 0xe9c46a, 0xff6b6b, 0xa855f7][i % 6],
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    })
    const wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.05), wingMat)
    wingL.position.x = -0.04
    bGroup.add(wingL)
    const wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.05), wingMat)
    wingR.position.x = 0.04
    bGroup.add(wingR)

    bGroup.visible = false
    scene.add(bGroup)

    butterflies.push({
      group: bGroup,
      phase: Math.random() * Math.PI * 2,
      radius: 1 + Math.random() * 3,
      speed: 0.3 + Math.random() * 0.4,
      yOffset: 0.5 + Math.random() * 1.5,
      cx: (Math.random() - 0.5) * 4,
      cz: (Math.random() - 0.5) * 4,
    })
  }

  let butterfliesReleased = false

  // --- 时间轴 ---
  const tl = new SimpleTimeline()
  tl.add(2.0, () => showSubtitle('世界变得很大。', 3000))
  tl.add(5.0, () => showSubtitle('你低头看自己的手——很小。', 3000))
  tl.add(8.0, () => { cameraTransitioning = true; cameraTransT = 0; showSubtitle('你变成了一个孩子。', 3500) })
  tl.add(12.0, () => showSubtitle('手中，有什么东西在动。', 3000))
  tl.add(14.0, () => {
    butterfliesReleased = true
    butterflies.forEach(b => b.group.visible = true)
    showSubtitle('蝴蝶。从掌心飞向天空。', 4000)
  })
  tl.add(20.0, () => showSubtitle('你张开双臂，跟着跑了起来。', 3500))
  tl.add(25.0, () => transitionToScene('/pages/scene-7.html'))

  rm.onAnimate((delta, elapsed) => {
    controls.update(delta)
    tl.update(delta)
    const et = tl.getElapsed()

    // 入场白蒙版淡出
    if (fadeEl && et < 2) {
      fadeEl.style.opacity = String(Math.max(0, 1 - et / 1.5))
      if (et > 1.5) { fadeEl.style.opacity = '0'; fadeEl.style.pointerEvents = 'none' }
    }

    // 孩童视角平滑过渡
    if (et > 7.5 && et < 10) {
      cameraTransitioning = true
      cameraTransT += delta / 2.5
      const t = easeInOutCubic(Math.min(cameraTransT, 1))
      rm.camera.position.y = 1.6 - 0.7 * t // 从成人降到孩童高度
    }

    // 蝴蝶动画
    if (butterfliesReleased) {
      butterflies.forEach((b, i) => {
        const t = Math.max(0, (et - 14) * b.speed)
        // 从中心向外飞散，螺旋上升
        const r = b.radius * Math.min(1, t / 3)
        const angle = b.phase + t * 1.5
        b.group.position.set(
          b.cx + Math.cos(angle) * r,
          b.yOffset + t * 0.3,
          b.cz + Math.sin(angle) * r,
        )
        // 翅膀扇动
        const wingAngle = Math.sin(elapsed * 12 + i * 2) * 0.7
        b.group.children[0].rotation.y = wingAngle
        b.group.children[1].rotation.y = -wingAngle
        // 面朝飞行方向
        b.group.rotation.y = angle + Math.PI / 2
      })
    }

    // 20秒后：自由奔跑感（相机微晃）
    if (et > 20) {
      const runT = Math.min(1, (et - 20) / 3)
      rm.camera.position.z -= delta * runT * 1.5 // 缓慢前移
      rm.camera.position.y = 0.9 + Math.abs(Math.sin(elapsed * 6)) * 0.03 * runT // 跑动颠簸
    }
  })

  setTimeout(() => { hideLoading(); tl.start() }, 600)
  return { rendererManager: rm, controls }
}

const container = document.getElementById('scene-container')
if (container) createScene6(container)
