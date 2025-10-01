import type { 
  TemplateRegistry, 
  TemplateInfo, 
  ActivityModule,
  ActivityManifest 
} from '../types/activity'

/**
 * 템플릿 등록 및 관리 시스템
 * - 동적 템플릿 로딩
 * - 버전 관리
 * - 의존성 체크
 * - 격리된 실행 환경
 */
export class CoreTemplateRegistry implements TemplateRegistry {
  private templates = new Map<string, TemplateInfo>()
  private loadedModules = new Map<string, ActivityModule>()
  private allowedDomains: string[] = [
    'cdn.jsdelivr.net',
    'unpkg.com', 
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ]

  constructor() {
    this.registerBuiltinTemplates()
  }

  /**
   * 템플릿 등록
   * 가드레일: 보안 검증, 스키마 검증, 샌드박스 정책 확인
   */
  async register(template: TemplateInfo): Promise<void> {
    try {
      // 1. 보안 검증
      await this.validateSecurity(template)
      
      // 2. 매니페스트 검증
      await this.validateManifest(template.manifest)
      
      // 3. 중복 확인
      if (this.templates.has(template.manifest.id)) {
        const existing = this.templates.get(template.manifest.id)!
        if (!this.isVersionNewer(template.manifest.version, existing.manifest.version)) {
          throw new Error(`Template ${template.manifest.id} already exists with same or newer version`)
        }
      }
      
      // 4. 등록
      this.templates.set(template.manifest.id, {
        ...template,
        loadCount: 0,
        lastUsed: new Date()
      })
      
      console.log(`✅ Template registered: ${template.manifest.id}@${template.manifest.version}`)
      
    } catch (error) {
      console.error(`❌ Template registration failed: ${template.manifest.id}`, error)
      throw error
    }
  }

