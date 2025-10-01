import type { ActivityContext, ActivityParam, ActivityModule } from '../types/activity'

/**
 * 가드레일 시스템 - 템플릿 격리 및 보안 강화
 * 목표: 개별 액티비티 수정 시 다른 영역에 영향 없도록 격리
 */

/**
 * DOM 접근 가드레일
 */
export class DOMGuardrail {
  private containerElement: HTMLElement
  private allowedSelectors: string[]
  private blockedMethods: string[] = [
    'appendChild',
    'removeChild', 
    'replaceChild',
    'insertBefore',
    'insertAdjacentElement'
  ]

  constructor(container: HTMLElement) {
    this.containerElement = container
    this.allowedSelectors = [
      `#${container.id}`,
      `.${Array.from(container.classList).join('.')}`,
      '[data-activity-container]'
    ]
    this.setupDOMProxy()
  }

  /**
   * DOM 접근 제한 프록시 설정
   */
  private setupDOMProxy(): void {
    // document.querySelector 오버라이드
    const originalQuerySelector = document.querySelector.bind(document)
    document.querySelector = (selector: string) => {
      if (this.isAllowedSelector(selector)) {
        return originalQuerySelector(selector)
      }
      console.warn(`🛑 DOM Guardrail: Blocked selector: ${selector}`)
      return null
    }

    // document.getElementById 오버라이드
    const originalGetElementById = document.getElementById.bind(document)
    document.getElementById = (id: string) => {
      if (this.isWithinContainer(`#${id}`)) {
        return originalGetElementById(id)
      }
      console.warn(`🛑 DOM Guardrail: Blocked getElementById: ${id}`)
      return null
    }
  }

  /**
   * 선택자가 허용된지 확인
   */
  private isAllowedSelector(selector: string): boolean {
    // 컴테이너 내부 선택자만 허용
    return this.isWithinContainer(selector)
  }

  /**
   * 컴테이너 내부 요소인지 확인
   */
  private isWithinContainer(selector: string): boolean {
    try {
      const element = this.containerElement.querySelector(selector)
      return element !== null
    } catch {
      return false
    }
  }

  /**
   * 안전한 DOM 조작 래퍼 제공
   */
  createSafeElement(tagName: string): HTMLElement {
    const allowedTags = [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'button', 'input', 'textarea', 'select', 'option', 'label',
      'img', 'video', 'audio', 'canvas', 'svg',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
      'form', 'fieldset', 'legend'
    ]

    if (!allowedTags.includes(tagName.toLowerCase())) {
      throw new Error(`🛑 DOM Guardrail: Tag '${tagName}' not allowed`)
    }

    const element = document.createElement(tagName)
    element.setAttribute('data-activity-element', 'true')
    return element
  }

  /**
   * 안전한 이벤트 리스너 추가
   */
  addSafeEventListener(
    element: HTMLElement, 
    event: string, 
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    // 이벤트 핸들러를 래핑하여 오류 방지
    const safeHandler = (e: Event) => {
      try {
        handler(e)
      } catch (error) {
        console.error(`🚨 Event handler error in activity:`, error)
        e.preventDefault()
        e.stopPropagation()
      }
    }

    element.addEventListener(event, safeHandler, options)
    
    // 정리를 위해 리스너 추적
    if (!element.dataset.eventListeners) {
      element.dataset.eventListeners = '[]'
    }
    
    const listeners = JSON.parse(element.dataset.eventListeners)
    listeners.push({ event, handler: safeHandler })
    element.dataset.eventListeners = JSON.stringify(listeners)
  }

  /**
   * 리스너 정리
   */
  cleanup(): void {
    // 모든 이벤트 리스너 제거
    const elements = this.containerElement.querySelectorAll('[data-event-listeners]')
    elements.forEach(element => {
      try {
        const listeners = JSON.parse(element.getAttribute('data-event-listeners') || '[]')
        listeners.forEach(({ event, handler }: any) => {
          element.removeEventListener(event, handler)
        })
        element.removeAttribute('data-event-listeners')
      } catch (error) {
        console.warn('Error cleaning up event listeners:', error)
      }
    })

    // 컴테이너 내용 정리
    this.containerElement.innerHTML = ''
  }
}

/**
 * 네트워크 접근 가드레일
 */
export class NetworkGuardrail {
  private allowedDomains: string[]
  private requestCount = 0
  private maxRequests: number
  private startTime = Date.now()

  constructor(allowedDomains: string[] = [], maxRequests = 50) {
    this.allowedDomains = [
      'localhost',
      '127.0.0.1',
      ...allowedDomains
    ]
    this.maxRequests = maxRequests
    this.setupNetworkProxy()
  }

