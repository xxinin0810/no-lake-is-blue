import * as THREE from 'three'
import { RendererManager } from '../core/renderer'
import { FPSCameraControls } from '../core/camera-controls'
import { createLakeMaterial } from '../shaders/water'
import { createTree, createHumanFigure, showSubtitle, hideLoading, transitionToScene, easeInOutCubic, SimpleTimeline } from '../core/scene-helpers'

// ============================================================
// 场景5：湖泊旁-梦境3 —— 少女出现，乘船，坠入白光
// ============================================================

export function createScene5(container: HTMLElement) {
  const rm = new RendererManager({ container, bgColor: 0x0d1a2a })
  rm.bwColorPass.uniforms['uSaturation'].value = -0.15
  rm.bwColorPass.uniforms['uVignetteIntensity'].value = 0.25
  rm.bwColorPass.uniforms['uBrightness'].value = 1.1

  const controls = new FPSCameraControls(rm.camera, rm.renderer.domElement)
  const scene = rm.scene
  scene.fog = new THREE.FogExp2(0x0d1a2a, 0.03)

  // 灯光（月光+湖蓝）
  scene.add(new THREE.AmbientLight(0x334466, 0.7))
  const moon = new THREE.DirectionalLight(0x7799cc, 0.9)
  moon.position.set(-3, 6, -2)
  scene.add(moon)
  const lakeGlow = new THREE.PointLight(0x3c92ca, 0.5, 8)
  lakeGlow.position.set(0, 1, -5)
  scene.add(lakeGlow)

  // 地面
  const ground5 = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({ color: 0x2a3a2a, roughness: 0.95 }))
  ground5.rotation.x = -Math.PI / 2
  scene.add(ground5)

  // 湖泊（已染蓝）
  const LAKE_R = 8
  const lakeMat = createLakeMaterial()
  lakeMat.uniforms['uAmberIntensity'].value = 1.0
  lakeMat.uniforms['uAmberRadius'].value = LAKE_R
  lakeMat.uniforms['uAmberCenter'].value.set(0, -5)
  const lake = new THREE.Mesh(new THREE.CircleGeometry(LAKE_R, 64), lakeMat)
  lake.rotation.x = -Math.PI / 2; lake.position.y = 0.05
  scene.add(lake)

  // 湖岸
  const shore = new THREE.Mesh(
    new THREE.RingGeometry(LAKE_R - 0.3, LAKE_R + 1.0, 64),
    new THREE.MeshStandardMaterial({ color: 0x4a5a3a, roughness: 0.9 }),
  )
  shore.rotation.x = -Math.PI / 2; shore.position.y = 0.02
  scene.add(shore)

  // 树木（稀疏，月光感）
  ;[[-10,-4],[-8,-10],[-12,1],[8,-6],[12,-1],[5,-12],[-6,-14],[10,-12]].forEach(([x, z]) =>
    createTree(scene, x, z, 0.7 + Math.random() * 0.5))

  // --- 少女 ---
  const girl = createHumanFigure(0xd4a0a0, 0.95) // 粉白色调
  girl.position.set(1, 0, -LAKE_R + 1.5)
  girl.rotation.y = Math.PI * 0.1
  girl.visible = false
  scene.add(girl)

  // 少女光晕
  const girlGlow = new THREE.PointLight(0xaaccee, 0, 4)
  girlGlow.position.set(1, 1.5, -LAKE_R + 1.5)
  scene.add(girlGlow)

  // --- 孤舟 ---
  const boat = new THREE.Group()
  boat.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 1.8), new THREE.MeshStandardMaterial({ color: 0x5c3d1e, roughness: 0.85 })))
  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0x5c3d1e, roughness: 0.85 }))
  bow.rotation.x = Math.PI / 2; bow.position.z = -1.1; boat.add(bow)
  boat.position.set(0.5, 0.1, -LAKE_R + 2.5)
  scene.add(boat)

  // --- 白光效果（覆盖层） ---
  const whiteLight = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide }),
  )
  whiteLight.position.set(0, 2, -LAKE_R + 2)
  whiteLight.lookAt(0, 2, 10)
  scene.add(whiteLight)

  // 白光屏幕效果（后处理中用 overlay 实现）
  let whiteOverlayOpacity = 0

  rm.camera.position.set(0, 1.6, 1)

  // --- 时间轴 ---
  const tl = new SimpleTimeline()
  tl.add(1.5, () => showSubtitle('又是这片湖。蓝色已经漫到了岸边。', 4000))
  tl.add(5.5, () => showSubtitle('湖边站着一个人。', 3000))
  tl.add(7.0, () => { girl.visible = true; girlGlow.intensity = 0.8 })
  tl.add(9.0, () => showSubtitle('她没有说话，只是看着你。', 3000))
  tl.add(12.0, () => { showSubtitle('你走向那只船。', 2500); controls.disabled = true })
  tl.add(14.5, () => showSubtitle('船在动。', 2000))
  tl.add(17.0, () => showSubtitle('白光……从湖底升起。', 3000))
  tl.add(19.0, () => { whiteOverlayOpacity = 1 })
  tl.add(21.0, () => transitionToScene('/pages/scene-6.html', '#fff', 800))

  rm.onAnimate((delta, elapsed) => {
    controls.update(delta)
    tl.update(delta)
    const et = tl.getElapsed()

    lakeMat.uniforms['uTime'].value = elapsed

    // 少女微微摇曳
    if (girl.visible) {
      girl.rotation.y = Math.PI * 0.1 + Math.sin(elapsed * 0.3) * 0.05
      girlGlow.intensity = 0.6 + Math.sin(elapsed * 0.7) * 0.2
    }

    // 船浮动
    boat.position.y = 0.1 + Math.sin(elapsed * 0.7) * 0.025
    boat.rotation.z = Math.sin(elapsed * 0.4) * 0.015

    // 12秒后相机自动走向船
    if (et > 12 && et < 18) {
      const t = Math.min(1, (et - 12) / 4)
      rm.camera.position.z = 1 + t * 0.5
      rm.camera.position.y = 1.6 + Math.sin(t * Math.PI) * 0.3 // 轻微上下
    }

    // 白光效果
    if (et > 17) {
      const t = Math.min(1, (et - 17) / 2)
      whiteLight.material.opacity = t * 0.6
      whiteLight.scale.setScalar(1 + t * 3)
      whiteOverlayOpacity = t * 0.8
      rm.bwColorPass.uniforms['uBrightness'].value = 1.1 + t * 1.5
      lakeGlow.intensity = 0.5 + t * 2
    }

    // 用 CSS overlay 模拟白光蒙版
    const overlay = document.getElementById('scene-fade') as HTMLElement
    if (overlay && whiteOverlayOpacity > 0) {
      overlay.style.background = `rgba(255,255,255,${whiteOverlayOpacity})`
      overlay.style.opacity = '1'
      overlay.style.pointerEvents = 'none'
    }
  })

  setTimeout(() => { hideLoading(); tl.start() }, 600)
  return { rendererManager: rm, controls }
}

const container = document.getElementById('scene-container')
if (container) {
  try { createScene5(container) }
  catch (e) { console.error('Scene 5 failed:', e); document.getElementById('loading-screen')?.classList.add('hidden') }
}
