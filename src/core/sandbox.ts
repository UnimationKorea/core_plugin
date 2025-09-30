import type { ActivitySandbox, ActivityModule, ActivityParam, ActivityContext } from '../types/activity'

// 샌드박스 환경에서 템플릿 실행을 관리
export class ActivitySandboxManager {
  private allowedDomains: string[] = [
    'cdn.jsdelivr.net',
    'unpkg.com', 
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ]
  
  private maxStorageSize = 1024 * 1024 // 1MB per activity
  private loadedModules = new Map<string, ActivityModule>()
  
  // CSP 정책 설정
  private setupCSP(): void {
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = [
      \"default-src 'self'\",
      `script-src 'self' 'unsafe-inline' ${this.allowedDomains.join(' ')}`,
      `style-src 'self' 'unsafe-inline' ${this.allowedDomains.join(' ')}`,
      `img-src 'self' data: ${this.allowedDomains.join(' ')}`,
      `font-src 'self' ${this.allowedDomains.join(' ')}`,
      \"connect-src 'self'\",
      \"media-src 'self' data:\",
      \"object-src 'none'\",
      \"base-uri 'none'\",
      \"frame-ancestors 'none'\"
    ].join('; ')
    
    document.head.appendChild(meta)
  }

  // 안전한 DOM 래퍼 생성
  createSafeDOM(container: HTMLElement): ActivitySandbox {
    const allowedTags = new Set([
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'button', 'input', 'textarea', 'select', 'option',
      'img', 'video', 'audio', 'canvas', 'svg',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
      'form', 'label', 'fieldset', 'legend'
    ])

    const sandbox: ActivitySandbox = {
      createElement: (tagName: string) => {
        if (!allowedTags.has(tagName.toLowerCase())) {
          throw new Error(`Tag '${tagName}' is not allowed in sandbox`)
        }
        return document.createElement(tagName)
      },
      
      querySelector: (selector: string) => {
        // 컨테이너 내부에서만 검색 허용
        try {
          return container.querySelector(selector)
        } catch (error) {
          console.warn('Unsafe selector blocked:', selector)
          return null
        }
      },
      
      allowedDomains: [...this.allowedDomains],
      maxStorageSize: this.maxStorageSize
    }

    return sandbox
  }

  // 템플릿 모듈 동적 로드
  async loadTemplate(templateId: string, bundleUrl: string): Promise<ActivityModule> {
    // 캐시 확인
    if (this.loadedModules.has(templateId)) {
      return this.loadedModules.get(templateId)!
    }

    try {
      // URL 화이트리스트 검증
      const url = new URL(bundleUrl)
      if (!this.allowedDomains.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain))) {
        throw new Error(`Domain '${url.hostname}' is not in allowlist`)
      }

      // 동적 import로 모듈 로드
      let module: any
      
      if (bundleUrl.endsWith('.js') || bundleUrl.endsWith('.mjs')) {
        // ES 모듈
        module = await import(bundleUrl)
      } else {
        // UMD/IIFE - script 태그로 로드
        await this.loadScript(bundleUrl)
        // 전역에 등록된 모듈 확인
        const globalName = templateId.replace(/[@\\.]/g, '_')
        module = (window as any)[globalName]
      }

      if (!module || typeof module.default !== 'object') {
        throw new Error('Invalid template module format')
      }

      const activityModule = module.default as ActivityModule
      
      // 모듈 검증
      this.validateModule(activityModule)
      
      // 캐시에 저장
      this.loadedModules.set(templateId, activityModule)
      