  /**
   * 네트워크 요청 제한 프록시 설정
   */
  private setupNetworkProxy(): void {
    // fetch API 오버라이드
    const originalFetch = window.fetch.bind(window)
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      
      if (!this.isAllowedRequest(url)) {
        throw new Error(`🛑 Network Guardrail: Request blocked: ${url}`)
      }

      if (this.requestCount >= this.maxRequests) {
        throw new Error(`🛑 Network Guardrail: Request limit exceeded (${this.maxRequests})`)
      }

      this.requestCount++
      console.log(`🌍 Network request (${this.requestCount}/${this.maxRequests}): ${url}`)
      
      return originalFetch(input, init)
    }

    // XMLHttpRequest 오버라이드
    const originalXHR = window.XMLHttpRequest
    window.XMLHttpRequest = class extends originalXHR {
      open(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null): void {
        const urlString = url.toString()
        
        if (!this.isAllowedRequest(urlString)) {
          throw new Error(`🛑 Network Guardrail: XHR blocked: ${urlString}`)
        }

        if (this.requestCount >= this.maxRequests) {
          throw new Error(`🛑 Network Guardrail: XHR limit exceeded (${this.maxRequests})`)
        }

        this.requestCount++
        super.open(method, url, async, user, password)
      }
    } as any
  }

  /**
   * 요청 허용 여부 확인
   */
  private isAllowedRequest(url: string): boolean {
    try {
      const urlObj = new URL(url)
      
      // 로컬 요청은 항상 허용
      if (urlObj.protocol === 'file:' || urlObj.protocol === 'blob:' || urlObj.protocol === 'data:') {
        return true
      }

      // 허용된 도메인 확인
      return this.allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
      )
    } catch {
      return false
    }
  }

  /**
   * 통계 정보 제공
   */
  getStats(): { requestCount: number; maxRequests: number; timeElapsed: number } {
    return {
      requestCount: this.requestCount,
      maxRequests: this.maxRequests,
      timeElapsed: Date.now() - this.startTime
    }
  }

  /**
   * 리셋
   */
  reset(): void {
    this.requestCount = 0
    this.startTime = Date.now()
  }
}

/**
 * 리소스 사용량 가드레일
 */
export class ResourceGuardrail {
  private memoryThreshold: number
  private cpuThreshold: number
  private monitoringInterval: number
  private isMonitoring = false
  private intervalId?: number

  constructor(memoryThresholdMB = 100, cpuThreshold = 80, monitoringIntervalMs = 5000) {
    this.memoryThreshold = memoryThresholdMB * 1024 * 1024 // MB to bytes
    this.cpuThreshold = cpuThreshold
    this.monitoringInterval = monitoringIntervalMs
  }

  /**
   * 리소스 모니터링 시작
   */
  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.intervalId = window.setInterval(() => {
      this.checkResourceUsage()
    }, this.monitoringInterval)

    console.log(`📊 Resource monitoring started (memory: ${this.memoryThreshold / 1024 / 1024}MB, interval: ${this.monitoringInterval}ms)`)
  }

  /**
   * 리소스 모니터링 중지
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }

    console.log('📊 Resource monitoring stopped')
  }

  /**
   * 리소스 사용량 체크
   */
  private checkResourceUsage(): void {
    // 메모리 사용량 체크 (performance.memory API 사용 가능한 경우)
    if ('memory' in performance) {
      const memory = (performance as any).memory
      if (memory.usedJSHeapSize > this.memoryThreshold) {
        console.warn(`🚨 Memory usage high: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`)
        this.handleResourceOveruse('memory', memory.usedJSHeapSize)
      }
    }

    // CPU 사용량 추정 (간단한 방법)
    const start = performance.now()
    const iterations = 100000
    for (let i = 0; i < iterations; i++) {
      // 빈 루프
    }
    const cpuTime = performance.now() - start

    // CPU 시간이 기준값보다 클 경우 경고
    if (cpuTime > this.cpuThreshold) {
      console.warn(`🚨 High CPU usage detected: ${cpuTime.toFixed(2)}ms for ${iterations} iterations`)
      this.handleResourceOveruse('cpu', cpuTime)
    }
  }

  /**
   * 리소스 과사용 처리
   */
  private handleResourceOveruse(type: 'memory' | 'cpu', value: number): void {
    const event = new CustomEvent('resourceOveruse', {
      detail: { type, value, threshold: type === 'memory' ? this.memoryThreshold : this.cpuThreshold }
    })
    
    window.dispatchEvent(event)
    
    // 자동 정리 시도
    if (type === 'memory') {
      this.forceGarbageCollection()
    }
  }

  /**
   * 강제 가비지 컴렉션
   */
  private forceGarbageCollection(): void {
    // 브라우저에서 가능한 경우 GC 호출
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
      console.log('🗑️ Garbage collection triggered')
    }
  }

  /**
   * 현재 리소스 사용량 조회
   */
  getCurrentUsage(): any {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
        jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
        usagePercent: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
      }
    }
    return null
  }
}

