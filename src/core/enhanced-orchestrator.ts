import type { 
  LessonConfig, 
  ActivityStep, 
  ActivityResult, 
  ActivityContext,
  ActivityModule,
  ActivityEvent,
  ActivityStatus
} from '../types/activity'
import { CoreEventBus } from './event-bus'
import { CoreStorage } from './storage'
import { EnhancedSandboxManager } from './enhanced-sandbox'

export interface LessonState {
  config: LessonConfig | null
  currentIndex: number
  results: (ActivityResult | null)[]
  startTime: number
  endTime?: number
  status: 'idle' | 'loading' | 'active' | 'paused' | 'completed' | 'error'
}

export interface OrchestratorOptions {
  container: HTMLElement
  userId: string
  locale?: string
  theme?: Record<string, string>
  debug?: boolean
}

/**
 * 강화된 레슨 오케스트레이터
 * - 모듈화된 샌드박스 시스템
 * - 가드레일 통합
 * - 오류 격리 및 복구
 * - 동적 템플릿 관리
 */
export class EnhancedLessonOrchestrator {
  private state: LessonState = {
    config: null,
    currentIndex: 0,
    results: [],
    startTime: 0,
    status: 'idle'
  }

  private eventBus: CoreEventBus
  private storage: CoreStorage
  private sandbox: EnhancedSandboxManager
  private container: HTMLElement
  private currentModule: ActivityModule | null = null
  
  private options: Required<OrchestratorOptions>
  private errorRecoveryAttempts = 0
  private maxErrorRecoveryAttempts = 3

  constructor(options: OrchestratorOptions) {
    this.options = {
      locale: 'ko',
      theme: this.getDefaultTheme(),
      debug: false,
      ...options
    }

    this.container = options.container
    this.eventBus = new CoreEventBus()
    this.storage = new CoreStorage(`lesson-${this.options.userId}:`)
    this.sandbox = new EnhancedSandboxManager()

    // 글로벌 이벤트 리스너 등록
    this.setupEventListeners()

    // 디버깅 모드
    if (this.options.debug) {
      this.eventBus.enableDebugLogging()
      console.log('🔍 Enhanced Orchestrator initialized in debug mode')
    }

    console.log('🎼 Enhanced Lesson Orchestrator v2.0 initialized')
  }

  /**
   * 기본 테마 설정
   */
  private getDefaultTheme(): Record<string, string> {
    return {
      '--primary-blue': '#3b82f6',
      '--primary-dark': '#1e40af',
      '--success-green': '#22c55e',
      '--error-red': '#ef4444',
      '--warning-yellow': '#f59e0b',
      '--bg-primary': '#0f172a',
      '--bg-secondary': '#1e293b',
      '--text-primary': '#e6edf7',
      '--text-secondary': '#94a3b8',
      '--activity-bg': '#1e293b',
      '--activity-border': '#334155'
    }
  }

  /**
   * 이벤트 리스너 설정
   */
  private setupEventListeners(): void {
    // 활동 완료 이벤트 감지
    this.eventBus.on('COMPLETE', async (event) => {
      if (event.activityId === this.getCurrentActivityId()) {
        console.log(`✅ Activity completed: ${event.activityId}`)
        await this.handleActivityComplete()
      }
    })

    // 오류 이벤트 감지 및 복구
    this.eventBus.on('ERROR', async (event) => {
      console.error(`🚨 Activity error: ${event.activityId}`, event.payload)
      await this.handleActivityError(event)
    })

    // 진행률 이벤트 감지
    this.eventBus.on('PROGRESS', (event) => {
      this.emitLessonEvent('progress', {
        activityId: event.activityId,
        lessonProgress: this.getLessonProgress(),
        activityProgress: event.payload?.progress || 0
      })
    })

    // 시작 이벤트
    this.eventBus.on('START', (event) => {
      console.log(`🏁 Activity started: ${event.activityId}`)
      this.emitLessonEvent('activity-started', {
        activityId: event.activityId,
        timestamp: event.timestamp
      })
    })

    // 전역 오류 처리
    window.addEventListener('error', (event) => {
      console.error('🚨 Global error in lesson:', event.error)
      this.handleGlobalError(event.error)
    })

    // 리소스 과사용 감지
    window.addEventListener('resourceOveruse', (event: any) => {
      console.warn(`⚠️ Resource overuse detected: ${event.detail.type}`, event.detail)
      this.handleResourceOveruse(event.detail)
    })
  }

