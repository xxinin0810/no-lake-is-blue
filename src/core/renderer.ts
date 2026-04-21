import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { bwColorShader } from './postprocessing'

export interface RendererOptions {
  container: HTMLElement
  antialias?: boolean
  xrEnabled?: boolean
  bgColor?: number
}

export class RendererManager {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  composer: EffectComposer
  bwColorPass: ShaderPass
  clock: THREE.Clock

  constructor(options: RendererOptions) {
    const {
      container,
      antialias = true,
      xrEnabled = true,
      bgColor = 0x0a0a0a,
    } = options

    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(bgColor)
    this.scene.fog = new THREE.FogExp2(bgColor, 0.04)

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    )
    this.camera.position.set(0, 1.6, 3)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    container.appendChild(this.renderer.domElement)

    // WebXR
    if (xrEnabled) {
      this.renderer.xr.enabled = true
      try {
        const vrButton = VRButton.createButton(this.renderer)
        vrButton.style.position = 'fixed'
        vrButton.style.bottom = '1.5rem'
        vrButton.style.right = '1.5rem'
        vrButton.style.zIndex = '999'
        container.appendChild(vrButton)
      } catch {
        // WebXR not supported, silently skip
      }
    }

    // Postprocessing
    this.composer = new EffectComposer(this.renderer)
    const renderPass = new RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass)

    this.bwColorPass = new ShaderPass(bwColorShader)
    this.composer.addPass(this.bwColorPass)

    const outputPass = new OutputPass()
    this.composer.addPass(outputPass)

    // Clock
    this.clock = new THREE.Clock()

    // Resize handler
    window.addEventListener('resize', this._onResize)
  }

  private _onResize = () => {
    const container = this.renderer.domElement.parentElement
    if (!container) return
    const w = container.clientWidth
    const h = container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.composer.setSize(w, h)
  }

  /** Start animation loop. VR模式下直接渲染，桌面模式使用后处理管线。 */
  onAnimate(callback: (delta: number, elapsed: number) => void) {
    this.renderer.setAnimationLoop(() => {
      const delta = this.clock.getDelta()
      const elapsed = this.clock.getElapsedTime()
      callback(delta, elapsed)
      if (this.renderer.xr.isPresenting) {
        this.renderer.render(this.scene, this.camera)
      } else {
        this.composer.render()
      }
    })
  }

  dispose() {
    this.renderer.setAnimationLoop(null)
    this.renderer.dispose()
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose()
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => m?.dispose())
      }
    })
    window.removeEventListener('resize', this._onResize)
  }
}