      return activityModule
      
    } catch (error) {
      console.error(`Failed to load template ${templateId}:`, error)
      throw new Error(`Template loading failed: ${error.message}`)
    }
  }

  // 스크립트 동적 로드
  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.onload = () => {
        document.head.removeChild(script)
        resolve()
      }
      script.onerror = (error) => {
        document.head.removeChild(script)
        reject(new Error(`Failed to load script: ${url}`))
      }
      document.head.appendChild(script)
    })
  }

  // 모듈 검증
  private validateModule(module: ActivityModule): void {
    const required = ['manifest', 'mount', 'unmount', 'getResult']
    
    for (const prop of required) {
      if (!(prop in module)) {
        throw new Error(`Missing required property: ${prop}`)
      }
    }

    if (typeof module.mount !== 'function') {
      throw new Error('mount must be a function')
    }

    if (typeof module.unmount !== 'function') {
      throw new Error('unmount must be a function')
    }

    if (typeof module.getResult !== 'function') {
      throw new Error('getResult must be a function')
    }

    // 매니페스트 검증
    const manifest = module.manifest
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error('Invalid manifest: id, name, version are required')
    }
  }

  // 안전한 컨텍스트 생성
  createSafeContext(
    container: HTMLElement,
    baseContext: Partial<ActivityContext>
  ): ActivityContext {
    const sandbox = this.createSafeDOM(container)
    
    return {
      lessonId: baseContext.lessonId || '',
      activityId: baseContext.activityId || '',
      userId: baseContext.userId || '',
      locale: baseContext.locale || 'ko',
      theme: baseContext.theme || {},
      eventBus: baseContext.eventBus!,
      storage: baseContext.storage!,
      audio: baseContext.audio!,
      sandbox
    }
  }

  // 템플릿 실행 (샌드박스 적용)
  async executeTemplate(
    templateId: string,
    container: HTMLElement,
    params: ActivityParam,
    context: ActivityContext
  ): Promise<ActivityModule> {
    // 컨테이너 격리
    container.innerHTML = ''
    container.className = 'activity-sandbox'
    container.style.cssText = `
      position: relative;
      overflow: hidden;
      isolation: isolate;
      contain: layout style paint;
    `

    // 템플릿 로드
    const template = this.loadedModules.get(templateId)
    if (!template) {
      throw new Error(`Template not loaded: ${templateId}`)
    }

    // 안전한 컨텍스트로 실행
    const safeContext = this.createSafeContext(container, context)
    
    try {
      // 파라미터 검증 (JSON Schema 사용)
      this.validateParams(params, template.manifest.paramsSchema)
      
      // preload 실행
      if (template.preload) {
        await template.preload(params)
      }
      
      // mount 실행
      await template.mount(container, params, safeContext)
      
      return template
      
    } catch (error) {
      // 에러 발생시 컨테이너 정리
      container.innerHTML = `
        <div class="error-state p-4 text-center text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">
          <div class="text-lg font-semibold mb-2">활동 로드 실패</div>
          <div class="text-sm text-red-300">${error.message}</div>
        </div>
      `
      throw error
    }
  }

  // 파라미터 검증 (간단한 JSON Schema 구현)
  private validateParams(params: ActivityParam, schema: any): void {
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in params)) {
          throw new Error(`Required parameter missing: ${field}`)
        }
      }
    }

    if (schema.properties) {
      for (const [key, value] of Object.entries(params)) {
        const propSchema = schema.properties[key]
        if (propSchema && propSchema.type) {
          const actualType = Array.isArray(value) ? 'array' : typeof value
          if (actualType !== propSchema.type) {
            throw new Error(`Parameter ${key} type mismatch: expected ${propSchema.type}, got ${actualType}`)
          }
        }
      }
    }
  }

  // 모듈 언로드
  async unloadTemplate(templateId: string): Promise<void> {
    const template = this.loadedModules.get(templateId)
    if (template) {
      try {
        await template.unmount()
      } catch (error) {
        console.warn(`Error during template unmount:`, error)
      }
      this.loadedModules.delete(templateId)
    }
  }

  // 전체 정리
  async cleanup(): Promise<void> {
    const promises = Array.from(this.loadedModules.keys()).map(id => 
      this.unloadTemplate(id)
    )
    await Promise.all(promises)
  }
}