  /**
   * 템플릿 해제
   * 가드레일: 사용 중인 템플릿 확인, 안전한 언로드
   */
  async unregister(id: string): Promise<void> {
    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`Template not found: ${id}`)
    }

    // 사용 중인 모듈 정리
    const module = this.loadedModules.get(id)
    if (module && module.unmount) {
      try {
        await module.unmount()
      } catch (error) {
        console.warn(`Warning during template unmount: ${id}`, error)
      }
    }

    this.templates.delete(id)
    this.loadedModules.delete(id)
    
    console.log(`🗑️ Template unregistered: ${id}`)
  }

  /**
   * 템플릿 조회
   */
  async get(id: string): Promise<TemplateInfo | null> {
    const template = this.templates.get(id)
    if (template) {
      template.lastUsed = new Date()
    }
    return template || null
  }

  /**
   * 템플릿 목록 조회
   */
  async list(category?: string): Promise<TemplateInfo[]> {
    const templates = Array.from(this.templates.values())
    
    if (category) {
      return templates.filter(t => t.manifest.category === category)
    }
    
    return templates.sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
  }

  /**
   * 템플릿 검증
   * 가드레일: 모든 보안 및 기능 요구사항 검증
   */
  async validate(template: TemplateInfo): Promise<boolean> {
    try {
      await this.validateSecurity(template)
      await this.validateManifest(template.manifest)
      return true
    } catch (error) {
      console.error('Template validation failed:', error)
      return false
    }
  }

  /**
   * 템플릿 모듈 로드
   * 가드레일: 샌드박스 내 안전한 로딩, 격리된 실행 환경
   */
  async loadModule(id: string): Promise<ActivityModule> {
    // 캐시 확인
    if (this.loadedModules.has(id)) {
      const template = this.templates.get(id)
      if (template) {
        template.loadCount++
      }
      return this.loadedModules.get(id)!
    }

    const template = this.templates.get(id)
    if (!template) {
      throw new Error(`Template not found: ${id}`)
    }

    try {
      // 보안 도메인 체크
      const url = new URL(template.bundle)
      if (!this.isAllowedDomain(url.hostname)) {
        throw new Error(`Domain not allowed: ${url.hostname}`)
      }

      // 동적 로드
      let module: any
      
      if (template.bundle.startsWith('builtin:')) {
        // 내장 템플릿
        module = await this.loadBuiltinTemplate(template.bundle.replace('builtin:', ''))
      } else if (template.bundle.endsWith('.js') || template.bundle.endsWith('.mjs')) {
        // ES 모듈
        module = await import(template.bundle)
      } else {
        // UMD/IIFE
        module = await this.loadUMDTemplate(template.bundle, id)
      }

      const activityModule = module.default || module
      
      // 모듈 인터페이스 검증
      this.validateModuleInterface(activityModule)
      
      // 캐시 저장
      this.loadedModules.set(id, activityModule)
      template.loadCount++
      
      return activityModule
      
    } catch (error) {
      console.error(`Failed to load template module: ${id}`, error)
      throw error
    }
  }

  /**
   * 내장 템플릿 등록
   */
  private async registerBuiltinTemplates(): Promise<void> {
    const builtinTemplates: Partial<TemplateInfo>[] = [
      {
        manifest: {
          id: 'multiple-choice@1.0.0',
          name: '4지 선다형 문제',
          version: '1.0.0',
          category: 'assessment',
          capabilities: ['keyboard', 'mouse', 'touch', 'audio'],
          paramsSchema: {
            type: 'object',
            properties: {
              question: { type: 'string', minLength: 1 },
              choices: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    text: { type: 'string' },
                    image: { type: 'string' }
                  },
                  required: ['id', 'text']
                },
                minItems: 2,
                maxItems: 6
              },
              correctAnswer: { 
                oneOf: [
                  { type: 'string' },
                  { type: 'array', items: { type: 'string' } }
                ]
              }
            },
            required: ['question', 'choices', 'correctAnswer']
          },
          i18n: { supported: ['ko', 'en'], defaultLocale: 'ko' },
          accessibility: {
            keyboardNavigation: true,
            screenReader: true,
            highContrast: true
          },
          performance: {
            maxLoadTimeMs: 2000,
            maxMemoryMB: 10
          },
          security: {
            allowedDomains: [],
            maxApiCalls: 0,
            requiresAuth: false
          }
        },
        bundle: 'builtin:multiple-choice',
        checksum: 'builtin'
      },
      {
        manifest: {
          id: 'video@2.0.0',
          name: '동영상 플레이어',
          version: '2.0.0',
          category: 'media',
          capabilities: ['mouse', 'touch', 'keyboard'],
          paramsSchema: {
            type: 'object',
            properties: {
              src: { type: 'string', format: 'uri' },
              autoplay: { type: 'boolean', default: false },
              controls: { type: 'boolean', default: true },
              subtitles: { type: 'string' }
            },
            required: ['src']
          },
          i18n: { supported: ['ko', 'en'], defaultLocale: 'ko' },
          accessibility: {
            keyboardNavigation: true,
            screenReader: true,
            highContrast: false
          },
          performance: {
            maxLoadTimeMs: 3000,
            maxMemoryMB: 50
          },
          security: {
            allowedDomains: ['youtube.com', 'vimeo.com'],
            maxApiCalls: 5,
            requiresAuth: false
          }
        },
        bundle: 'builtin:video',
        checksum: 'builtin'
      },
      {
        manifest: {
          id: 'memory-game@1.0.0',
          name: '메모리 게임',
          version: '1.0.0',
          category: 'interaction',
          capabilities: ['mouse', 'touch', 'keyboard'],
          paramsSchema: {
            type: 'object',
            properties: {
              cards: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    content: { type: 'string' },
                    pair: { type: 'string' }
                  },
                  required: ['id', 'content', 'pair']
                },
                minItems: 4,
                maxItems: 20
              },
              gridSize: { type: 'number', minimum: 2, maximum: 6, default: 4 }
            },
            required: ['cards']
          },
          i18n: { supported: ['ko', 'en'], defaultLocale: 'ko' },
          accessibility: {
            keyboardNavigation: true,
            screenReader: true,
            highContrast: true
          },
          performance: {
            maxLoadTimeMs: 2000,
            maxMemoryMB: 15
          },
          security: {
            allowedDomains: [],
            maxApiCalls: 0,
            requiresAuth: false
          }
        },
        bundle: 'builtin:memory-game',
        checksum: 'builtin'
      },
      {
        manifest: {
          id: 'word-guess@1.0.0',
          name: '단어 맞추기',
          version: '1.0.0',
          category: 'interaction',
          capabilities: ['keyboard', 'mouse', 'touch'],
          paramsSchema: {
            type: 'object',
            properties: {
              word: { type: 'string', minLength: 2 },
              hints: {
                type: 'array',
                items: { type: 'string' }
              },
              category: { type: 'string' },
              maxAttempts: { type: 'number', minimum: 1, default: 5 }
            },
            required: ['word', 'hints']
          },
          i18n: { supported: ['ko', 'en'], defaultLocale: 'ko' },
          accessibility: {
            keyboardNavigation: true,
            screenReader: true,
            highContrast: true
          },
          performance: {
            maxLoadTimeMs: 1500,
            maxMemoryMB: 8
          },
          security: {
            allowedDomains: [],
            maxApiCalls: 0,
            requiresAuth: false
          }
        },
        bundle: 'builtin:word-guess',
        checksum: 'builtin'
      },
      {
        manifest: {
          id: 'drag-drop@2.0.0',
          name: '드래그 앤 드롭',
          version: '2.0.0',
          category: 'interaction',
          capabilities: ['mouse', 'touch', 'keyboard'],
          paramsSchema: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    content: { type: 'string' },
                    target: { type: 'string' }
                  },
                  required: ['id', 'content', 'target']
                }
              },
              dropZones: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string' }
                  },
                  required: ['id', 'label']
                }
              }
            },
            required: ['items', 'dropZones']
          },
          i18n: { supported: ['ko', 'en'], defaultLocale: 'ko' },
          accessibility: {
            keyboardNavigation: true,
            screenReader: true,
            highContrast: true
          },
          performance: {
            maxLoadTimeMs: 2000,
            maxMemoryMB: 12
          },
          security: {
            allowedDomains: [],
            maxApiCalls: 0,
            requiresAuth: false
          }
        },
        bundle: 'builtin:drag-drop',
        checksum: 'builtin'
      }
    ]

    for (const template of builtinTemplates) {
      await this.register({
        ...template,
        loadCount: 0,
        lastUsed: new Date()
      } as TemplateInfo)
    }
  }

  /**
   * 내장 템플릿 로드
   */
  private async loadBuiltinTemplate(templateName: string): Promise<any> {
    switch (templateName) {
      case 'multiple-choice':
        return await import('../templates/multiple-choice/multiple-choice-template')
      case 'video':
        return await import('../templates/video/video-template')
      case 'memory-game':
        return await import('../templates/memory-game/memory-game-template')
      case 'word-guess':
        return await import('../templates/word-guess/word-guess-template')
      case 'drag-drop':
        return await import('../templates/drag-drop/drag-drop-template')
      default:
        throw new Error(`Unknown builtin template: ${templateName}`)
    }
  }

  /**
   * UMD 템플릿 로드
   */
  private async loadUMDTemplate(url: string, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.onload = () => {
        document.head.removeChild(script)
        const globalName = id.replace(/[@\.\-]/g, '_')
        const module = (window as any)[globalName]
        if (!module) {
          reject(new Error(`UMD module not found: ${globalName}`))
        } else {
          resolve(module)
        }
      }
      script.onerror = () => {
        document.head.removeChild(script)
        reject(new Error(`Failed to load UMD script: ${url}`))
      }
      document.head.appendChild(script)
    })
  }

  /**
   * 보안 검증
   */
  private async validateSecurity(template: TemplateInfo): Promise<void> {
    // 번들 URL 검증
    if (!template.bundle.startsWith('builtin:')) {
      const url = new URL(template.bundle)
      if (!this.isAllowedDomain(url.hostname)) {
        throw new Error(`Security: Domain not allowed: ${url.hostname}`)
      }
    }

    // 매니페스트 보안 정책 검증
    const security = template.manifest.security
    if (security.allowedDomains.length > 10) {
      throw new Error('Security: Too many allowed domains')
    }

    if (security.maxApiCalls > 100) {
      throw new Error('Security: Too many API calls allowed')
    }
  }

  /**
   * 매니페스트 검증
   */
  private async validateManifest(manifest: ActivityManifest): Promise<void> {
    const required = ['id', 'name', 'version', 'category', 'paramsSchema']
    
    for (const field of required) {
      if (!manifest[field as keyof ActivityManifest]) {
        throw new Error(`Manifest: Missing required field: ${field}`)
      }
    }

    // ID 형식 검증 (name@version)
    const idPattern = /^[a-z-]+@\d+\.\d+\.\d+$/
    if (!idPattern.test(manifest.id)) {
      throw new Error(`Manifest: Invalid ID format: ${manifest.id}`)
    }

    // 버전 형식 검증
    const versionPattern = /^\d+\.\d+\.\d+$/
    if (!versionPattern.test(manifest.version)) {
      throw new Error(`Manifest: Invalid version format: ${manifest.version}`)
    }

    // 카테고리 검증
    const allowedCategories = ['assessment', 'media', 'interaction', 'presentation', 'collaboration']
    if (!allowedCategories.includes(manifest.category)) {
      throw new Error(`Manifest: Invalid category: ${manifest.category}`)
    }
  }

  /**
   * 모듈 인터페이스 검증
   */
  private validateModuleInterface(module: any): void {
    const required = ['manifest', 'mount', 'unmount', 'getResult']
    
    for (const method of required) {
      if (typeof module[method] === 'undefined') {
        throw new Error(`Module: Missing required method: ${method}`)
      }
    }

    if (typeof module.mount !== 'function') {
      throw new Error('Module: mount must be a function')
    }

    if (typeof module.unmount !== 'function') {
      throw new Error('Module: unmount must be a function')
    }

    if (typeof module.getResult !== 'function') {
      throw new Error('Module: getResult must be a function')
    }
  }

  /**
   * 도메인 허용 여부 확인
   */
  private isAllowedDomain(hostname: string): boolean {
    return this.allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    )
  }

  /**
   * 버전 비교
   */
  private isVersionNewer(version1: string, version2: string): boolean {
    const v1 = version1.split('.').map(Number)
    const v2 = version2.split('.').map(Number)
    
    for (let i = 0; i < 3; i++) {
      if (v1[i] > v2[i]) return true
      if (v1[i] < v2[i]) return false
    }
    
    return false
  }

  /**
   * 통계 및 메트릭스
   */
  getStats(): any {
    return {
      totalTemplates: this.templates.size,
      loadedModules: this.loadedModules.size,
      categories: Array.from(new Set(Array.from(this.templates.values()).map(t => t.manifest.category))),
      mostUsed: Array.from(this.templates.values())
        .sort((a, b) => b.loadCount - a.loadCount)
        .slice(0, 5)
        .map(t => ({ id: t.manifest.id, loadCount: t.loadCount }))
    }
  }

  /**
   * 정리
   */
  async cleanup(): Promise<void> {
    const unloadPromises = Array.from(this.loadedModules.keys()).map(id => 
      this.unregister(id).catch(err => console.warn(`Cleanup error for ${id}:`, err))
    )
    
    await Promise.all(unloadPromises)
    
    this.templates.clear()
    this.loadedModules.clear()
  }
}