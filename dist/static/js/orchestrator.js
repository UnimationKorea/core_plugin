// Lesson Orchestrator - Standalone Module for Browser Usage

// Event Bus Implementation
class CoreEventBus {
  constructor() {
    this.handlers = new Map()
    this.eventHistory = []
    this.maxHistorySize = 1000
  }

  emit(event) {
    // Add timestamp if missing
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now()
    }

    // Store in history
    this.eventHistory.push(enrichedEvent)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Call handlers
    const eventHandlers = this.handlers.get(event.type)
    if (eventHandlers) {
      eventHandlers.forEach(handler => {
        try {
          handler(enrichedEvent)
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error)
        }
      })
    }

    // Also call global handlers
    const globalHandlers = this.handlers.get('*')
    if (globalHandlers) {
      globalHandlers.forEach(handler => {
        try {
          handler(enrichedEvent)
        } catch (error) {
          console.error(`Error in global event handler:`, error)
        }
      })
    }
  }

  on(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type).add(handler)
  }

  off(type, handler) {
    const eventHandlers = this.handlers.get(type)
    if (eventHandlers) {
      eventHandlers.delete(handler)
      if (eventHandlers.size === 0) {
        this.handlers.delete(type)
      }
    }
  }

  clearHistory() {
    this.eventHistory = []
  }

  enableDebugLogging() {
    this.on('*', (event) => {
      console.log(`[EventBus] ${event.type}:`, event)
    })
  }
}

// Storage Implementation
class CoreStorage {
  constructor(prefix = 'lesson-platform:', maxSize = 10 * 1024 * 1024) {
    this.prefix = prefix
    this.maxSize = maxSize
  }

  async get(key) {
    try {
      const fullKey = this.prefix + key
      const value = localStorage.getItem(fullKey)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error)
      return null
    }
  }

  async set(key, value) {
    try {
      const fullKey = this.prefix + key
      const serialized = JSON.stringify(value)
      
      if (serialized.length > this.maxSize) {
        throw new Error(`Value too large: ${serialized.length} bytes (max: ${this.maxSize})`)
      }
      
      localStorage.setItem(fullKey, serialized)
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error)
      throw error
    }
  }

  async remove(key) {
    try {
      const fullKey = this.prefix + key
      localStorage.removeItem(fullKey)
    } catch (error) {
      console.error(`Storage remove error for key ${key}:`, error)
      throw error
    }
  }
}

// Activity Sandbox Manager
class ActivitySandboxManager {
  constructor() {
    this.allowedDomains = [
      'cdn.jsdelivr.net',
      'unpkg.com', 
      'cdnjs.cloudflare.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'interactive-examples.mdn.mozilla.net'
    ]
    this.maxStorageSize = 1024 * 1024 // 1MB
    this.loadedModules = new Map()
  }

