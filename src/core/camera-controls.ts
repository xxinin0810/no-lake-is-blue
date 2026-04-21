import * as THREE from 'three'

/**
 * 桌面端第一人称相机控制（PointerLock + WASD）
 */
export class FPSCameraControls {
  camera: THREE.PerspectiveCamera
  domElement: HTMLElement

  private isLocked = false
  private moveForward = false
  private moveBackward = false
  private moveLeft = false
  private moveRight = false

  private euler = new THREE.Euler(0, 0, 0, 'YXZ')
  private velocity = new THREE.Vector3()
  private direction = new THREE.Vector3()
  private speed = 2.5

  // 禁用状态（过场动画时暂停用户控制）
  private _disabled = false

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera
    this.domElement = domElement
    this.euler.setFromQuaternion(camera.quaternion)

    domElement.addEventListener('click', () => {
      if (!this._disabled) domElement.requestPointerLock()
    })

    document.addEventListener('pointerlockchange', this._onPointerLockChange)
    document.addEventListener('mousemove', this._onMouseMove)
    document.addEventListener('keydown', this._onKeyDown)
    document.addEventListener('keyup', this._onKeyUp)
  }

  get disabled() { return this._disabled }
  set disabled(v: boolean) {
    this._disabled = v
    if (v && document.pointerLockElement) {
      document.exitPointerLock()
    }
  }

  private _onPointerLockChange = () => {
    this.isLocked = document.pointerLockElement === this.domElement
  }

  private _onMouseMove = (e: MouseEvent) => {
    if (!this.isLocked || this._disabled) return
    const sensitivity = 0.002
    this.euler.setFromQuaternion(this.camera.quaternion)
    this.euler.y -= e.movementX * sensitivity
    this.euler.x -= e.movementY * sensitivity
    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x))
    this.camera.quaternion.setFromEuler(this.euler)
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.moveForward  = true; break
      case 'KeyS': case 'ArrowDown':  this.moveBackward = true; break
      case 'KeyA': case 'ArrowLeft':  this.moveLeft     = true; break
      case 'KeyD': case 'ArrowRight': this.moveRight    = true; break
    }
  }

  private _onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.moveForward  = false; break
      case 'KeyS': case 'ArrowDown':  this.moveBackward = false; break
      case 'KeyA': case 'ArrowLeft':  this.moveLeft     = false; break
      case 'KeyD': case 'ArrowRight': this.moveRight    = false; break
    }
  }

  update(delta: number) {
    if (!this.isLocked || this._disabled) return

    // 阻尼
    this.velocity.x -= this.velocity.x * 8.0 * delta
    this.velocity.z -= this.velocity.z * 8.0 * delta

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward)
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft)
    this.direction.normalize()

    if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.speed * delta
    if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.speed * delta

    // 沿相机朝向移动
    const forward = new THREE.Vector3()
    this.camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    this.camera.position.addScaledVector(forward, -this.velocity.z)
    this.camera.position.addScaledVector(right, -this.velocity.x)
  }

  dispose() {
    document.removeEventListener('pointerlockchange', this._onPointerLockChange)
    document.removeEventListener('mousemove', this._onMouseMove)
    document.removeEventListener('keydown', this._onKeyDown)
    document.removeEventListener('keyup', this._onKeyUp)
  }
}
