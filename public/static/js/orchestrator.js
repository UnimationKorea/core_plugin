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
      console.log('🎉 COMPLETE event received:', event)
      console.log('🔍 Current activity ID:', this.getCurrentActivityId())
      console.log('🔍 Event activity ID:', event.activityId)
      
      if (event.activityId === this.getCurrentActivityId()) {
        console.log('✅ Activity IDs match - handling completion')
        await this.handleActivityComplete()
      } else {
        console.log('❌ Activity ID mismatch - ignoring event')
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
    console.log('🔄 next() called - checking if can proceed...')
    console.log('📊 canGoNext():', this.canGoNext())
    console.log('📊 currentIndex:', this.state.currentIndex)
    console.log('📊 flow.length:', this.state.config?.flow?.length)
    
    if (!this.canGoNext()) {
      console.log('❌ Cannot go next - stopping here')
      return false
    }

    try {
      await this.collectCurrentResult()
      
      this.state.currentIndex++
      console.log('✅ Index incremented to:', this.state.currentIndex)
      
      if (this.state.currentIndex >= this.state.config.flow.length) {
        console.log('🏁 Lesson completed!')
        await this.completeLesson()
        return false
      }
      
      console.log('📖 Loading next activity...')
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
    console.log('🎯 Activity completed, processing next step...')
    await this.collectCurrentResult()
    
    const step = this.getCurrentStep()
    console.log('📋 Current step:', step)
    console.log('📊 Current index:', this.state.currentIndex)
    console.log('📈 Total activities:', this.state.config?.flow?.length)
    
    if (step?.rules?.skipAllowed !== false) {
      console.log('⏭️ Moving to next activity in 1 second...')
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

  getCurrentActivityIndex() {
    return this.state.currentIndex
  }

  canGoNext() {
    return this.state.config !== null && 
           this.state.currentIndex < this.state.config.flow.length &&
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
      
      // Normalize choices data
      let normalizedChoices = []
      if (Array.isArray(params.choices)) {
        normalizedChoices = params.choices.map((choice, index) => {
          if (typeof choice === 'object' && choice !== null) {
            return choice.text || choice.content || choice.value || `선택지 ${index + 1}`
          } else if (typeof choice === 'string') {
            return choice
          } else {
            return `선택지 ${index + 1}`
          }
        })
      } else {
        normalizedChoices = ['선택지 1', '선택지 2']
      }

      console.log('🔍 Drag-Drop - Raw params.choices:', params.choices)
      console.log('🔍 Drag-Drop - Normalized choices:', normalizedChoices)
      
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
            ${normalizedChoices.map(choice => `
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
                ${typeof choice === 'object' ? (choice.text || choice.content || choice.value || '[텍스트 없음]') : choice}
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

// Register new templates separately for now
function registerNewTemplates() {
  // Multiple Choice Template
  window.TemplateRegistry.set('multiple-choice@1.0.0', {
    id: 'multiple-choice@1.0.0',
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
        },
        allowMultiple: { type: 'boolean', default: false },
        shuffle: { type: 'boolean', default: true },
        timeLimit: { type: 'number', minimum: 10, maximum: 300 },
        explanation: { type: 'string' },
        image: { type: 'string' },
        showFeedback: { type: 'boolean', default: true },
        hints: { type: 'array', items: { type: 'string' } }
      },
      required: ['question', 'choices', 'correctAnswer']
    },
    async mount(container, params, context) {
      let selectedAnswers = new Set()
      let isAnswered = false
      let timer = null
      let remainingTime = params.timeLimit || 0
      // Validate and normalize choices data
      let normalizedChoices = []
      if (Array.isArray(params.choices)) {
        normalizedChoices = params.choices.map((choice, index) => {
          if (typeof choice === 'object' && choice !== null) {
            return {
              id: choice.id || `choice-${String.fromCharCode(97 + index)}`,
              text: choice.text || choice.content || choice.value || `선택지 ${index + 1}`,
              image: choice.image
            }
          } else if (typeof choice === 'string') {
            return {
              id: `choice-${String.fromCharCode(97 + index)}`,
              text: choice,
              image: null
            }
          } else {
            console.warn('Invalid choice data:', choice)
            return {
              id: `choice-${String.fromCharCode(97 + index)}`,
              text: `선택지 ${index + 1}`,
              image: null
            }
          }
        })
      } else {
        console.error('Invalid choices parameter:', params.choices)
        normalizedChoices = [
          { id: 'choice-a', text: '선택지 1' },
          { id: 'choice-b', text: '선택지 2' }
        ]
      }

      let shuffledChoices = [...normalizedChoices]
      let correctAnswerIds = Array.isArray(params.correctAnswer) ? params.correctAnswer : [params.correctAnswer]
      let startTime = Date.now()

      console.log('🔍 Multiple Choice - Raw params.choices:', params.choices)
      console.log('🔍 Multiple Choice - Normalized choices:', normalizedChoices)
      console.log('🔍 Multiple Choice - Shuffled choices:', shuffledChoices)

      // Shuffle choices if needed
      if (params.shuffle !== false) {
        for (let i = shuffledChoices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffledChoices[i], shuffledChoices[j]] = [shuffledChoices[j], shuffledChoices[i]]
        }
      }

      // Render UI
      const imageHtml = params.image ? `
        <div class="question-image" style="text-align: center; margin: 16px 0;">
          <img src="${params.image}" alt="문제 이미지" style="max-width: 100%; height: auto; border-radius: 8px;">
        </div>
      ` : ''

      const timerHtml = params.timeLimit ? `
        <div class="timer-section" style="margin: 16px 0; padding: 12px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; text-align: center;">
          <span style="color: #7dd3fc;">⏱️ 남은 시간: <span id="timer-value">${remainingTime}</span>초</span>
          <div style="width: 100%; height: 4px; background: #334155; border-radius: 2px; margin-top: 8px;">
            <div id="timer-bar" style="height: 100%; background: #3b82f6; border-radius: 2px; width: 100%; transition: width 1s linear;"></div>
          </div>
        </div>
      ` : ''

      container.innerHTML = `
        <div class="multiple-choice-activity" style="padding: 24px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 16px 0; color: #e6edf7; line-height: 1.6;">${params.question}</h3>
          
          ${imageHtml}
          ${timerHtml}
          
          <div class="choices-grid" style="display: grid; gap: 12px; margin: 24px 0;">
            ${shuffledChoices.map((choice, index) => `
              <div class="choice-item" data-choice-id="${choice.id}" style="
                background: #1e293b;
                border: 2px solid #334155;
                border-radius: 8px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 12px;
              ">
                <input type="${params.allowMultiple ? 'checkbox' : 'radio'}" 
                       name="${params.allowMultiple ? `choice-${choice.id}` : 'choice'}"
                       value="${choice.id}"
                       id="choice-${choice.id}"
                       style="margin: 0; width: 18px; height: 18px;">
                <label for="choice-${choice.id}" style="
                  flex: 1;
                  color: #e6edf7;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  gap: 12px;
                ">
                  <span style="
                    min-width: 24px;
                    height: 24px;
                    background: #334155;
                    color: #94a3b8;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                  ">${String.fromCharCode(65 + index)}</span>
                  <span>${choice.text || choice.content || choice || '[텍스트 없음]'}</span>
                </label>
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin-top: 24px;">
            <button id="submit-btn" disabled style="
              padding: 12px 24px;
              background: #3b82f6;
              border: none;
              border-radius: 8px;
              color: white;
              cursor: pointer;
              font-weight: 600;
              opacity: 0.5;
              transition: all 0.2s;
            ">답안 제출</button>
          </div>
          
          <div id="feedback-area" style="display: none; margin-top: 16px;"></div>
        </div>
      `

      // Event listeners
      const choiceInputs = container.querySelectorAll('input[type="radio"], input[type="checkbox"]')
      const submitBtn = container.querySelector('#submit-btn')
      const timerValue = container.querySelector('#timer-value')
      const timerBar = container.querySelector('#timer-bar')

      // Choice selection
      choiceInputs.forEach(input => {
        input.addEventListener('change', (e) => {
          const choiceId = e.target.value
          
          if (e.target.checked) {
            selectedAnswers.add(choiceId)
          } else {
            selectedAnswers.delete(choiceId)
          }

          // For single choice, clear others
          if (!params.allowMultiple && e.target.checked) {
            selectedAnswers.clear()
            selectedAnswers.add(choiceId)
            choiceInputs.forEach(otherInput => {
              if (otherInput !== e.target) {
                otherInput.checked = false
              }
            })
          }

          // Update submit button
          submitBtn.disabled = selectedAnswers.size === 0
          submitBtn.style.opacity = selectedAnswers.size === 0 ? '0.5' : '1'
        })
      })

      // Submit button
      submitBtn.addEventListener('click', () => {
        if (isAnswered) return
        submitAnswer()
      })

      // Timer
      if (params.timeLimit) {
        timer = setInterval(() => {
          remainingTime--
          if (timerValue) timerValue.textContent = remainingTime.toString()
          if (timerBar) {
            const progress = remainingTime / params.timeLimit
            timerBar.style.width = `${progress * 100}%`
            if (progress < 0.2) timerBar.style.background = '#ef4444'
            else if (progress < 0.5) timerBar.style.background = '#f59e0b'
          }

          if (remainingTime <= 0) {
            submitAnswer(true)
          }
        }, 1000)
      }

      function submitAnswer(timeUp = false) {
        if (isAnswered) return
        isAnswered = true
        
        if (timer) {
          clearInterval(timer)
          timer = null
        }

        const isCorrect = validateAnswer()
        
        // Show feedback
        if (params.showFeedback !== false) {
          showFeedback(isCorrect, timeUp)
        }

        // Emit completion
        setTimeout(() => {
          context.eventBus.emit({
            type: 'COMPLETE',
            activityId: context.activityId,
            timestamp: Date.now(),
            payload: { 
              correct: isCorrect, 
              selected: Array.from(selectedAnswers), 
              answer: correctAnswerIds,
              timeUp
            }
          })
        }, 2000)
      }

      function validateAnswer() {
        if (selectedAnswers.size !== correctAnswerIds.length) return false
        return correctAnswerIds.every(answerId => selectedAnswers.has(answerId))
      }

      function showFeedback(isCorrect, timeUp = false) {
        const feedbackArea = container.querySelector('#feedback-area')
        
        let message = timeUp ? '⏰ 시간이 종료되었습니다!' : 
                     isCorrect ? '🎉 정답입니다!' : '❌ 틀렸습니다.'
        
        if (params.explanation) {
          message += `<div style="margin-top: 8px; font-size: 14px; opacity: 0.9;"><strong>해설:</strong> ${params.explanation}</div>`
        }

        feedbackArea.innerHTML = `
          <div style="
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            ${isCorrect ? 
              'background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2);' :
              'background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);'
            }
          ">${message}</div>
        `
        feedbackArea.style.display = 'block'
      }

      // Start event
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
        score: this.isCorrect ? 1 : 0,
        durationMs: Date.now() - (this.startTime || Date.now()),
        details: { 
          selected: this.selected, 
          correct: this.correctAnswerIds,
          timeSpent: this.timeSpent 
        }
      }
    }
  })

  // Memory Game Template
  window.TemplateRegistry.set('memory-game@1.0.0', {
    id: 'memory-game@1.0.0',
    paramsSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1 },
        cards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'string' },
              type: { type: 'string', enum: ['text', 'image', 'emoji'] },
              matchId: { type: 'string' },
              image: { type: 'string' }
            },
            required: ['id', 'content', 'type', 'matchId']
          },
          minItems: 4,
          maxItems: 36
        },
        gridSize: { type: 'string', enum: ['auto', '4x4', '4x6', '6x6'], default: 'auto' },
        timeLimit: { type: 'number', minimum: 30, maximum: 600 },
        allowRetries: { type: 'boolean', default: true },
        maxAttempts: { type: 'number', minimum: 1, maximum: 10, default: 3 },
        showTimer: { type: 'boolean', default: true },
        successMessage: { type: 'string' },
        failureMessage: { type: 'string' },
        shuffle: { type: 'boolean', default: true }
      },
      required: ['title', 'cards']
    },
    async mount(container, params, context) {
      let cardStates = new Map()
      let flippedCards = []
      let matchedPairs = 0
      let totalPairs = 0
      let attempts = 0
      let timer = null
      let remainingTime = params.timeLimit || 0
      let gameStarted = false
      let gameCompleted = false
      let shuffledCards = [...params.cards]
      let gridColumns = 4
      let startTime = Date.now()

      // Validate and prepare cards
      if (params.cards.length % 2 !== 0) {
        throw new Error('카드 개수는 짝수여야 합니다.')
      }

      const matchGroups = new Map()
      params.cards.forEach(card => {
        const count = matchGroups.get(card.matchId) || 0
        matchGroups.set(card.matchId, count + 1)
      })

      totalPairs = matchGroups.size

      // Shuffle cards
      if (params.shuffle !== false) {
        for (let i = shuffledCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]]
        }
      }

      // Initialize card states
      shuffledCards.forEach(card => {
        cardStates.set(card.id, {
          id: card.id,
          isFlipped: false,
          isMatched: false,
          matchId: card.matchId
        })
      })

      // Setup grid
      const cardCount = params.cards.length
      if (params.gridSize === 'auto') {
        gridColumns = cardCount <= 16 ? 4 : 6
      } else {
        switch (params.gridSize) {
          case '4x4': gridColumns = 4; break
          case '4x6': gridColumns = 4; break
          case '6x6': gridColumns = 6; break
        }
      }

      // Render UI
      const timerHtml = params.showTimer !== false && params.timeLimit ? `
        <div class="timer-section" style="margin: 16px 0; padding: 12px; background: rgba(15, 23, 42, 0.5); border-radius: 8px; text-align: center;">
          <span style="color: #7dd3fc;">⏱️ 남은 시간: <span id="timer-value">${remainingTime}</span>초</span>
          <div style="width: 100%; height: 4px; background: #334155; border-radius: 2px; margin-top: 8px;">
            <div id="timer-bar" style="height: 100%; background: #3b82f6; border-radius: 2px; width: 100%; transition: width 1s linear;"></div>
          </div>
        </div>
      ` : ''

      container.innerHTML = `
        <div class="memory-game-activity" style="padding: 24px; font-family: Arial, sans-serif; text-align: center;">
          <h3 style="margin: 0 0 16px 0; color: #e6edf7;">${params.title}</h3>
          
          ${timerHtml}
          
          <div style="margin: 16px 0; display: flex; justify-content: center; gap: 24px; font-size: 14px;">
            <span style="color: #94a3b8;">매칭된 쌍: <span id="matched-pairs" style="color: #22c55e; font-weight: 600;">0</span>/${totalPairs}</span>
            <span style="color: #94a3b8;">시도 횟수: <span id="attempt-count" style="color: #7dd3fc; font-weight: 600;">0</span></span>
          </div>
          
          <div class="cards-grid" id="cards-grid" style="
            display: grid;
            grid-template-columns: repeat(${gridColumns}, 1fr);
            gap: 8px;
            max-width: 600px;
            margin: 24px auto;
            justify-items: center;
          ">
            ${shuffledCards.map(card => renderCard(card)).join('')}
          </div>
          
          <div style="margin-top: 24px;">
            <button id="start-btn" style="
              padding: 12px 24px;
              background: #22c55e;
              border: none;
              border-radius: 8px;
              color: white;
              cursor: pointer;
              font-weight: 600;
              margin-right: 12px;
            ">🎮 게임 시작</button>
            
            <button id="restart-btn" style="
              padding: 12px 24px;
              background: #64748b;
              border: none;
              border-radius: 8px;
              color: white;
              cursor: pointer;
              font-weight: 600;
              display: none;
            ">🔄 다시 시작</button>
          </div>
          
          <div id="feedback-area" style="display: none; margin-top: 16px;"></div>
        </div>
      `

      function renderCard(card) {
        const cardState = cardStates.get(card.id)
        
        let frontContent
        switch (card.type) {
          case 'emoji':
            frontContent = `<div style="font-size: 24px;">${card.content}</div>`
            break
          case 'image':
            frontContent = `<img src="${card.image || card.content}" alt="${card.content}" style="width: 80%; height: 80%; object-fit: cover; border-radius: 4px;">`
            break
          default:
            frontContent = `<div style="font-size: 12px; font-weight: 600; padding: 4px; text-align: center; word-break: break-word;">${card.content}</div>`
        }

        return `
          <div class="memory-card" 
               data-card-id="${card.id}" 
               data-match-id="${card.matchId}"
               style="
                 width: 80px;
                 height: 80px;
                 perspective: 1000px;
                 cursor: pointer;
                 border-radius: 8px;
                 position: relative;
                 transition: transform 0.2s;
                 pointer-events: none;
               ">
            <div class="card-inner" style="
              width: 100%;
              height: 100%;
              position: relative;
              transform-style: preserve-3d;
              transition: transform 0.6s;
              ${cardState.isFlipped ? 'transform: rotateY(180deg);' : ''}
            ">
              <div class="card-back" style="
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              ">?</div>
              <div class="card-front" style="
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                background: ${cardState.isMatched ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#1e293b'};
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${cardState.isMatched ? 'white' : '#e6edf7'};
                transform: rotateY(180deg);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border: 2px solid ${cardState.isMatched ? '#22c55e' : '#334155'};
              ">${frontContent}</div>
            </div>
          </div>
        `
      }

      // Event listeners
      const cards = container.querySelectorAll('.memory-card')
      const startBtn = container.querySelector('#start-btn')
      const restartBtn = container.querySelector('#restart-btn')

      cards.forEach(card => {
        card.addEventListener('click', () => handleCardClick(card))
      })

      startBtn.addEventListener('click', startGame)
      restartBtn.addEventListener('click', restartGame)

      function startGame() {
        if (gameStarted) return
        gameStarted = true

        startBtn.style.display = 'none'
        restartBtn.style.display = 'inline-block'

        cards.forEach(card => {
          card.style.pointerEvents = 'auto'
        })

        if (params.timeLimit && params.showTimer !== false) {
          timer = setInterval(() => {
            remainingTime--
            const timerValue = container.querySelector('#timer-value')
            const timerBar = container.querySelector('#timer-bar')
            
            if (timerValue) timerValue.textContent = remainingTime.toString()
            if (timerBar) {
              const progress = remainingTime / params.timeLimit
              timerBar.style.width = `${progress * 100}%`
              if (progress < 0.2) timerBar.style.background = '#ef4444'
              else if (progress < 0.5) timerBar.style.background = '#f59e0b'
            }

            if (remainingTime <= 0) {
              completeGame(false)
            }
          }, 1000)
        }

        context.eventBus.emit({
          type: 'START',
          activityId: context.activityId,
          timestamp: Date.now()
        })
      }

      function handleCardClick(cardElement) {
        if (!gameStarted || gameCompleted) return

        const cardId = cardElement.getAttribute('data-card-id')
        const cardState = cardStates.get(cardId)

        if (cardState.isFlipped || cardState.isMatched || flippedCards.length >= 2) return

        // Flip card
        cardState.isFlipped = true
        flippedCards.push(cardId)
        cardElement.querySelector('.card-inner').style.transform = 'rotateY(180deg)'

        if (flippedCards.length === 2) {
          setTimeout(() => checkMatch(), 1000)
        }
      }

      function checkMatch() {
        const [cardId1, cardId2] = flippedCards
        const cardState1 = cardStates.get(cardId1)
        const cardState2 = cardStates.get(cardId2)

        attempts++
        container.querySelector('#attempt-count').textContent = attempts.toString()

        if (cardState1.matchId === cardState2.matchId) {
          // Match success
          cardState1.isMatched = true
          cardState2.isMatched = true
          matchedPairs++
          
          container.querySelector('#matched-pairs').textContent = matchedPairs.toString()
          
          // Update card appearance
          ;[cardId1, cardId2].forEach(cardId => {
            const cardElement = container.querySelector(`[data-card-id="${cardId}"]`)
            const cardFront = cardElement.querySelector('.card-front')
            cardFront.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)'
            cardFront.style.borderColor = '#22c55e'
            cardFront.style.color = 'white'
          })

          if (matchedPairs === totalPairs) {
            setTimeout(() => completeGame(true), 500)
          }
        } else {
          // Match failed
          setTimeout(() => {
            cardState1.isFlipped = false
            cardState2.isFlipped = false
            
            ;[cardId1, cardId2].forEach(cardId => {
              const cardElement = container.querySelector(`[data-card-id="${cardId}"]`)
              cardElement.querySelector('.card-inner').style.transform = 'rotateY(0deg)'
            })

            if (params.maxAttempts && attempts >= params.maxAttempts) {
              setTimeout(() => completeGame(false), 500)
            }
          }, 1000)
        }

        flippedCards = []
      }

      function completeGame(success) {
        if (gameCompleted) return
        gameCompleted = true

        if (timer) {
          clearInterval(timer)
          timer = null
        }

        cards.forEach(card => {
          card.style.pointerEvents = 'none'
        })

        showResult(success)

        setTimeout(() => {
          context.eventBus.emit({
            type: 'COMPLETE',
            activityId: context.activityId,
            timestamp: Date.now(),
            payload: { 
              success, 
              matchedPairs, 
              totalPairs, 
              attempts,
              timeSpent: params.timeLimit ? params.timeLimit - remainingTime : Math.floor((Date.now() - startTime) / 1000)
            }
          })
        }, 3000)
      }

      function showResult(success) {
        const feedbackArea = container.querySelector('#feedback-area')
        
        const message = success ? 
          (params.successMessage || '🎉 축하합니다! 모든 카드를 맞췄습니다!') :
          (params.failureMessage || '😔 시간이 부족했습니다. 다시 시도해보세요!')
        
        const timeSpent = params.timeLimit ? params.timeLimit - remainingTime : Math.floor((Date.now() - startTime) / 1000)
        
        feedbackArea.innerHTML = `
          <div style="
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            font-weight: 600;
            ${success ? 
              'background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 2px solid rgba(34, 197, 94, 0.2);' :
              'background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 2px solid rgba(239, 68, 68, 0.2);'
            }
          ">
            <div style="font-size: 18px; margin-bottom: 12px;">${message}</div>
            <div style="font-size: 14px; opacity: 0.9; line-height: 1.5;">
              <div>매칭된 쌍: ${matchedPairs}/${totalPairs}</div>
              <div>시도 횟수: ${attempts}번</div>
              <div>소요 시간: ${timeSpent}초</div>
            </div>
          </div>
        `
        feedbackArea.style.display = 'block'
      }

      function restartGame() {
        gameStarted = false
        gameCompleted = false
        matchedPairs = 0
        attempts = 0
        flippedCards = []

        if (timer) {
          clearInterval(timer)
          timer = null
        }

        if (params.timeLimit) {
          remainingTime = params.timeLimit
        }

        cardStates.forEach(state => {
          state.isFlipped = false
          state.isMatched = false
        })

        if (params.shuffle !== false) {
          for (let i = shuffledCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]]
          }
        }

        // Re-render
        container.querySelector('#cards-grid').innerHTML = shuffledCards.map(card => renderCard(card)).join('')
        container.querySelector('#matched-pairs').textContent = '0'
        container.querySelector('#attempt-count').textContent = '0'
        container.querySelector('#feedback-area').style.display = 'none'
        
        // Re-attach events
        container.querySelectorAll('.memory-card').forEach(card => {
          card.addEventListener('click', () => handleCardClick(card))
        })

        startBtn.style.display = 'inline-block'
        restartBtn.style.display = 'none'
      }
    },
    async unmount() {
      // Cleanup handled by container clearing
    },
    async getResult() {
      return { 
        score: this.success ? 1 : 0,
        durationMs: Date.now() - (this.startTime || Date.now()),
        details: { 
          matchedPairs: this.matchedPairs, 
          totalPairs: this.totalPairs,
          attempts: this.attempts,
          success: this.success
        }
      }
    }
  })
}

