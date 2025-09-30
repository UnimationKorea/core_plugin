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
import { ActivitySandboxManager } from './sandbox'

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

export class LessonOrchestrator {
  private state: LessonState = {
    config: null,
    currentIndex: 0,
    results: [],
    startTime: 0,
    status: 'idle'
  }

  private eventBus: CoreEventBus
  private storage: CoreStorage
  private sandbox: ActivitySandboxManager
  private container: HTMLElement
  private currentModule: ActivityModule | null = null
  
  private options: Required<OrchestratorOptions>

  constructor(options: OrchestratorOptions) {
    this.options = {
      locale: 'ko',
      theme: {},
      debug: false,
      ...options
    }

    this.container = options.container
    this.eventBus = new CoreEventBus()
    this.storage = new CoreStorage(`lesson-${this.options.userId}:`)
    this.sandbox = new ActivitySandboxManager()

    // 글로벌 이벤트 리스너 등록
    this.setupEventListeners()

    if (this.options.debug) {
      this.eventBus.enableDebugLogging()
    }
  }

  private setupEventListeners(): void {
    // 활동 완료 이벤트 감지
    this.eventBus.on('COMPLETE', async (event) => {
      if (event.activityId === this.getCurrentActivityId()) {
        await this.handleActivityComplete()
      }
    })

    // 에러 이벤트 감지
    this.eventBus.on('ERROR', (event) => {
      console.error('Activity error:', event)
      this.setState({ status: 'error' })
    })

    // 진행률 이벤트 감지
    this.eventBus.on('PROGRESS', (event) => {
      this.emitLessonEvent('progress', {
        activityId: event.activityId,
        lessonProgress: this.getLessonProgress(),
        payload: event.payload
      })
    })
  }

  // 레슨 로드
  async loadLesson(config: LessonConfig): Promise<void> {
    try {
      this.setState({ status: 'loading' })
      
      // 레슨 검증
      this.validateLesson(config)
      
      // 상태 초기화
      this.state.config = config
      this.state.currentIndex = 0
      this.state.results = new Array(config.flow.length).fill(null)
      this.state.startTime = Date.now()
      
      // 첫 번째 활동 로드
      await this.loadCurrentActivity()
      
      this.setState({ status: 'active' })
      this.emitLessonEvent('loaded', { lessonId: config.lessonId })
      
    } catch (error) {
      this.setState({ status: 'error' })
      throw new Error(`Failed to load lesson: ${error.message}`)
    }
  }

  // 현재 활동 로드
  private async loadCurrentActivity(): Promise<void> {
    if (!this.state.config) return
    
    const step = this.getCurrentStep()
    if (!step) return

    try {
      // 이전 활동 정리
      if (this.currentModule) {
        await this.currentModule.unmount()
        this.currentModule = null
      }

      // 컨텍스트 생성
      const context = this.createActivityContext(step)
      
      // 템플릿 실행
      this.currentModule = await this.sandbox.executeTemplate(
        step.template,
        this.container,
        step.params,
        context
      )

      this.emitLessonEvent('activity-loaded', {
        activityId: step.activityId,
        template: step.template
      })

    } catch (error) {
      this.container.innerHTML = `
        <div class="error-state p-6 text-center">
          <div class="text-xl text-red-400 mb-2">활동 로드 실패</div>
          <div class="text-red-300 mb-4">${error.message}</div>
          <button onclick="location.reload()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            새로고침
          </button>
        </div>
      `
      throw error
    }
  }

  // 활동 컨텍스트 생성
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
            await element.play()
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
      sandbox: {} as any // sandbox는 내부에서 생성됨
    }
  }

  // 다음 활동으로 이동
  async next(): Promise<boolean> {
    if (!this.canGoNext()) return false

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
      console.error('Error moving to next activity:', error)
      this.setState({ status: 'error' })
      return false
    }
  }

  // 이전 활동으로 이동
  async previous(): Promise<boolean> {
    if (!this.canGoPrevious()) return false

    try {
      this.state.currentIndex--
      await this.loadCurrentActivity()
      return true
    } catch (error) {
      console.error('Error moving to previous activity:', error)
      return false
    }
  }

  // 특정 활동으로 이동
  async goTo(index: number): Promise<boolean> {
    if (!this.state.config || index < 0 || index >= this.state.config.flow.length) {
      return false
    }

    try {
      await this.collectCurrentResult()
      this.state.currentIndex = index
      await this.loadCurrentActivity()
      return true
    } catch (error) {
      console.error('Error jumping to activity:', error)
      return false
    }
  }

  // 레슨 일시정지
  async pause(): Promise<void> {
    if (this.currentModule?.pause) {
      await this.currentModule.pause()
    }
    this.setState({ status: 'paused' })
    this.emitLessonEvent('paused')
  }

  // 레슨 재개
  async resume(): Promise<void> {
    if (this.currentModule?.resume) {
      await this.currentModule.resume()
    }
    this.setState({ status: 'active' })
    this.emitLessonEvent('resumed')
  }

  // 레슨 완료
  private async completeLesson(): Promise<void> {
    this.state.endTime = Date.now()
    this.setState({ status: 'completed' })
    
    const summary = this.getLessonSummary()
    this.emitLessonEvent('completed', summary)
    
    // 결과 저장
    await this.storage.set('lesson-result:' + this.state.config!.lessonId, summary)
  }

  // 현재 결과 수집
  private async collectCurrentResult(): Promise<void> {
    if (this.currentModule) {
      try {
        const result = await this.currentModule.getResult()
        this.state.results[this.state.currentIndex] = result
      } catch (error) {
        console.warn('Failed to collect activity result:', error)
        this.state.results[this.state.currentIndex] = {
          score: 0,
          details: { error: error.message }
        }
      }
    }
  }

  // 활동 완료 처리
  private async handleActivityComplete(): Promise<void> {
    await this.collectCurrentResult()
    
    // 자동 진행 여부 확인
    const step = this.getCurrentStep()
    if (step?.rules?.skipAllowed !== false) {
      // 잠시 후 자동으로 다음으로 이동
      setTimeout(() => {
        this.next()
      }, 1000)
    }
  }

  // 유틸리티 메서드들
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
    return this.state.currentIndex / this.state.config.flow.length
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
      }))
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

  // 레슨 검증
  private validateLesson(config: LessonConfig): void {
    if (!config.lessonId) throw new Error('lessonId is required')
    if (!config.flow || config.flow.length === 0) throw new Error('flow is required and must not be empty')
    
    config.flow.forEach((step, index) => {
      if (!step.activityId) throw new Error(`flow[${index}].activityId is required`)
      if (!step.template) throw new Error(`flow[${index}].template is required`)
      if (!step.params) throw new Error(`flow[${index}].params is required`)
    })
  }

  // 상태 업데이트
  private setState(updates: Partial<LessonState>): void {
    Object.assign(this.state, updates)
  }

  // 레슨 이벤트 발송
  private emitLessonEvent(type: string, payload?: any): void {
    this.eventBus.emit({
      type: type as any,
      activityId: 'lesson',
      timestamp: Date.now(),
      payload
    })
  }

  // 정리
  async cleanup(): Promise<void> {
    if (this.currentModule) {
      await this.currentModule.unmount()
    }
    await this.sandbox.cleanup()
    this.eventBus.clearHistory()
  }

  // 상태 getter
  get lessonState(): LessonState {
    return { ...this.state }
  }
}