  createSafeDOM(container) {
    const allowedTags = new Set([
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'button', 'input', 'textarea', 'select', 'option',
      'img', 'video', 'audio', 'canvas', 'svg',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
      'form', 'label', 'fieldset', 'legend'
    ])

    return {
      createElement: (tagName) => {
        if (!allowedTags.has(tagName.toLowerCase())) {
          throw new Error(`Tag '${tagName}' is not allowed in sandbox`)
        }
        return document.createElement(tagName)
      },
      
      querySelector: (selector) => {
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
  }

  async executeTemplate(templateId, container, params, context) {
    // Get template from global registry
    const template = window.TemplateRegistry?.get(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Clear and setup container
    container.innerHTML = ''
    container.className = 'activity-sandbox'
    container.style.cssText = `
      position: relative;
      overflow: hidden;
      isolation: isolate;
      contain: layout style paint;
    `

    // Create safe context
    const safeContext = this.createSafeContext(container, context)
    
    try {
      // Validate parameters
      this.validateParams(params, template.paramsSchema || {})
      
      // Execute template
      if (template.preload) {
        await template.preload(params)
      }
      
      await template.mount(container, params, safeContext)
      
      // Store reference for cleanup
      this.loadedModules.set(templateId, template)
      
      return template
      
    } catch (error) {
      container.innerHTML = `
        <div class="error-state p-4 text-center text-red-400 bg-red-900/20 rounded-lg border border-red-500/30">
          <div class="text-lg font-semibold mb-2">활동 로드 실패</div>
          <div class="text-sm text-red-300">${error.message}</div>
        </div>
      `
      throw error
    }
  }

  createSafeContext(container, baseContext) {
    const sandbox = this.createSafeDOM(container)
    
    return {
      lessonId: baseContext.lessonId || '',
      activityId: baseContext.activityId || '',
      userId: baseContext.userId || '',
      locale: baseContext.locale || 'ko',
      theme: baseContext.theme || {},
      eventBus: baseContext.eventBus,
      storage: baseContext.storage,
      audio: baseContext.audio,
      sandbox
    }
  }

  validateParams(params, schema) {
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

  async cleanup() {
    const promises = Array.from(this.loadedModules.values()).map(template => {
      try {
        return template.unmount?.()
      } catch (error) {
        console.warn('Error during template unmount:', error)
        return Promise.resolve()
      }
    })
    await Promise.all(promises)
    this.loadedModules.clear()
  }
}

// Main Lesson Orchestrator
class LessonOrchestrator {
  constructor(options) {
    this.state = {
      config: null,
      currentIndex: 0,
      results: [],
      startTime: 0,
      status: 'idle'
    }

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
    this.currentModule = null

    this.setupEventListeners()

    if (this.options.debug) {
      this.eventBus.enableDebugLogging()
    }
  }

  setupEventListeners() {
    this.eventBus.on('COMPLETE', async (event) => {
      if (event.activityId === this.getCurrentActivityId()) {
        await this.handleActivityComplete()
      }
    })

    this.eventBus.on('ERROR', (event) => {
      console.error('Activity error:', event)
      this.setState({ status: 'error' })
    })

    this.eventBus.on('PROGRESS', (event) => {
      this.emitLessonEvent('progress', {
        activityId: event.activityId,
        lessonProgress: this.getLessonProgress(),
        payload: event.payload
      })
    })
  }

  async loadLesson(config) {
    try {
      this.setState({ status: 'loading' })
      
      this.validateLesson(config)
      
      this.state.config = config
      this.state.currentIndex = 0
      this.state.results = new Array(config.flow.length).fill({score: 0})
      this.state.startTime = Date.now()
      
      await this.loadCurrentActivity()
      
      this.setState({ status: 'active' })
      this.emitLessonEvent('loaded', { lessonId: config.lessonId })
      
    } catch (error) {
      this.setState({ status: 'error' })
      throw new Error(`Failed to load lesson: ${error.message}`)
    }
  }

  async loadCurrentActivity() {
    if (!this.state.config) return
    
    const step = this.getCurrentStep()
    if (!step) return

    try {
      if (this.currentModule && this.currentModule.unmount) {
        await this.currentModule.unmount()
        this.currentModule = null
      }

      const context = this.createActivityContext(step)
      
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

  createActivityContext(step) {
    return {
      lessonId: this.state.config.lessonId,
      activityId: step.activityId,
      userId: this.options.userId,
      locale: this.options.locale,
      theme: this.options.theme,
      eventBus: this.eventBus,
      storage: this.storage,
      audio: {
        async play(id) {
          const element = document.getElementById(id)
          if (element && element.play) {
            await element.play()
          }
        },
        async stop(id) {
          const element = document.getElementById(id)
          if (element) {
            element.pause()
            element.currentTime = 0
          }
        },
        async pause(id) {
          const element = document.getElementById(id)
          if (element) {
            element.pause()
          }
        }
      },
      sandbox: {}
    }
  }

  async next() {
    if (!this.canGoNext()) return false

    try {
      await this.collectCurrentResult()
      
      this.state.currentIndex++
      
      if (this.state.currentIndex >= this.state.config.flow.length) {
        await this.completeLesson()
        return false
      }
      
      await this.loadCurrentActivity()
      return true
      
    } catch (error) {
      console.error('Error moving to next activity:', error)
      this.setState({ status: 'error' })
      return false
    }
  }

  async previous() {
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

  async completeLesson() {
    this.state.endTime = Date.now()
    this.setState({ status: 'completed' })
    
    const summary = this.getLessonSummary()
    this.emitLessonEvent('completed', summary)
    
    await this.storage.set('lesson-result:' + this.state.config.lessonId, summary)
  }

  async collectCurrentResult() {
    if (this.currentModule && this.currentModule.getResult) {
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

  async handleActivityComplete() {
    await this.collectCurrentResult()
    
    const step = this.getCurrentStep()
    if (step?.rules?.skipAllowed !== false) {
      setTimeout(() => {
        this.next()
      }, 1000)
    }
  }

  getCurrentStep() {
    if (!this.state.config || this.state.currentIndex >= this.state.config.flow.length) {
      return null
    }
    return this.state.config.flow[this.state.currentIndex]
  }

  getCurrentActivityId() {
    return this.getCurrentStep()?.activityId || ''
  }

  canGoNext() {
    return this.state.config !== null && 
           this.state.currentIndex < this.state.config.flow.length - 1 &&
           this.state.status === 'active'
  }

  canGoPrevious() {
    return this.state.config !== null && 
           this.state.currentIndex > 0 &&
           this.state.status === 'active'
  }

  getLessonProgress() {
    if (!this.state.config) return 0
    return this.state.currentIndex / this.state.config.flow.length
  }

  getLessonSummary() {
    const config = this.state.config
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

  calculateTotalScore() {
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

  validateLesson(config) {
    if (!config.lessonId) throw new Error('lessonId is required')
    if (!config.flow || config.flow.length === 0) throw new Error('flow is required and must not be empty')
    
    config.flow.forEach((step, index) => {
      if (!step.activityId) throw new Error(`flow[${index}].activityId is required`)
      if (!step.template) throw new Error(`flow[${index}].template is required`)
      if (!step.params) throw new Error(`flow[${index}].params is required`)
    })
  }

  setState(updates) {
    Object.assign(this.state, updates)
  }

  emitLessonEvent(type, payload) {
    this.eventBus.emit({
      type: type,
      activityId: 'lesson',
      timestamp: Date.now(),
      payload
    })
  }

  async cleanup() {
    if (this.currentModule && this.currentModule.unmount) {
      await this.currentModule.unmount()
    }
    await this.sandbox.cleanup()
    this.eventBus.clearHistory()
  }

  get lessonState() {
    return { ...this.state }
  }
}

// Template Registry (Simple version for browser)
if (!window.TemplateRegistry) {
  window.TemplateRegistry = new Map()
}

// Register built-in templates
function registerBuiltInTemplates() {
  // Video Template
  window.TemplateRegistry.set('video@2.0.0', {
    id: 'video@2.0.0',
    paramsSchema: {
      type: 'object',
      properties: {
        src: { type: 'string' },
        autoplay: { type: 'boolean', default: false },
        controls: { type: 'boolean', default: true }
      },
      required: ['src']
    },
    async mount(container, params, context) {
      let startTime = Date.now()
      let completed = false
      
      container.innerHTML = `
        <div class="video-activity" style="padding: 24px;">
          <video 
            controls="${params.controls !== false ? 'controls' : ''}"
            ${params.autoplay ? 'autoplay' : ''}
            style="width: 100%; max-height: 400px; border-radius: 12px; background: #000;"
          >
            <source src="${params.src}" type="video/mp4">
            브라우저가 비디오를 지원하지 않습니다.
          </video>
          <p style="margin-top: 16px; color: #9aa4b2; text-align: center;">
            동영상을 시청한 후 다음 버튼을 클릭하세요.
          </p>
        </div>
      `
      
      const video = container.querySelector('video')
      
      video.addEventListener('play', () => {
        context.eventBus.emit({
          type: 'START',
          activityId: context.activityId,
          timestamp: Date.now()
        })
      })
      
      video.addEventListener('ended', () => {
        completed = true
        context.eventBus.emit({
          type: 'COMPLETE',
          activityId: context.activityId,
          timestamp: Date.now()
        })
      })
      
      if (params.autoplay) {
        video.play().catch(() => {
          console.warn('Autoplay failed')
        })
      }
    },
    async unmount() {
      // Cleanup handled by container clearing
    },
    async getResult() {
      return { 
        score: 1, 
        durationMs: Date.now() - (this.startTime || Date.now()),
        details: { watched: true }
      }
    }
  })

  // Drag Drop Template
  window.TemplateRegistry.set('drag-drop-choices@2.0.0', {
    id: 'drag-drop-choices@2.0.0',
    paramsSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        choices: { type: 'array', items: { type: 'string' } },
        answer: { type: 'string' },
        image: { type: 'string' }
      },
      required: ['prompt', 'choices', 'answer']
    },
    async mount(container, params, context) {
      let selected = null
      let startTime = Date.now()
      
      const imageHtml = params.image ? `
        <img src="${params.image}" alt="문제 이미지" 
             style="max-height: 200px; border-radius: 8px; margin: 16px 0;">
      ` : ''
      
      container.innerHTML = `
        <div class="drag-drop-activity" style="padding: 24px;">
          <h3 style="margin: 0 0 16px 0; color: #e6edf7;">
            ${params.prompt.replace('___', '<span style="color: #7dd3fc; border-bottom: 2px dashed #7dd3fc;">___</span>')}
          </h3>
          
          ${imageHtml}
          
          <div id="drop-zone" style="
            min-height: 60px;
            border: 2px dashed #334155;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 16px 0;
            padding: 16px;
            background: rgba(15, 23, 42, 0.5);
            color: #64748b;
            transition: all 0.2s;
          ">
            정답을 여기로 드래그하거나 클릭하세요
          </div>
          
          <div class="choices" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px;">
            ${params.choices.map(choice => `
              <button class="choice-btn" 
                      data-value="${choice}"
                      draggable="true"
                      style="
                        padding: 8px 16px;
                        background: #1e293b;
                        border: 1px solid #334155;
                        border-radius: 8px;
                        color: #e6edf7;
                        cursor: pointer;
                        transition: all 0.2s;
                      "
                      onmouseover="this.style.background='#334155'"
                      onmouseout="this.style.background='#1e293b'"
              >
                ${choice}
              </button>
            `).join('')}
          </div>
          
          <button id="check-btn" 
                  style="
                    margin-top: 24px;
                    padding: 12px 24px;
                    background: #3b82f6;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                    opacity: 0.5;
                  "
                  disabled
          >
            답안 확인
          </button>
        </div>
      `
      
      const dropZone = container.querySelector('#drop-zone')
      const checkBtn = container.querySelector('#check-btn')
      const choices = container.querySelectorAll('.choice-btn')
      
      function updateDropZone(value) {
        selected = value
        dropZone.textContent = `선택됨: ${value}`
        dropZone.style.borderColor = '#22c55e'
        dropZone.style.background = 'rgba(34, 197, 94, 0.1)'
        checkBtn.disabled = false
        checkBtn.style.opacity = '1'
      }
      
      // Click handlers
      choices.forEach(btn => {
        btn.addEventListener('click', () => {
          updateDropZone(btn.dataset.value)
        })
      })
      
      // Drag and drop
      choices.forEach(btn => {
        btn.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', btn.dataset.value)
          btn.style.opacity = '0.5'
        })
        
        btn.addEventListener('dragend', () => {
          btn.style.opacity = '1'
        })
      })
      
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault()
        dropZone.style.borderColor = '#7dd3fc'
        dropZone.style.background = 'rgba(125, 211, 252, 0.1)'
      })
      
      dropZone.addEventListener('dragleave', () => {
        if (!selected) {
          dropZone.style.borderColor = '#334155'
          dropZone.style.background = 'rgba(15, 23, 42, 0.5)'
        }
      })
      
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault()
        const value = e.dataTransfer.getData('text/plain')
        updateDropZone(value)
      })
      
      checkBtn.addEventListener('click', () => {
        const correct = selected === params.answer
        const message = correct ? '정답입니다! 🎉' : `오답입니다. 정답: ${params.answer}`
        
        // Show feedback
        const feedback = document.createElement('div')
        feedback.textContent = message
        feedback.style.cssText = `
          margin-top: 16px;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          ${correct ? 
            'background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2);' :
            'background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);'
          }
        `
        
        container.appendChild(feedback)
        checkBtn.disabled = true
        
        // Emit completion event
        setTimeout(() => {
          context.eventBus.emit({
            type: 'COMPLETE',
            activityId: context.activityId,
            timestamp: Date.now(),
            payload: { correct, selected, answer: params.answer }
          })
        }, 1500)
      })
      
      context.eventBus.emit({
        type: 'START',
        activityId: context.activityId,
        timestamp: Date.now()
      })
    },
    async unmount() {
      // Cleanup handled by container clearing
    },
    async getResult() {
      return { 
        score: this.selected === this.answer ? 1 : 0,
        durationMs: Date.now() - (this.startTime || Date.now()),
        details: { selected: this.selected, answer: this.answer }
      }
    }
  })
}

// Initialize templates when module loads
registerBuiltInTemplates()

// Export for use
export { LessonOrchestrator }