import * as THREE from 'three'
import { RendererManager } from '../core/renderer'
import { FPSCameraControls } from '../core/camera-controls'
import { createLakeMaterial } from '../shaders/water'
import { createTree, showSubtitle, hideLoading, transitionToScene, easeInOutCubic, SimpleTimeline } from '../core/scene-helpers'

// ============================================================
// 场景3：湖泊旁-梦境1 —— 蓝色琥珀染湖，孤舟出现，世界失控
// ============================================================

export function createScene3(container: HTMLElement) {
  const rm = new RendererManager({ container, bgColor: 0x0a1520 })
  rm.bwColorPass.uniforms['uSaturation'].value = -0.1
  rm.bwColorPass.uniforms['uVignetteIntensity'].value = 0.3
  rm.bwColorPass.uniforms['uBrightness'].value = 1.05

  const controls = new FPSCameraControls(rm.camera, rm.renderer.domElement)
  const scene = rm.scene
  scene.fog = new THREE.FogExp2(0x0a1520, 0.035)

  // --- 灯光 ---
  const ambient = new THREE.AmbientLight(0x334455, 0.6)
  scene.add(ambient)
  const moonLight = new THREE.DirectionalLight(0x6688aa, 0.8)
  moonLight.position.set(-5, 8, -3)
  scene.add(moonLight)

  // --- 地面 ---
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x2a3a2a, roughness: 0.95 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // --- 湖泊 ---
  const LAKE_R = 8
  const lakeMat = createLakeMaterial()
  const lake = new THREE.Mesh(new THREE.CircleGeometry(LAKE_R, 64), lakeMat)
  lake.rotation.x = -Math.PI / 2
  lake.position.y = 0.05
  scene.add(lake)

  // 湖岸
  const shore = new THREE.Mesh(
    new THREE.RingGeometry(LAKE_R - 0.3, LAKE_R + 1.0, 64),
    new THREE.MeshStandardMaterial({ color: 0x4a5a3a, roughness: 0.9 }),
  )
  shore.rotation.x = -Math.PI / 2
  shore.position.y = 0.02
  scene.add(shore)

  // --- 树木 ---
  const treePos = [
    [-10,-5],[-8,-10],[-12,0],[-6,-13],[-14,-7],
    [10,-5],[8,-10],[12,0],[6,-13],[14,-7],
    [-5,-16],[5,-16],[0,-19],[-9,-17],[9,-17],
  ]
  treePos.forEach(([x, z]) => createTree(scene, x, z, 0.8 + Math.random() * 0.6))

  // --- 远山 ---
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x1a2a1a, roughness: 0.95 })
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const r = 22 + Math.random() * 10
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(4 + Math.random() * 4, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
      hillMat,
    )
    hill.position.set(Math.cos(a) * r, 0, Math.sin(a) * r - 5)
    hill.scale.y = 0.35
    scene.add(hill)
  }

  // --- 蓝色琥珀 ---
  const amberOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x125e8a, transparent: true, opacity: 0.9 }),
  )
  amberOrb.position.set(0, 5, -LAKE_R + 2)
  scene.add(amberOrb)

  const amberGlow = new THREE.PointLight(0x3c92ca, 0, 6)
  amberOrb.add(amberGlow)

  const AMBER_DROP_POS = new THREE.Vector2(0, -LAKE_R + 2)
  let amberPhase: 'waiting' | 'falling' | 'spreading' | 'complete' = 'waiting'
  let amberFallT = 0
  let amberSpreadT = 0

  // --- 孤舟 ---
  const boat = new THREE.Group()
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.18, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x5c3d1e, roughness: 0.85 }),
  )
  boat.add(hull)
  const bow = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.5, 4),
    new THREE.MeshStandardMaterial({ color: 0x5c3d1e, roughness: 0.85 }),
  )
  bow.rotation.x = Math.PI / 2
  bow.position.z = -1.1
  boat.add(bow)
  boat.position.set(3, 0.1, -LAKE_R + 3)
  boat.visible = false
  scene.add(boat)

  // 相机起始位（湖岸）
  rm.camera.position.set(0, 1.6, 2)

  // --- 时间轴 ---
  const tl = new SimpleTimeline()
  tl.add(1.5, () => showSubtitle('一片没有名字的湖。', 3500))
  tl.add(5.0, () => showSubtitle('有什么东西，从天空坠落……', 3500))
  tl.add(6.0, () => { amberPhase = 'falling' })
  tl.add(9.5, () => showSubtitle('蓝色。像琥珀一样浓稠的蓝。', 4000))
  tl.add(14.0, () => { boat.visible = true; showSubtitle('湖面上，出现了一只孤舟。', 3500) })
  tl.add(18.0, () => showSubtitle('世界开始失控。', 3000))
  tl.add(22.0, () => transitionToScene('/pages/scene-4.html'))

  // --- 渲染循环 ---
  rm.onAnimate((delta, elapsed) => {
    controls.update(delta)
    tl.update(delta)

    lakeMat.uniforms['uTime'].value = elapsed

    // 琥珀坠落
    if (amberPhase === 'falling') {
      amberFallT += delta / 2.0
      if (amberFallT >= 1) { amberFallT = 1; amberPhase = 'spreading' }
      const t = easeInOutCubic(amberFallT)
      amberOrb.position.y = 5 - 4.85 * t
      amberGlow.intensity = 2 + t * 4
      if (t > 0.8) lakeMat.uniforms['uDisturbance'].value = 0.3
    }

    // 琥珀扩散
    if (amberPhase === 'spreading') {
      amberSpreadT += delta / 6.0
      amberSpreadT = Math.min(amberSpreadT, 1)
      const t = easeInOutCubic(amberSpreadT)
      lakeMat.uniforms['uAmberRadius'].value = t * LAKE_R * 1.2
      lakeMat.uniforms['uAmberIntensity'].value = t
      lakeMat.uniforms['uAmberCenter'].value.copy(AMBER_DROP_POS)
      lakeMat.uniforms['uDisturbance'].value = 0.3 * (1 - t * 0.5)
      amberOrb.material.opacity = Math.max(0, 0.9 - amberSpreadT * 2)
      amberGlow.intensity = Math.max(0, 6 - amberSpreadT * 12)
      if (amberSpreadT >= 1) amberPhase = 'complete'
    }

    // 世界失控（18秒后波浪加剧 + 相机抖动）
    const et = tl.getElapsed()
    if (et > 18) {
      const c = Math.min(1, (et - 18) / 4)
      lakeMat.uniforms['uDisturbance'].value = 0.3 + c * 0.7
      rm.camera.position.x += (Math.random() - 0.5) * c * 0.004
      rm.camera.position.y = 1.6 + Math.sin(elapsed * 5) * c * 0.03
    }

    // 孤舟浮动
    if (boat.visible) {
      boat.position.y = 0.1 + Math.sin(elapsed * 0.8) * 0.03
      boat.rotation.z = Math.sin(elapsed * 0.5) * 0.02
    }
  })

  setTimeout(() => { hideLoading(); tl.start() }, 600)
  return { rendererManager: rm, controls }
}

const container = document.getElementById('scene-container')
if (container) createScene3(container)
