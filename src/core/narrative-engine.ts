/**
 * 叙事引擎：基于时间轴的事件驱动系统
 * 解析 JSON 配置，在指定时间触发字幕/相机动画/特效/音效
 */
import * as THREE from 'three'

export type TimelineEventType = 'subtitle' | 'camera-move' | 'shader' | 'sound' | 'animation' | 'transition'

export interface TimelineEvent {
  time: number           // 相对场景开始的秒数
  type: TimelineEventType
  data: Record<string, unknown>
  fired?: boolean        // 运行时标记
}

export interface SceneConfig {
  sceneId: string
  background?: { color: string; fog?: { color: string; near: number; far: number } }
  camera?: { startPosition: [number, number, number]; startLookAt: [number, number, number] }
  timeline: TimelineEvent[]
  nextScene?: string
}

export class NarrativeEngine {
  private config: SceneConfig
  private elapsed = 0
  private running = false
  private callbacks: Map<string, Array<(data: Record<string, unknown>) => void>> = new Map()

  // 字幕系统引用
  private subtitleOverlay: HTMLElement | null = null
  private subtitleText: HTMLElement | null = null

  constructor(config: SceneConfig) {
    this.config = config
    // 排序时间轴事件
    this.config.timeline.sort((a, b) => a.time - b.time)
  }

  /** 初始化 DOM 引用 */
  init() {
    this.subtitleOverlay = document.getElementById('subtitle-overlay')
    this.subtitleText = document.getElementById('subtitle-text')
  }

  /** 注册事件回调 */
  on(type: string, callback: (data: Record<string, unknown>) => void) {
    if (!this.callbacks.has(type)) this.callbacks.set(type, [])
    this.callbacks.get(type)!.push(callback)
  }

  /** 启动时间轴 */
  start() {
    this.running = true
    this.elapsed = 0
    // 重置 fired 标记
    this.config.timeline.forEach(e => e.fired = false)
  }

  /** 暂停 */
  pause() { this.running = false }
  resume() { this.running = true }

  /** 每帧调用 */
  update(delta: number) {
    if (!this.running) return
    this.elapsed += delta

    for (const event of this.config.timeline) {
      if (event.fired) continue
      if (this.elapsed >= event.time) {
        event.fired = true
        this.fireEvent(event.type, event.data)
      }
    }
  }

  private fireEvent(type: string, data: Record<string, unknown>) {
    // 内置处理字幕
    if (type === 'subtitle') {
      this.showSubtitle(data.text as string, data.duration as number)
    }

    // 通知外部监听器
    const cbs = this.callbacks.get(type)
    if (cbs) cbs.forEach(cb => cb(data))
  }

  private showSubtitle(text: string, duration = 3000) {
    if (!this.subtitleOverlay || !this.subtitleText) return
    this.subtitleText.textContent = text
    this.subtitleOverlay.style.opacity = '1'
    setTimeout(() => {
      this.subtitleOverlay.style.opacity = '0'
    }, duration)
  }

  getElapsed() { return this.elapsed }

  /** 检查时间轴是否全部完成 */
  isComplete() {
    return this.config.timeline.length > 0 && this.config.timeline.every(e => e.fired)
  }
}