/**
 * 이벤트 버스 가드레일
 */
export class EventBusGuardrail {
  private eventCounts = new Map<string, number>()
  private maxEventsPerType = 100
  private timeWindow = 60000 // 1 minute
  private eventHistory: { type: string; timestamp: number }[] = []

  constructor(maxEventsPerType = 100, timeWindowMs = 60000) {
    this.maxEventsPerType = maxEventsPerType
    this.timeWindow = timeWindowMs
  }

  /**
   * 이벤트 제한 검증
   */
  checkEventLimit(eventType: string): boolean {
    const now = Date.now()
    
    // 오래된 이벤트 정리
    this.eventHistory = this.eventHistory.filter(event => 
      now - event.timestamp < this.timeWindow
    )

    // 해당 타입의 이벤트 수 세기
    const typeCount = this.eventHistory.filter(event => event.type === eventType).length

    if (typeCount >= this.maxEventsPerType) {
      console.warn(`🚨 Event limit exceeded for type: ${eventType} (${typeCount}/${this.maxEventsPerType})`)
      return false
    }

    // 이벤트 기록
    this.eventHistory.push({ type: eventType, timestamp: now })
    return true
  }

  /**
   * 이벤트 통계 조회
   */
  getEventStats(): { [eventType: string]: number } {
    const stats: { [eventType: string]: number } = {}
    
    this.eventHistory.forEach(event => {
      stats[event.type] = (stats[event.type] || 0) + 1
    })

    return stats
  }

  /**
   * 리셋
   */
  reset(): void {
    this.eventHistory = []
    this.eventCounts.clear()
  }
}

/**
 * 통합 가드레일 관리자
 */
export class GuardrailManager {
  private domGuardrail: DOMGuardrail
  private networkGuardrail: NetworkGuardrail
  private resourceGuardrail: ResourceGuardrail
  private eventBusGuardrail: EventBusGuardrail
  private isActive = false

  constructor(container: HTMLElement, options: {
    allowedDomains?: string[]
    maxNetworkRequests?: number
    memoryThresholdMB?: number
    maxEventsPerType?: number
  } = {}) {
    this.domGuardrail = new DOMGuardrail(container)
    this.networkGuardrail = new NetworkGuardrail(
      options.allowedDomains,
      options.maxNetworkRequests
    )
    this.resourceGuardrail = new ResourceGuardrail(
      options.memoryThresholdMB
    )
    this.eventBusGuardrail = new EventBusGuardrail(
      options.maxEventsPerType
    )
  }

  /**
   * 가드레일 활성화
   */
  activate(): void {
    if (this.isActive) return

    this.isActive = true
    this.resourceGuardrail.startMonitoring()

    console.log('🛑 Guardrails activated')
  }

  /**
   * 가드레일 비활성화
   */
  deactivate(): void {
    if (!this.isActive) return

    this.isActive = false
    this.resourceGuardrail.stopMonitoring()

    console.log('🛑 Guardrails deactivated')
  }

  /**
   * 이벤트 제한 검증
   */
  checkEventLimit(eventType: string): boolean {
    return this.eventBusGuardrail.checkEventLimit(eventType)
  }

  /**
   * 안전한 DOM 요소 생성
   */
  createElement(tagName: string): HTMLElement {
    return this.domGuardrail.createSafeElement(tagName)
  }

  /**
   * 안전한 이벤트 리스너 추가
   */
  addEventListener(
    element: HTMLElement,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    this.domGuardrail.addSafeEventListener(element, event, handler, options)
  }

  /**
   * 전체 통계 조회
   */
  getStats(): any {
    return {
      network: this.networkGuardrail.getStats(),
      resources: this.resourceGuardrail.getCurrentUsage(),
      events: this.eventBusGuardrail.getEventStats(),
      isActive: this.isActive
    }
  }

  /**
   * 전체 정리
   */
  cleanup(): void {
    this.deactivate()
    this.domGuardrail.cleanup()
    this.networkGuardrail.reset()
    this.eventBusGuardrail.reset()
  }
}