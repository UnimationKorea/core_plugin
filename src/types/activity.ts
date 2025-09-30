// Core Activity Types and Interfaces
export type ActivityParam = Record<string, unknown>

export interface ActivityContext {
  lessonId: string
  activityId: string
  userId: string
  locale: string
  theme: Record<string, string>
  eventBus: ActivityEventBus
  storage: ActivityStorage
  audio: ActivityAudioService
  // Runtime security context
  sandbox: ActivitySandbox
}

export interface ActivityEventBus {
  emit(event: ActivityEvent): void
  on(type: ActivityEventType, handler: ActivityEventHandler): void
  off(type: ActivityEventType, handler: ActivityEventHandler): void
}

export interface ActivityStorage {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  remove(key: string): Promise<void>
}

export interface ActivityAudioService {
  play(id: string): Promise<void>
  stop(id: string): Promise<void>
  pause(id: string): Promise<void>
}

export interface ActivitySandbox {
  // DOM 접근 제한
  createElement: typeof document.createElement
  querySelector: (selector: string) => Element | null
  // 네트워크 제한 (화이트리스트 CDN만)
  allowedDomains: string[]
  // 스토리지 제한
  maxStorageSize: number
}

export type ActivityEventType = 
  | 'READY' 
  | 'START' 
  | 'PROGRESS' 
  | 'COMPLETE' 
  | 'HINT' 
  | 'ERROR'
  | 'RETRY'
  | 'TIMEOUT'

export interface ActivityEvent {
  type: ActivityEventType
  timestamp: number
  activityId: string
  payload?: any
}

export type ActivityEventHandler = (event: ActivityEvent) => void

export interface ActivityResult {
  score: number // 0~1
  durationMs?: number
  details?: any
  logs?: ActivityEvent[]
}

export interface ActivityManifest {
  /** 고유 ID (semver 포함) */
  id: string
  /** 템플릿 이름 */
  name: string
  /** 버전 */
  version: string
  /** 카테고리 (media, interaction, assessment, etc.) */
  category: string
  /** 지원 기능 */
  capabilities: string[]
  /** 파라미터 스키마 (JSON Schema) */
  paramsSchema: object
  /** 국제화 지원 언어 */
  i18n: {
    supported: string[]
    defaultLocale: string
  }
  /** 접근성 지원 */
  accessibility: {
    keyboardNavigation: boolean
    screenReader: boolean
    highContrast: boolean
  }
  /** 성능 요구사항 */
  performance: {
    maxLoadTimeMs: number
    maxMemoryMB: number
  }
  /** 보안 정책 */
  security: {
    allowedDomains: string[]
    maxApiCalls: number
    requiresAuth: boolean
  }
}

export interface ActivityModule {
  /** 매니페스트 정보 */
  manifest: ActivityManifest
  
  /** 사전 로딩 (폰트, 이미지 등) */
  preload?(params: ActivityParam): Promise<void>
  
  /** 컨테이너에 UI 마운트 */
  mount(
    container: HTMLElement, 
    params: ActivityParam, 
    context: ActivityContext
  ): Promise<void>
  
  /** 언마운트 및 정리 */
  unmount(): Promise<void>
  
  /** 결과 산출 */
  getResult(): Promise<ActivityResult>
  
  /** 실시간 상태 검사 */
  getStatus?(): ActivityStatus
  
  /** 힌트 제공 */
  showHint?(level: number): Promise<void>
  
  /** 재시작 */
  restart?(): Promise<void>
  
  /** 일시정지/재개 */
  pause?(): Promise<void>
  resume?(): Promise<void>
}

export interface ActivityStatus {
  state: 'idle' | 'loading' | 'ready' | 'active' | 'paused' | 'completed' | 'error'
  progress: number // 0~1
  timeSpent: number // milliseconds
  interactions: number
  errors: number
}

// Lesson Configuration Types
export interface LessonConfig {
  lessonId: string
  title: string
  description?: string
  locale: string
  version?: string
  
  flow: ActivityStep[]
  grading: GradingConfig
  
  // 메타데이터
  metadata?: {
    author: string
    createdAt: string
    updatedAt: string
    tags: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: number // minutes
  }
  
  // 적응형 학습
  adaptive?: {
    enabled: boolean
    rules: AdaptiveRule[]
  }
}

export interface ActivityStep {
  activityId: string
  template: string // "template-name@version"
  params: ActivityParam
  rules?: ActivityRules
  conditions?: ActivityCondition[]
}

export interface ActivityRules {
  scoreWeight?: number
  retryLimit?: number
  timeoutSec?: number
  skipAllowed?: boolean
  hintAllowed?: boolean
  required?: boolean
}

export interface ActivityCondition {
  type: 'score' | 'completion' | 'time' | 'custom'
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq'
  value: number | string | boolean
  target?: string // activityId
}

export interface GradingConfig {
  mode: 'weighted-sum' | 'average' | 'minimum' | 'custom'
  passLine: number // 0~1
  showScores?: boolean
  showProgress?: boolean
}

export interface AdaptiveRule {
  condition: ActivityCondition
  action: 'skip' | 'repeat' | 'branch' | 'hint'
  target: string
}

// Template Registry Types
export interface TemplateInfo {
  manifest: ActivityManifest
  bundle: string // UMD/ESM 번들 URL
  checksum: string
  loadCount: number
  lastUsed: Date
}

export interface TemplateRegistry {
  register(template: TemplateInfo): Promise<void>
  unregister(id: string): Promise<void>
  get(id: string): Promise<TemplateInfo | null>
  list(category?: string): Promise<TemplateInfo[]>
  validate(template: TemplateInfo): Promise<boolean>
}