// Register Word Guess template
function registerWordGuessTemplate() {
  window.TemplateRegistry.set('word-guess@1.0.0', {
    id: 'word-guess@1.0.0',
    paramsSchema: {
      type: 'object',
      properties: {
        word: { 
          type: 'string', 
          minLength: 3, 
          maxLength: 15,
          pattern: '^[가-힣a-zA-Z]+$'
        },
        hint: { 
          type: 'string', 
          maxLength: 200 
        },
        category: {
          type: 'string',
          enum: ['동물', '음식', '직업', '색깔', '나라', '기타'],
          default: '기타'
        },
        maxAttempts: {
          type: 'number',
          minimum: 3,
          maximum: 10,
          default: 6
        },
        showHintAfter: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          default: 3
        },
        timeLimit: {
          type: 'number',
          minimum: 0,
          maximum: 600,
          default: 0
        },
        difficulty: {
          type: 'string',
          enum: ['쉬움', '보통', '어려움'],
          default: '보통'
        }
      },
      required: ['word', 'hint']
    },
    async mount(container, params, context) {
      // Game state
      let targetWord = params.word.toLowerCase()
      let guessedLetters = new Set()
      let wrongLetters = new Set()
      let attempts = 0
      let gameCompleted = false
      let gameWon = false
      let startTime = Date.now()
      let timer = null
      let remainingTime = params.timeLimit || 0

      // Load CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/static/css/templates/word-guess.css'
      document.head.appendChild(link)

      function generateWordDisplay() {
        return targetWord
          .split('')
          .map(letter => {
            const isRevealed = guessedLetters.has(letter)
            return `<span class="letter ${isRevealed ? 'revealed' : ''}">${isRevealed ? letter.toUpperCase() : '_'}</span>`
          })
          .join('')
      }

      function calculateProgress() {
        const guessedCount = targetWord.split('').filter(letter => 
          guessedLetters.has(letter)
        ).length
        return Math.round((guessedCount / targetWord.length) * 100)
      }

      function isWordComplete() {
        return targetWord.split('').every(letter => guessedLetters.has(letter))
      }

      function formatTime(seconds) {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
      }

      function showFeedback(message, type) {
        const feedback = document.createElement('div')
        feedback.textContent = message
        feedback.style.cssText = `
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          padding: 12px 24px; border-radius: 8px; font-weight: 600;
          z-index: 1000; pointer-events: none; opacity: 0;
          transition: opacity 0.3s ease; color: white;
          background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#f59e0b'};
        `
        document.body.appendChild(feedback)
        requestAnimationFrame(() => feedback.style.opacity = '1')
        setTimeout(() => {
          feedback.style.opacity = '0'
          setTimeout(() => document.body.removeChild(feedback), 300)
        }, 2000)
      }

      function updateDisplay() {
        const wordDisplay = container.querySelector('#word-display')
        if (wordDisplay) wordDisplay.innerHTML = generateWordDisplay()

        const attemptsLeft = container.querySelector('#attempts-left')
        if (attemptsLeft) {
          const remaining = params.maxAttempts - attempts
          attemptsLeft.textContent = remaining.toString()
          attemptsLeft.className = 'stat-value attempts-left'
          if (remaining <= 2) attemptsLeft.classList.add('danger')
          else if (remaining <= 3) attemptsLeft.classList.add('warning')
        }

        const progress = container.querySelector('#progress')
        if (progress) progress.textContent = `${calculateProgress()}%`

        const wrongLettersDisplay = container.querySelector('#wrong-letters')
        if (wrongLettersDisplay) {
          wrongLettersDisplay.textContent = Array.from(wrongLetters).join(' ').toUpperCase()
        }
      }

      function completeGame(won) {
        gameCompleted = true
        gameWon = won

        if (timer) clearInterval(timer)

        const input = container.querySelector('#letter-input')
        const button = container.querySelector('#guess-btn')
        if (input) input.disabled = true
        if (button) button.disabled = true

        const resultSection = container.querySelector('#result-section')
        const resultTitle = container.querySelector('#result-title')
        const resultMessage = container.querySelector('#result-message')
        
        if (resultSection && resultTitle && resultMessage) {
          resultSection.className = `result-section visible ${won ? 'result-success' : 'result-failure'}`
          
          if (won) {
            resultTitle.textContent = '🎉 축하합니다!'
            resultMessage.textContent = `단어를 맞추셨습니다! ${attempts}번의 시도로 성공했네요.`
          } else {
            resultTitle.textContent = '😔 아쉽네요'
            resultMessage.textContent = `정답은 "${params.word}" 였습니다. 다시 도전해보세요!`
          }
        }

        const score = won ? Math.max(0, (params.maxAttempts - attempts) / params.maxAttempts) : 0
        context.eventBus.emit({
          type: 'COMPLETE',
          activityId: context.activityId,
          payload: {
            success: won,
            score: Math.round(score * 100) / 100,
            attempts: attempts,
            word: params.word
          }
        })
      }

      function handleGuess() {
        if (gameCompleted) return

        const input = container.querySelector('#letter-input')
        const letter = input.value.toLowerCase().trim()

        if (!letter) {
          showFeedback('글자를 입력해주세요!', 'warning')
          return
        }

        if (guessedLetters.has(letter) || wrongLetters.has(letter)) {
          showFeedback('이미 시도한 글자입니다!', 'warning')
          input.value = ''
          input.focus()
          return
        }

        if (targetWord.includes(letter)) {
          guessedLetters.add(letter)
          showFeedback('정답입니다! 🎉', 'success')
          
          if (isWordComplete()) {
            completeGame(true)
          }
        } else {
          wrongLetters.add(letter)
          attempts++
          showFeedback('틀렸습니다! 😅', 'error')
          
          if (attempts >= params.showHintAfter) {
            const hintSection = container.querySelector('#hint-section')
            if (hintSection) hintSection.classList.add('visible')
          }
          
          if (attempts >= params.maxAttempts) {
            completeGame(false)
          }
        }

        updateDisplay()
        input.value = ''
        input.focus()

        context.eventBus.emit({
          type: 'PROGRESS',
          activityId: context.activityId,
          payload: { 
            progress: calculateProgress() / 100,
            attempts: attempts
          }
        })
      }

      // Render UI
      container.innerHTML = `
        <div class="word-guess-activity">
          <div class="word-guess-header">
            <h2 class="word-guess-title">🔤 단어 맞추기</h2>
            ${params.category ? `<span class="word-guess-category">${params.category}</span>` : ''}
          </div>
          
          <div class="word-display">
            <div class="word-letters" id="word-display">
              ${generateWordDisplay()}
            </div>
          </div>
          
          <div class="input-section">
            <input type="text" id="letter-input" class="letter-input" maxlength="1" placeholder="?" autocomplete="off">
            <button id="guess-btn" class="guess-btn">추측하기</button>
          </div>
          
          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-label">남은 기회</span>
              <span class="stat-value attempts-left" id="attempts-left">${params.maxAttempts}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">진행률</span>
              <span class="stat-value" id="progress">0%</span>
            </div>
            ${params.timeLimit ? `
              <div class="stat-item">
                <span class="stat-label">남은 시간</span>
                <span class="stat-value timer" id="timer">${formatTime(remainingTime)}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="wrong-letters">
            <div class="wrong-letters-title">틀린 글자</div>
            <div class="wrong-letters-list" id="wrong-letters"></div>
          </div>
          
          <div class="hint-section" id="hint-section">
            <div class="hint-title">💡 힌트</div>
            <div class="hint-text">${params.hint}</div>
          </div>
          
          <div class="result-section" id="result-section">
            <div class="result-title" id="result-title"></div>
            <div class="result-message" id="result-message"></div>
            <div class="result-word" id="result-word">${params.word}</div>
            <button class="restart-btn" id="restart-btn">다시 시작</button>
          </div>
        </div>
      `

      // Setup event listeners
      const letterInput = container.querySelector('#letter-input')
      const guessBtn = container.querySelector('#guess-btn')
      
      letterInput?.addEventListener('input', (e) => {
        const target = e.target
        target.value = target.value.replace(/[^가-힣a-zA-Z]/g, '').toLowerCase()
      })

      letterInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGuess()
      })

      guessBtn?.addEventListener('click', handleGuess)

      // Start timer if needed
      if (params.timeLimit && params.timeLimit > 0) {
        timer = setInterval(() => {
          remainingTime--
          const timerElement = container.querySelector('#timer')
          if (timerElement) {
            timerElement.textContent = formatTime(remainingTime)
            if (remainingTime <= 30) timerElement.style.color = '#ef4444'
            else if (remainingTime <= 60) timerElement.style.color = '#f59e0b'
          }
          if (remainingTime <= 0) completeGame(false)
        }, 1000)
      }

      letterInput?.focus()

      context.eventBus.emit({
        type: 'START',
        activityId: context.activityId,
        timestamp: startTime
      })
    },
    async unmount() {
      // Cleanup handled by container clearing
    },
    async getResult() {
      return { 
        score: this.gameWon ? 0.8 : 0,
        success: this.gameWon || false,
        durationMs: Date.now() - (this.startTime || Date.now()),
        details: { attempts: this.attempts || 0 }
      }
    }
  })
}

// Initialize all templates when module loads
registerBuiltInTemplates()
registerNewTemplates()
registerWordGuessTemplate()

// Export for use
export { LessonOrchestrator }