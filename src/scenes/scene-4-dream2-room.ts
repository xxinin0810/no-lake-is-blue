import * as THREE from 'three'
import { RendererManager } from '../core/renderer'
import { FPSCameraControls } from '../core/camera-controls'
import { showSubtitle, hideLoading, transitionToScene, easeInOutCubic, SimpleTimeline } from '../core/scene-helpers'

// ============================================================
// 场景4：庄房内-梦境2 —— 书写帛书、撕裂、被追跑
// ============================================================

export function createScene4(container: HTMLElement) {
  const rm = new RendererManager({ container, bgColor: 0x0a0808 })
  rm.bwColorPass.uniforms['uSaturation'].value = 0.5
  rm.bwColorPass.uniforms['uVignetteIntensity'].value = 0.6
  rm.bwColorPass.uniforms['uBrightness'].value = 0.7
  rm.bwColorPass.uniforms['uContrast'].value = 1.3

  const controls = new FPSCameraControls(rm.camera, rm.renderer.domElement)
  const scene = rm.scene
  scene.fog = new THREE.FogExp2(0x0a0808, 0.025)

  // 灯光（阴暗闪烁）
  const ambient = new THREE.AmbientLight(0x201510, 0.3)
  scene.add(ambient)
  const mainLight = new THREE.PointLight(0xcc6622, 1.0, 10)
  mainLight.position.set(0, 2.5, 0)
  mainLight.castShadow = true
  scene.add(mainLight)

  // --- 房间（暗色） ---
  const g = new THREE.Group()
  scene.add(g)

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.95 })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), floorMat)
  floor.rotation.x = -Math.PI / 2
  g.add(floor)

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.95, side: THREE.DoubleSide })
  const bw = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.15), wallMat); bw.position.set(0, 2, -5); g.add(bw)
  const lw = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4, 10), wallMat); lw.position.set(-4, 2, 0); g.add(lw)
  const rw = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4, 10), wallMat); rw.position.set(4, 2, 0); g.add(rw)
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), wallMat); ceil.rotation.x = Math.PI / 2; ceil.position.y = 4; g.add(ceil)

  // 桌子
  const tMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0e, roughness: 0.9 })
  const tt = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 0.7), tMat)
  tt.position.set(0, 0.78, -3); tt.castShadow = true; g.add(tt)
  const lGeo = new THREE.BoxGeometry(0.05, 0.78, 0.05)
  ;[[-0.65,-3.3],[0.65,-3.3],[-0.65,-2.7],[0.65,-2.7]].forEach(([x,z]) => {
    const l = new THREE.Mesh(lGeo, tMat); l.position.set(x, 0.39, z); g.add(l)
  })

  // 帛书
  const sMat = new THREE.MeshStandardMaterial({ color: 0xc4b090, roughness: 0.7, side: THREE.DoubleSide })
  const scrolls: THREE.Mesh[] = []
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.38), sMat)
    s.position.set(-0.4 + i * 0.16, 0.84, -3 + Math.random() * 0.15)
    s.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.1
    s.rotation.z = (Math.random() - 0.5) * 0.1
    g.add(s); scrolls.push(s)
  }

  // 毛笔
  const brush = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.2, 6), new THREE.MeshStandardMaterial({ color: 0x3a2010 }))
  brush.position.set(0.2, 0.86, -2.85); brush.rotation.z = 0.3; g.add(brush)

  // --- 暗影实体 ---
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.0 })
  const shadow = new THREE.Group()
  const shadowBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.8, 4, 8), shadowMat)
  shadowBody.position.set(0, 1.3, 0)
  shadow.add(shadowBody)
  const shadowHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), shadowMat)
  shadowHead.position.set(0, 2.5, 0)
  shadow.add(shadowHead)
  shadow.position.set(0, 0, 4.5)
  shadow.visible = false
  scene.add(shadow)

  // 撕裂纸片粒子
  const tornPieces: THREE.Mesh[] = []
  for (let i = 0; i < 25; i++) {
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(0.04 + Math.random() * 0.08, 0.03 + Math.random() * 0.06),
      sMat.clone(),
    )
    p.visible = false
    scene.add(p)
    tornPieces.push(p)
  }
  let tornTime = -1

  let chaseProgress = 0

  rm.camera.position.set(0, 1.6, -1)

  // --- 时间轴 ---
  const tl = new SimpleTimeline()
  tl.add(1.5, () => showSubtitle('你坐在桌前，铺开帛书。', 3000))
  tl.add(5.0, () => showSubtitle('写下一些字……看不清写了什么。', 3500))
  tl.add(9.0, () => { showSubtitle('帛书裂开。字迹如虫般蠕动。', 3000); tornTime = 0 })
  tl.add(13.0, () => showSubtitle('身后，有什么东西在靠近。', 3000))
  tl.add(14.0, () => { shadow.visible = true; controls.disabled = true })
  tl.add(18.0, () => showSubtitle('跑。', 2000))
  tl.add(22.0, () => transitionToScene('/pages/scene-5.html'))

  rm.onAnimate((delta, elapsed) => {
    controls.update(delta)
    tl.update(delta)
    const et = tl.getElapsed()

    // 闪烁灯光
    mainLight.intensity = 1.0 + Math.sin(elapsed * 12) * 0.3 + Math.sin(elapsed * 17) * 0.2 + Math.random() * 0.15

    // 帛书撕裂
    if (tornTime >= 0) {
      tornTime += delta
      tornPieces.forEach((p, i) => {
        if (tornTime > i * 0.08) {
          p.visible = true
          p.position.set(
            (Math.random() - 0.5) * 2 + Math.sin(tornTime * 3 + i) * 0.5,
            1 + tornTime * 0.15 + Math.sin(tornTime * 2 + i) * tornTime * 0.2,
            -3 + Math.random() * 0.4,
          )
          p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
        }
      })
    }

    // 暗影逼近
    if (shadow.visible) {
      chaseProgress += delta * 0.25
      const t = easeInOutCubic(Math.min(chaseProgress / 3, 1))
      shadow.position.z = 4.5 - t * 5.5
      shadow.position.x += Math.sin(elapsed * 2) * 0.015
      shadowMat.opacity = Math.min(0.7, 0.2 + chaseProgress * 0.15)
      // 相机后退 + 抖动
      rm.camera.position.z = -1 - chaseProgress * 0.6
      rm.camera.position.x += Math.sin(elapsed * 4) * 0.003
      rm.camera.position.y = 1.6 + Math.sin(elapsed * 5) * 0.02
      // 越来越暗
      rm.bwColorPass.uniforms['uBrightness'].value = Math.max(0.25, 0.7 - chaseProgress * 0.08)
    }
  })

  setTimeout(() => { hideLoading(); tl.start() }, 600)
  return { rendererManager: rm, controls }
}

const container = document.getElementById('scene-container')
if (container) createScene4(container)