  /**
   * 레슨 로드 (강화된 버전)
   */
  async loadLesson(config: LessonConfig): Promise<void> {
    try {
      this.setState({ status: 'loading' })
      
      // 1. 레슨 검증
      await this.validateLesson(config)
      
      // 2. 이전 레슨 정리
      await this.cleanup()
      
      // 3. 상태 초기화
      this.state.config = config
      this.state.currentIndex = 0
      this.state.results = new Array(config.flow.length).fill(null)
      this.state.startTime = Date.now()
      this.errorRecoveryAttempts = 0
      
      // 4. 컴테이너 준비
      this.setupLessonContainer()
      
      // 5. 첫 번째 활동 로드
      await this.loadCurrentActivity()
      
      this.setState({ status: 'active' })
      this.emitLessonEvent('loaded', { 
        lessonId: config.lessonId,
        totalActivities: config.flow.length,
        estimatedTime: config.metadata?.estimatedTime
      })
      
      console.log(`✅ Lesson loaded successfully: ${config.lessonId}`)
      
    } catch (error) {
      console.error(`❌ Failed to load lesson: ${config?.lessonId}`, error)
      this.setState({ status: 'error' })
      this.showLessonError('레슨을 불러올 수 없습니다', error.message)
      throw error
    }
  }

  /**
   * 레슨 컴테이너 설정
   */
  private setupLessonContainer(): void {
    this.container.className = 'enhanced-lesson-container'
    this.container.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      background: var(--bg-primary, #0f172a);
      color: var(--text-primary, #e6edf7);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      overflow: hidden;
    `

    // CSS 변수 적용
    for (const [property, value] of Object.entries(this.options.theme)) {
      this.container.style.setProperty(property, value)
    }
  }

  /**
   * 현재 활동 로드 (강화된 버전)
   */
  private async loadCurrentActivity(): Promise<void> {
    if (!this.state.config) {
      throw new Error('No lesson config loaded')
    }
    
    const step = this.getCurrentStep()
    if (!step) {
      throw new Error('No current activity step found')
    }

    try {
      console.log(`🎭 Loading activity: ${step.activityId} (${step.template})`)
      
      // 1. 이전 활동 정리
      await this.cleanupCurrentActivity()
      
      // 2. 로딩 상태 표시
      this.showLoadingState(step)
      
      // 3. 컨텍스트 생성
      const context = this.createActivityContext(step)
      
      // 4. 강화된 샌드박스에서 템플릿 실행
      this.currentModule = await this.sandbox.executeTemplate(
        step.template,
        this.container,
        step.params,
        context
      )

      // 5. 성공 이벤트 발송
      this.emitLessonEvent('activity-loaded', {
        activityId: step.activityId,
        template: step.template,
        index: this.state.currentIndex
      })

    } catch (error) {
      console.error(`❌ Failed to load activity: ${step.activityId}`, error)
      await this.handleActivityLoadError(step, error)
    }
  }

  /**
   * 로딩 상태 표시
   */
  private showLoadingState(step: ActivityStep): void {
    this.container.innerHTML = `
      <div class="activity-loading-state" style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: var(--activity-bg, #1e293b);
      ">
        <div class="loading-content" style="
          text-align: center;
          padding: 2rem;
        ">
          <div class="loading-spinner" style="
            width: 48px;
            height: 48px;
            border: 3px solid var(--bg-secondary, #1e293b);
            border-top: 3px solid var(--primary-blue, #3b82f6);
            border-radius: 50%;
            margin: 0 auto 1.5rem;
            animation: spin 1s linear infinite;
          "></div>
          <h3 style="
            margin: 0 0 0.5rem 0;
            color: var(--text-primary, #e6edf7);
            font-size: 1.125rem;
          ">활동 로딩 중...</h3>
          <p style="
            margin: 0;
            color: var(--text-secondary, #94a3b8);
            font-size: 0.875rem;
          ">${step.activityId}</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `
  }

  /**
   * 활동 컨텍스트 생성
   */
  private createActivityContext(step: ActivityStep): ActivityContext {
    return {
      lessonId: this.state.config!.lessonId,
      activityId: step.activityId,
      userId: this.options.userId,
      locale: this.options.locale,
      theme: this.options.theme,
      eventBus: this.eventBus,
      storage: this.storage,
      audio: {
        async play(id: string) {
          const element = document.getElementById(id) as HTMLAudioElement
          if (element && element.play) {
            try {
              await element.play()
            } catch (error) {
              console.warn(`Audio play failed: ${id}`, error)
            }
          }
        },
        async stop(id: string) {
          const element = document.getElementById(id) as HTMLAudioElement
          if (element) {
            element.pause()
            element.currentTime = 0
          }
        },
        async pause(id: string) {
          const element = document.getElementById(id) as HTMLAudioElement
          if (element) {
            element.pause()
          }
        }
      },
      sandbox: {} as any // 샌드박스는 내부에서 생성됨
    }
  }

  /**
   * 다음 활동으로 이동
   */
  async next(): Promise<boolean> {
    if (!this.canGoNext()) {
      console.warn('🛑 Cannot move to next activity')
      return false
    }

    try {
      // 현재 활동 결과 수집
      await this.collectCurrentResult()
      
      // 다음 활동으로 이동
      this.state.currentIndex++
      
      if (this.state.currentIndex >= this.state.config!.flow.length) {
        // 레슨 완료
        await this.completeLesson()
        return false
      }
      
      // 다음 활동 로드
      await this.loadCurrentActivity()
      return true
      
    } catch (error) {
      console.error('❌ Error moving to next activity:', error)
      await this.handleNavigationError('next', error)
      return false
    }
  }

  /**
   * 이전 활동으로 이동
   */
  async previous(): Promise<boolean> {
    if (!this.canGoPrevious()) {
      console.warn('🛑 Cannot move to previous activity')
      return false
    }

    try {
      await this.collectCurrentResult()
      this.state.currentIndex--
      await this.loadCurrentActivity()
      return true
    } catch (error) {
      console.error('❌ Error moving to previous activity:', error)
      await this.handleNavigationError('previous', error)
      return false
    }
  }

  /**
   * 특정 활동으로 이동
   */
  async goTo(index: number): Promise<boolean> {
    if (!this.state.config || index < 0 || index >= this.state.config.flow.length) {
      console.warn(`🛑 Invalid activity index: ${index}`)
      return false
    }

    try {
      await this.collectCurrentResult()
      this.state.currentIndex = index
      await this.loadCurrentActivity()
      return true
    } catch (error) {
      console.error(`❌ Error jumping to activity ${index}:`, error)
      await this.handleNavigationError('goto', error)
      return false
    }
  }

  /**
   * 레슨 일시정지
   */
  async pause(): Promise<void> {
    if (this.currentModule?.pause) {
      await this.currentModule.pause()
    }
    this.setState({ status: 'paused' })
    this.emitLessonEvent('paused')
    console.log('⏸️ Lesson paused')
  }

  /**
   * 레슨 재개
   */
  async resume(): Promise<void> {
    if (this.currentModule?.resume) {
      await this.currentModule.resume()
    }
    this.setState({ status: 'active' })
    this.emitLessonEvent('resumed')
    console.log('▶️ Lesson resumed')
  }

  /**
   * 레슨 완료
   */
  private async completeLesson(): Promise<void> {
    this.state.endTime = Date.now()
    this.setState({ status: 'completed' })
    
    const summary = this.getLessonSummary()
    this.emitLessonEvent('completed', summary)
    
    // 결과 저장
    await this.storage.set('lesson-result:' + this.state.config!.lessonId, summary)
    
    console.log(`🏆 Lesson completed: ${this.state.config!.lessonId}`, summary)
  }

  /**
   * 현재 결과 수집
   */
  private async collectCurrentResult(): Promise<void> {
    if (this.currentModule) {
      try {
        const result = await this.currentModule.getResult()
        this.state.results[this.state.currentIndex] = result
        console.log(`📊 Result collected for activity ${this.state.currentIndex}:`, result)
      } catch (error) {
        console.warn('⚠️ Failed to collect activity result:', error)
        this.state.results[this.state.currentIndex] = {
          score: 0,
          details: { error: error.message, timestamp: Date.now() }
        }
      }
    }
  }

  /**
   * 활동 완료 처리
   */
  private async handleActivityComplete(): Promise<void> {
    await this.collectCurrentResult()
    
    const step = this.getCurrentStep()
    if (step?.rules?.skipAllowed !== false) {
      // 자동 진행 (사용자 경험 개선을 위해 딩레이 감소)
      setTimeout(() => {
        if (this.state.status === 'active') {
          this.next()
        }
      }, 800)
    }
  }

  /**
   * 활동 오류 처리
   */
  private async handleActivityError(event: ActivityEvent): Promise<void> {
    const step = this.getCurrentStep()
    if (!step) return

    this.errorRecoveryAttempts++
    
    if (this.errorRecoveryAttempts <= this.maxErrorRecoveryAttempts) {
      console.log(`🔄 Attempting error recovery (${this.errorRecoveryAttempts}/${this.maxErrorRecoveryAttempts})`)
      
      // 자동 복구 시도
      setTimeout(async () => {
        try {
          await this.loadCurrentActivity()
        } catch (error) {
          console.error('❌ Error recovery failed:', error)
          this.showActivityError(step, error)
        }
      }, 2000)
    } else {
      console.error('❌ Max error recovery attempts exceeded')
      this.showActivityError(step, new Error('오류 복구 시도가 초과되었습니다.'))
    }
  }

  /**
   * 내비게이션 오류 처리
   */
  private async handleNavigationError(action: string, error: Error): Promise<void> {
    console.error(`❌ Navigation error (${action}):`, error)
    
    this.setState({ status: 'error' })
    this.showNavigationError(action, error)
  }

  /**
   * 활동 로드 오류 처리
   */
  private async handleActivityLoadError(step: ActivityStep, error: Error): Promise<void> {
    console.error(`❌ Activity load error: ${step.activityId}`, error)
    this.showActivityError(step, error)
  }

  /**
   * 전역 오류 처리
   */
  private handleGlobalError(error: Error): void {
    console.error('🚨 Global error in orchestrator:', error)
    this.showGlobalError(error)
  }

  /**
   * 리소스 과사용 처리
   */
  private handleResourceOveruse(detail: any): void {
    console.warn(`⚠️ Resource overuse: ${detail.type}`, detail)
    
    // 리소스 사용량 경고 메시지 표시
    this.showResourceWarning(detail)
  }

  // === 에러 UI 메서드들 ===
  
  /**
   * 레슨 오류 표시
   */
  private showLessonError(title: string, message: string): void {
    this.container.innerHTML = `
      <div class="lesson-error-state" style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: var(--bg-primary, #0f172a);
        padding: 2rem;
      ">
        <div class="error-content" style="
          text-align: center;
          max-width: 500px;
          padding: 2rem;
          background: var(--bg-secondary, #1e293b);
          border-radius: 12px;
          border: 1px solid #dc2626;
        ">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🚨</div>
          <h2 style="color: var(--error-red, #ef4444); margin: 0 0 1rem 0;">${title}</h2>
          <p style="color: var(--text-secondary, #94a3b8); margin: 0 0 2rem 0;">${message}</p>
          <button onclick="location.reload()" style="
            background: var(--error-red, #ef4444);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          ">새로고침</button>
        </div>
      </div>
    `
  }

  /**
   * 활동 오류 표시
   */
  private showActivityError(step: ActivityStep, error: Error): void {
    this.container.innerHTML = `
      <div class="activity-error-state" style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background: var(--activity-bg, #1e293b);
        padding: 2rem;
      ">
        <div class="error-content" style="
          text-align: center;
          max-width: 400px;
          padding: 2rem;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid #dc2626;
          border-radius: 12px;
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <h3 style="color: var(--error-red, #ef4444); margin: 0 0 0.5rem 0;">활동 오류</h3>
          <p style="color: var(--text-secondary, #94a3b8); margin: 0 0 0.5rem 0; font-size: 0.875rem;">${step.activityId}</p>
          <p style="color: var(--text-primary, #e6edf7); margin: 0 0 1.5rem 0; font-size: 0.875rem;">${error.message}</p>
          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button onclick="window.location.reload()" style="
              background: var(--primary-blue, #3b82f6);
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 6px;
              cursor: pointer;
            ">다시 시도</button>
            <button onclick="history.back()" style="
              background: var(--bg-secondary, #1e293b);
              color: var(--text-primary, #e6edf7);
              border: 1px solid var(--text-secondary, #94a3b8);
              padding: 0.75rem 1.5rem;
              border-radius: 6px;
              cursor: pointer;
            ">돌아가기</button>
          </div>
        </div>
      </div>
    `
  }

  /**
   * 내비게이션 오류 표시
   */
  private showNavigationError(action: string, error: Error): void {
    const errorNotification = document.createElement('div')
    errorNotification.className = 'navigation-error-notification'
    errorNotification.innerHTML = `
      <div class="error-content" style="
        background: var(--error-red, #ef4444);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 400px;
      ">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.25rem;">⚠️</span>
          <div>
            <div style="font-weight: 600; margin-bottom: 0.25rem;">내비게이션 오류</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">${error.message}</div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 1.25rem;
            cursor: pointer;
            margin-left: auto;
          ">×</button>
        </div>
      </div>
    `
    
    errorNotification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
    `
    
    document.body.appendChild(errorNotification)
    
    setTimeout(() => {
      if (errorNotification.parentElement) {
        errorNotification.remove()
      }
    }, 5000)
  }

  /**
   * 전역 오류 표시
   */
  private showGlobalError(error: Error): void {
    // 전역 오류는 콘솔에만 로그 (너무 많이 떨지 않도록)
    console.error('🚨 Global error:', error)
  }

  /**
   * 리소스 경고 표시
   */
  private showResourceWarning(detail: any): void {
    const warningNotification = document.createElement('div')
    warningNotification.className = 'resource-warning-notification'
    warningNotification.innerHTML = `
      <div class="warning-content" style="
        background: var(--warning-yellow, #f59e0b);
        color: #1f2937;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 400px;
      ">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.25rem;">⚠️</span>
          <div>
            <div style="font-weight: 600; margin-bottom: 0.25rem;">리소스 사용량 경고</div>
            <div style="font-size: 0.875rem;">${detail.type} 사용량이 높습니다 (${detail.value})</div>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: none;
            border: none;
            color: #1f2937;
            font-size: 1.25rem;
            cursor: pointer;
            margin-left: auto;
          ">×</button>
        </div>
      </div>
    `
    
    warningNotification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
    `
    
    document.body.appendChild(warningNotification)
    
    setTimeout(() => {
      if (warningNotification.parentElement) {
        warningNotification.remove()
      }
    }, 8000)
  }

  // === 유틸리티 메서드들 ===

  /**
   * 현재 활동 정리
   */
  private async cleanupCurrentActivity(): Promise<void> {
    if (this.currentModule) {
      const activityId = this.getCurrentActivityId()
      try {
        await this.sandbox.unmountActivity(activityId)
        this.currentModule = null
      } catch (error) {
        console.warn(`⚠️ Error cleaning up activity ${activityId}:`, error)
      }
    }
  }

  /**
   * 레슨 검증
   */
  private async validateLesson(config: LessonConfig): Promise<void> {
    if (!config.lessonId) {
      throw new Error('lessonId is required')
    }
    
    if (!config.flow || config.flow.length === 0) {
      throw new Error('flow is required and must not be empty')
    }
    
    config.flow.forEach((step, index) => {
      if (!step.activityId) {
        throw new Error(`flow[${index}].activityId is required`)
      }
      if (!step.template) {
        throw new Error(`flow[${index}].template is required`)
      }
      if (!step.params) {
        throw new Error(`flow[${index}].params is required`)
      }
      
      // 템플릿 ID 형식 검증
      const templatePattern = /^[a-z-]+@\d+\.\d+\.\d+$/
      if (!templatePattern.test(step.template)) {
        throw new Error(`flow[${index}].template has invalid format: ${step.template}`)
      }
    })

    console.log(`✅ Lesson validation passed: ${config.lessonId}`)
  }

  // === 게터 메서드들 ===

  getCurrentStep(): ActivityStep | null {
    if (!this.state.config || this.state.currentIndex >= this.state.config.flow.length) {
      return null
    }
    return this.state.config.flow[this.state.currentIndex]
  }

  getCurrentActivityId(): string {
    return this.getCurrentStep()?.activityId || ''
  }

  canGoNext(): boolean {
    return this.state.config !== null && 
           this.state.currentIndex < this.state.config.flow.length - 1 &&
           this.state.status === 'active'
  }

  canGoPrevious(): boolean {
    return this.state.config !== null && 
           this.state.currentIndex > 0 &&
           this.state.status === 'active'
  }

  getLessonProgress(): number {
    if (!this.state.config) return 0
    return (this.state.currentIndex + 1) / this.state.config.flow.length
  }

  getLessonSummary(): any {
    const config = this.state.config!
    const totalScore = this.calculateTotalScore()
    const passLine = config.grading.passLine
    const passed = totalScore >= passLine
    
    return {
      lessonId: config.lessonId,
      totalScore,
      passLine,
      passed,
      duration: (this.state.endTime || Date.now()) - this.state.startTime,
      activities: this.state.results.map((result, index) => ({
        activityId: config.flow[index].activityId,
        template: config.flow[index].template,
        result
      })),
      sandboxStats: this.sandbox.getStats(),
      errorRecoveryAttempts: this.errorRecoveryAttempts
    }
  }

  private calculateTotalScore(): number {
    if (!this.state.config) return 0
    
    let totalWeight = 0
    let weightedScore = 0
    
    this.state.config.flow.forEach((step, index) => {
      const weight = step.rules?.scoreWeight || 1
      const result = this.state.results[index]
      const score = result?.score || 0
      
      totalWeight += weight
      weightedScore += score * weight
    })
    
    return totalWeight > 0 ? weightedScore / totalWeight : 0
  }

  private setState(updates: Partial<LessonState>): void {
    Object.assign(this.state, updates)
  }

  private emitLessonEvent(type: string, payload?: any): void {
    this.eventBus.emit({
      type: type as any,
      activityId: 'lesson',
      timestamp: Date.now(),
      payload
    })
  }

  /**
   * 전체 정리
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🗑️ Starting orchestrator cleanup...')
      
      await this.cleanupCurrentActivity()
      await this.sandbox.cleanup()
      this.eventBus.clearHistory()
      
      console.log('✅ Orchestrator cleanup completed')
    } catch (error) {
      console.error('❌ Error during cleanup:', error)
    }
  }

  // 상태 getter
  get lessonState(): LessonState {
    return { ...this.state }
  }

  get orchestratorStats(): any {
    return {
      lessonState: this.lessonState,
      sandboxStats: this.sandbox.getStats(),
      eventBusStats: this.eventBus.getStats?.(),
      errorRecoveryAttempts: this.errorRecoveryAttempts,
      uptime: Date.now() - this.state.startTime
    }
  }
}