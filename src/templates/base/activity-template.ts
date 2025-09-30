import type { 
  ActivityModule, 
  ActivityManifest, 
  ActivityParam, 
  ActivityContext,
  ActivityResult,
  ActivityStatus,
  ActivityEvent
} from '../../types/activity'

/**
 * 액티비티 템플릿 기본 추상 클래스
 * 모든 새로운 템플릿은 이 클래스를 상속받아 구현해야 함
 */
export abstract class BaseActivityTemplate implements ActivityModule {
  abstract manifest: ActivityManifest
  
  protected container: HTMLElement | null = null
  protected params: ActivityParam = {}
  protected context: ActivityContext | null = null
  protected status: ActivityStatus = {
    state: 'idle',
    progress: 0,
    timeSpent: 0,
    interactions: 0,
    errors: 0
  }
  
  private startTime: number = 0
  private eventLog: ActivityEvent[] = []

  // 필수 구현 메서드
  abstract async mount(
    container: HTMLElement, 
    params: ActivityParam, 
    context: ActivityContext
  ): Promise<void>

  abstract async unmount(): Promise<void>
  abstract async getResult(): Promise<ActivityResult>

  // 공통 라이프사이클 메서드
  async preload?(params: ActivityParam): Promise<void> {
    // 기본 구현: 아무것도 하지 않음
    this.log('preload', { params })
  }

  // 선택적 구현 메서드
  async showHint?(level: number): Promise<void> {
    this.log('hint-requested', { level })
    // 기본 힌트 표시 로직
    this.showMessage(`힌트 ${level}: 다시 한 번 시도해보세요.`, 'info')
  }

  async restart?(): Promise<void> {
    this.log('restart')
    this.status.progress = 0
    this.status.interactions = 0
    this.status.errors = 0
    this.startTime = Date.now()
    
    if (this.container && this.params && this.context) {
      await this.unmount()
      await this.mount(this.container, this.params, this.context)
    }
  }

  async pause?(): Promise<void> {
    this.log('pause')
    this.status.state = 'paused'
    this.addClass('paused')
  }

  async resume?(): Promise<void> {
    this.log('resume')
    this.status.state = 'active'
    this.removeClass('paused')
  }

  getStatus?(): ActivityStatus {
    return {
      ...this.status,
      timeSpent: Date.now() - this.startTime
    }
  }

  // 보호된 유틸리티 메서드들
  protected initialize(
    container: HTMLElement, 
    params: ActivityParam, 
    context: ActivityContext
  ): void {
    this.container = container
    this.params = params
    this.context = context
    this.startTime = Date.now()
    this.status.state = 'loading'
    
    this.setupContainer()
    this.validateParams()
    this.log('initialized')
  }

  protected finalize(): void {
    this.status.state = 'completed'
    this.log('completed')
    this.context?.eventBus.emit({
      type: 'COMPLETE',
      timestamp: Date.now(),
      activityId: this.context?.activityId || '',
      payload: { status: this.status }
    })
  }

  // 컨테이너 설정
  private setupContainer(): void {
    if (!this.container) return
    
    this.container.className = `activity-template ${this.manifest.id.replace(/[@\.]/g, '-')}`
    this.container.setAttribute('data-template', this.manifest.id)
    this.container.setAttribute('data-version', this.manifest.version)
    this.container.tabIndex = 0 // 키보드 접근성
  }

  // 파라미터 검증
  protected validateParams(): void {
    const schema = this.manifest.paramsSchema
    if (!schema || !schema.required) return

    const required = schema.required as string[]
    for (const field of required) {
      if (!(field in this.params)) {
        throw new Error(`Required parameter missing: ${field}`)
      }
    }
  }

  // DOM 조작 유틸리티
  protected createElement(tag: string, className?: string, content?: string): HTMLElement {
    const element = document.createElement(tag)
    if (className) element.className = className
    if (content) element.textContent = content
    return element
  }

