import type { 
  ActivitySandbox, 
  ActivityModule, 
  ActivityParam, 
  ActivityContext,
  ActivityManifest
} from '../types/activity'
import { GuardrailManager } from './guardrails'
import { CoreTemplateRegistry } from './template-registry'

/**
 * 강화된 샌드박스 관리자
 * - 완전한 격리 환경
 * - 가드레일 시스템 통합
 * - 동적 템플릿 로딩
 * - 오류 격리 및 복구
 */
export class EnhancedSandboxManager {
  private templateRegistry: CoreTemplateRegistry
  private activeModules = new Map<string, {
    module: ActivityModule
    guardrailManager: GuardrailManager
    container: HTMLElement
    context: ActivityContext
  }>()
  
  private globalCSPApplied = false

  constructor() {
    this.templateRegistry = new CoreTemplateRegistry()
    this.setupGlobalSecurity()
  }

  /**
   * 전역 보안 설정
   */
  private setupGlobalSecurity(): void {
    if (this.globalCSPApplied) return

    // Content Security Policy 설정
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net unpkg.com cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net unpkg.com cdnjs.cloudflare.com fonts.googleapis.com",
      "img-src 'self' data: blob: cdn.jsdelivr.net unpkg.com",
      "font-src 'self' fonts.googleapis.com fonts.gstatic.com",
      "media-src 'self' data: blob:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
    
    document.head.appendChild(meta)
    this.globalCSPApplied = true

    // 전역 오류 처리
    window.addEventListener('error', (event) => {
      console.error('🚨 Global error in sandbox:', event.error)
      this.handleGlobalError(event.error)
    })

    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection in sandbox:', event.reason)
      this.handleGlobalError(event.reason)
    })
  }

  /**
   * 전역 오류 처리
   */
  private handleGlobalError(error: Error): void {
    // 사용자에게 오류 메시지 표시
    const errorNotification = document.createElement('div')
    errorNotification.className = 'sandbox-error-notification'
    errorNotification.innerHTML = `
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-message">
          <div class="error-title">액티비티 오류 발생</div>
          <div class="error-description">액티비티에서 예상치 못한 오류가 발생했습니다.</div>
        </div>
        <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `
    errorNotification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 400px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    `

    document.body.appendChild(errorNotification)

    // 5초 후 자동 제거
    setTimeout(() => {
      if (errorNotification.parentElement) {
        errorNotification.remove()
      }
    }, 5000)
  }

  /**
   * 격리된 컴테이너 생성
   */
  private createIsolatedContainer(
    parentContainer: HTMLElement, 
    activityId: string
  ): HTMLElement {
    // 기존 컴테이너 정리
    parentContainer.innerHTML = ''
    
    // 격리된 컴테이너 생성
    const isolatedContainer = document.createElement('div')
    isolatedContainer.id = `activity-container-${activityId}`
    isolatedContainer.className = 'activity-sandbox-container'
    isolatedContainer.setAttribute('data-activity-id', activityId)
    isolatedContainer.setAttribute('data-sandbox-version', '2.0')
    
    // CSS 격리 설정
    isolatedContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      isolation: isolate;
      contain: layout style paint;
      background: var(--activity-bg, #1e293b);
      border-radius: 8px;
      border: 1px solid var(--activity-border, #334155);
    `

    // 오류 경계 (Error Boundary) 설정
    const errorBoundary = document.createElement('div')
    errorBoundary.className = 'activity-error-boundary'
    errorBoundary.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.95);
      z-index: 1000;
    `
    errorBoundary.innerHTML = `
      <div class="error-state" style="
        text-align: center;
        padding: 2rem;
        background: #dc2626;
        color: white;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.4);
        max-width: 400px;
        margin: 0 auto;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🚨</div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem;">액티비티 오류</h3>
        <p style="margin: 0 0 1.5rem 0; color: #fecaca;">이 액티비티에서 문제가 발생했습니다.</p>
        <button onclick="location.reload()" style="
          background: white;
          color: #dc2626;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        ">새로고침</button>
      </div>
    `

    isolatedContainer.appendChild(errorBoundary)
    parentContainer.appendChild(isolatedContainer)

    return isolatedContainer
  }

  /**
   * 안전한 컨텍스트 생성
   */
  private createSecureContext(
    container: HTMLElement,
    baseContext: ActivityContext,
    guardrailManager: GuardrailManager
  ): ActivityContext {
    // 샌드박스 API 생성
    const sandbox: ActivitySandbox = {
      createElement: (tagName: string) => guardrailManager.createElement(tagName),
      querySelector: (selector: string) => {
        try {
          return container.querySelector(selector)
        } catch (error) {
          console.warn('🛑 Unsafe selector blocked:', selector)
          return null
        }
      },
      allowedDomains: ['cdn.jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com'],
      maxStorageSize: 1024 * 1024 // 1MB
    }

    // 이벤트 버스 래핑
    const secureEventBus = {
      emit: (event: any) => {
        if (guardrailManager.checkEventLimit(event.type)) {
          baseContext.eventBus.emit(event)
        }
      },
      on: baseContext.eventBus.on.bind(baseContext.eventBus),
      off: baseContext.eventBus.off.bind(baseContext.eventBus)
    }

    return {
      ...baseContext,
      eventBus: secureEventBus,
      sandbox
    }
  }

  /**
   * 템플릿 실행 (강화된 샌드박스)
   */
  async executeTemplate(
    templateId: string,
    parentContainer: HTMLElement,
    params: ActivityParam,
    baseContext: ActivityContext
  ): Promise<ActivityModule> {
    const activityId = baseContext.activityId
    
    try {
      // 1. 검증된 템플릿 로드
      console.log(`🚀 Loading template: ${templateId} for activity: ${activityId}`)
      const module = await this.templateRegistry.loadModule(templateId)
      
      // 2. 격리된 컴테이너 생성
      const container = this.createIsolatedContainer(parentContainer, activityId)
      
      // 3. 가드레일 설정
      const guardrailManager = new GuardrailManager(container, {
        allowedDomains: module.manifest.security.allowedDomains,
        maxNetworkRequests: module.manifest.security.maxApiCalls,
        memoryThresholdMB: module.manifest.performance.maxMemoryMB,
        maxEventsPerType: 50
      })
      
      guardrailManager.activate()
      
      // 4. 보안 컨텍스트 생성
      const secureContext = this.createSecureContext(container, baseContext, guardrailManager)
      
      // 5. 파라미터 검증
      await this.validateParameters(params, module.manifest)
      
      // 6. 템플릿 마운트 (오류 경계로 감싸기)
      await this.safeMount(module, container, params, secureContext, activityId)
      
      // 7. 성공시 등록
      this.activeModules.set(activityId, {
        module,
        guardrailManager,
        container,
        context: secureContext
      })
      
      console.log(`✅ Template executed successfully: ${templateId} -> ${activityId}`)
      return module
      
    } catch (error) {
      console.error(`❌ Template execution failed: ${templateId}`, error)
      this.showErrorState(parentContainer, templateId, error)
      throw error
    }
  }

  /**
   * 안전한 마운트 (오류 경계 적용)
   */
  private async safeMount(
    module: ActivityModule,
    container: HTMLElement,
    params: ActivityParam,
    context: ActivityContext,
    activityId: string
  ): Promise<void> {
    const errorBoundary = container.querySelector('.activity-error-boundary') as HTMLElement
    
    try {
      // preload 실행
      if (module.preload) {
        await Promise.race([
          module.preload(params),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Preload timeout')), 10000)
          )
        ])
      }
      
      // mount 실행
      await Promise.race([
        module.mount(container, params, context),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Mount timeout')), 15000)
        )
      ])
      
      // 성공시 오류 경계 비활성화
      errorBoundary.style.display = 'none'
      
    } catch (error) {
      console.error(`Mount failed for activity ${activityId}:`, error)
      
      // 오류 상태 표시
      errorBoundary.style.display = 'flex'
      const errorMessage = errorBoundary.querySelector('.error-state p')
      if (errorMessage) {
        errorMessage.textContent = error.message || '알 수 없는 오류가 발생했습니다.'
      }
      
      throw error
    }
  }

  /**
   * 파라미터 검증
   */
  private async validateParameters(
    params: ActivityParam, 
    manifest: ActivityManifest
  ): Promise<void> {
    const schema = manifest.paramsSchema
    
    // 필수 필드 검증
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in params)) {
          throw new Error(`Required parameter missing: ${field}`)
        }
      }
    }

    // 타입 검증
    if (schema.properties) {
      for (const [key, value] of Object.entries(params)) {
        const propSchema = (schema.properties as any)[key]
        if (propSchema) {
          const actualType = Array.isArray(value) ? 'array' : typeof value
          if (propSchema.type && actualType !== propSchema.type) {
            throw new Error(`Parameter ${key} type mismatch: expected ${propSchema.type}, got ${actualType}`)
          }
          
          // 추가 검증 (문자열 길이, 숫자 범위 등)
          if (propSchema.minLength && typeof value === 'string' && value.length < propSchema.minLength) {
            throw new Error(`Parameter ${key} too short: minimum ${propSchema.minLength}`)
          }
          
          if (propSchema.minimum && typeof value === 'number' && value < propSchema.minimum) {
            throw new Error(`Parameter ${key} too small: minimum ${propSchema.minimum}`)
          }
        }
      }
    }
  }

  /**
   * 오류 상태 표시
   */
  private showErrorState(container: HTMLElement, templateId: string, error: Error): void {
    container.innerHTML = `
      <div class="sandbox-error-state" style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border-radius: 8px;
        border: 1px solid #334155;
      ">
        <div class="error-content" style="
          text-align: center;
          padding: 2rem;
          max-width: 400px;
        ">
          <div style="
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.7;
          ">🚨</div>
          <h3 style="
            color: #ef4444;
            margin: 0 0 0.5rem 0;
            font-size: 1.25rem;
          ">템플릿 로드 실패</h3>
          <p style="
            color: #94a3b8;
            margin: 0 0 0.5rem 0;
            font-size: 0.875rem;
          ">${templateId}</p>
          <p style="
            color: #f87171;
            margin: 0 0 1.5rem 0;
            font-size: 0.75rem;
            font-family: monospace;
            background: rgba(239, 68, 68, 0.1);
            padding: 0.5rem;
            border-radius: 4px;
            border-left: 3px solid #ef4444;
          ">${error.message}</p>
          <button onclick="location.reload()" style="
            background: #ef4444;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          " onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
            새로고침
          </button>
        </div>
      </div>
    `
  }

  /**
   * 템플릿 등록
   */
  async registerTemplate(templateInfo: any): Promise<void> {
    return this.templateRegistry.register(templateInfo)
  }

  /**
   * 템플릿 목록 조회
   */
  async getTemplates(category?: string): Promise<any[]> {
    return this.templateRegistry.list(category)
  }

  /**
   * 활성 모듈 언마운트
   */
  async unmountActivity(activityId: string): Promise<void> {
    const activeModule = this.activeModules.get(activityId)
    if (!activeModule) {
      console.warn(`Activity not found: ${activityId}`)
      return
    }

    try {
      // 1. 모듈 언마운트
      await activeModule.module.unmount()
      
      // 2. 가드레일 정리
      activeModule.guardrailManager.cleanup()
      
      // 3. 컴테이너 정리
      activeModule.container.innerHTML = ''
      
      // 4. 등록 해제
      this.activeModules.delete(activityId)
      
      console.log(`🗑️ Activity unmounted: ${activityId}`)
      
    } catch (error) {
      console.error(`Error unmounting activity ${activityId}:`, error)
      // 오류가 있어도 정리 계속
      this.activeModules.delete(activityId)
    }
  }

  /**
   * 모든 모듈 언마운트
   */
  async unmountAll(): Promise<void> {
    const promises = Array.from(this.activeModules.keys()).map(activityId => 
      this.unmountActivity(activityId)
    )
    
    await Promise.all(promises)
  }

  /**
   * 상태 정보 조회
   */
  getStats(): any {
    const activeStats = Array.from(this.activeModules.entries()).map(([id, info]) => ({
      activityId: id,
      templateId: info.module.manifest.id,
      guardrails: info.guardrailManager.getStats()
    }))

    return {
      activeModules: this.activeModules.size,
      registryStats: this.templateRegistry.getStats(),
      activeActivities: activeStats
    }
  }

  /**
   * 전체 정리
   */
  async cleanup(): Promise<void> {
    await this.unmountAll()
    await this.templateRegistry.cleanup()
    
    console.log('🗑️ Enhanced sandbox manager cleanup completed')
  }
}