  protected querySelector(selector: string): Element | null {
    return this.container?.querySelector(selector) || null
  }

  protected querySelectorAll(selector: string): NodeListOf<Element> | [] {
    return this.container?.querySelectorAll(selector) || []
  }

  // CSS 클래스 조작
  protected addClass(className: string): void {
    this.container?.classList.add(className)
  }

  protected removeClass(className: string): void {
    this.container?.classList.remove(className)
  }

  protected toggleClass(className: string): void {
    this.container?.classList.toggle(className)
  }

  // 이벤트 처리
  protected log(type: string, payload?: any): void {
    const event: ActivityEvent = {
      type: type as any,
      timestamp: Date.now(),
      activityId: this.context?.activityId || '',
      payload
    }
    
    this.eventLog.push(event)
    this.context?.eventBus.emit(event)
  }

  protected updateProgress(progress: number): void {
    this.status.progress = Math.max(0, Math.min(1, progress))
    this.log('PROGRESS', { progress: this.status.progress })
  }

  protected incrementInteractions(): void {
    this.status.interactions++
  }

  protected incrementErrors(): void {
    this.status.errors++
    this.log('ERROR', { errorCount: this.status.errors })
  }

  // UI 피드백
  protected showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const messageEl = this.createElement('div', `message message-${type}`, message)
    messageEl.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      background: var(--${type}-bg, #333);
      color: var(--${type}-text, #fff);
      border: 1px solid var(--${type}-border, #555);
      z-index: 1000;
      animation: slideInRight 0.3s ease;
    `
    
    this.container?.appendChild(messageEl)
    
    setTimeout(() => {
      messageEl.remove()
    }, 3000)
  }

  // 오디오 재생
  protected async playAudio(id: string): Promise<void> {
    try {
      await this.context?.audio.play(id)
    } catch (error) {
      console.warn('Audio play failed:', error)
    }
  }

  // 스토리지 접근
  protected async saveState(key: string, value: any): Promise<void> {
    const storageKey = `activity-${this.context?.activityId}-${key}`
    await this.context?.storage.set(storageKey, value)
  }

  protected async loadState(key: string): Promise<any> {
    const storageKey = `activity-${this.context?.activityId}-${key}`
    return await this.context?.storage.get(storageKey)
  }

  // 접근성 지원
  protected announceToScreenReader(message: string): void {
    const announcement = this.createElement('div', 'sr-only')
    announcement.textContent = message
    announcement.setAttribute('aria-live', 'polite')
    announcement.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `
    
    this.container?.appendChild(announcement)
    
    setTimeout(() => {
      announcement.remove()
    }, 1000)
  }

  // 키보드 네비게이션 지원
  protected setupKeyboardNavigation(elements: Element[]): void {
    elements.forEach((element, index) => {
      element.setAttribute('tabindex', '0')
      element.addEventListener('keydown', (event) => {
        const e = event as KeyboardEvent
        
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault()
            const nextIndex = (index + 1) % elements.length
            ;(elements[nextIndex] as HTMLElement).focus()
            break
            
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault()
            const prevIndex = (index - 1 + elements.length) % elements.length
            ;(elements[prevIndex] as HTMLElement).focus()
            break
            
          case 'Enter':
          case ' ':
            e.preventDefault()
            ;(element as HTMLElement).click()
            break
        }
      })
    })
  }

  // 반응형 디자인 지원
  protected setupResponsiveLayout(): void {
    if (!this.container) return
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        
        this.container?.classList.toggle('mobile', width < 768)
        this.container?.classList.toggle('tablet', width >= 768 && width < 1024)
        this.container?.classList.toggle('desktop', width >= 1024)
      }
    })
    
    observer.observe(this.container)
  }

  // 정리 시 observer 해제를 위한 메서드
  protected cleanup(): void {
    // 하위 클래스에서 오버라이드하여 추가 정리 작업 수행
    this.eventLog = []
    this.container = null
    this.params = {}
    this.context = null
  }
}