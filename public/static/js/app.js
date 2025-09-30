// Main Application JavaScript - Modern ES6+ Implementation

class LessonPlatformApp {
  constructor() {
    this.currentLesson = null
    this.orchestrator = null
    this.templates = new Map()
    
    this.init()
  }

  async init() {
    console.log('🚀 Lesson Platform initializing...')
    
    // Load available templates
    await this.loadTemplatesCatalog()
    
    // Setup navigation
    this.setupNavigation()
    
    // Setup lesson loader
    this.setupLessonLoader()
    
    // Setup resize observer for responsive behavior
    this.setupResponsiveObserver()
    
    console.log('✅ Lesson Platform ready!')
  }

  async loadTemplatesCatalog() {
    try {
      const response = await fetch('/api/templates')
      const data = await response.json()
      
      if (data.templates) {
        data.templates.forEach(template => {
          this.templates.set(template.id, template)
        })
        console.log(`📦 Loaded ${data.templates.length} templates`)
        this.renderTemplatesCatalog(data.templates)
      }
    } catch (error) {
      console.error('Failed to load templates catalog:', error)
      this.showError('템플릿 카탈로그를 불러올 수 없습니다.')
    }
  }

  renderTemplatesCatalog(templates) {
    const catalogContainer = document.getElementById('templates-catalog')
    if (!catalogContainer) return

    catalogContainer.innerHTML = `
      <div class="templates-grid">
        ${templates.map(template => `
          <div class="template-card card">
            <div class="card-header">
              <h4 class="card-title">${template.name}</h4>
              <span class="badge badge-primary">${template.category}</span>
            </div>
            <div class="template-info">
              <p class="text-sm text-secondary mb-3">
                ${template.paramsSchema.description || 'Interactive learning template'}
              </p>
              <div class="capabilities">
                ${template.capabilities.map(cap => 
                  `<span class="badge badge-success">${cap}</span>`
                ).join('')}
              </div>
            </div>
            <div class="template-actions">
              <button class="btn btn-secondary btn-sm" onclick="app.previewTemplate('${template.id}')">
                미리보기
              </button>
              <button class="btn btn-primary btn-sm" onclick="app.useTemplate('${template.id}')">
                사용하기
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  setupNavigation() {
    // Tab navigation
    const navLinks = document.querySelectorAll('[data-tab]')
    const tabPanels = document.querySelectorAll('[data-panel]')
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const target = link.getAttribute('data-tab')
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'))
        tabPanels.forEach(p => p.classList.remove('active'))
        
        link.classList.add('active')
        document.querySelector(`[data-panel="${target}"]`)?.classList.add('active')
        
        // Update URL hash
        window.location.hash = target
      })
    })

    // Handle initial hash
    const hash = window.location.hash.slice(1)
    if (hash) {
      const targetLink = document.querySelector(`[data-tab="${hash}"]`)
      if (targetLink) {
        targetLink.click()
      }
    }
  }

  setupLessonLoader() {
    // Sample lesson loader
    const sampleBtn = document.getElementById('load-sample-btn')
    sampleBtn?.addEventListener('click', () => this.loadSampleLesson())
    
    // File input loader
    const fileInput = document.getElementById('lesson-file-input')
    fileInput?.addEventListener('change', (e) => this.loadLessonFromFile(e.target.files[0]))
    
    // Drag and drop
    const dropZone = document.getElementById('lesson-drop-zone')
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault()
        dropZone.classList.add('drag-over')
      })
      
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over')
      })
      
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault()
        dropZone.classList.remove('drag-over')
        const file = e.dataTransfer.files[0]
        if (file && file.type === 'application/json') {
          this.loadLessonFromFile(file)
        }
      })
    }
  }

  async loadSampleLesson() {
    const sampleLesson = {
      lessonId: 'demo-lesson-001',
      title: '영어 기초 - 비교급 학습',
      locale: 'ko',
      version: '1.0.0',
      flow: [
        {
          activityId: 'intro-video',
          template: 'video@2.0.0',
          params: {
            src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            autoplay: false,
            controls: true,
            poster: 'https://via.placeholder.com/800x450/1e293b/e6edf7?text=Intro+Video'
          },
          rules: {
            scoreWeight: 1,
            required: true
          }
        },
        {
          activityId: 'drag-drop-exercise',
          template: 'drag-drop-choices@2.0.0',
          params: {
            prompt: 'Complete the sentence: He is ___ than his brother.',
            choices: ['taller', 'tall', 'tallest', 'more tall'],
            answer: 'taller',
            image: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Height+Comparison',
            allowMultiple: false,
            shuffleChoices: true,
            maxAttempts: 3,
            showFeedback: true,
            hints: [
              '비교급을 사용해보세요.',
              'than이 있으면 비교급입니다.',
              'tall의 비교급은 taller입니다.'
            ]
          },
          rules: {
            scoreWeight: 2,
            required: true,
            timeoutSec: 120
          }
        }
      ],
      grading: {
        mode: 'weighted-sum',
        passLine: 0.7,
        showScores: true,
        showProgress: true
      },
      metadata: {
        author: 'Education Team',
        createdAt: new Date().toISOString(),
        tags: ['english', 'grammar', 'comparative'],
        difficulty: 'beginner',
        estimatedTime: 10
      }
    }

    await this.loadLesson(sampleLesson)
  }

  async loadLessonFromFile(file) {
    if (!file) return
    
    try {
      const text = await file.text()
      const lessonData = JSON.parse(text)
      await this.loadLesson(lessonData)
    } catch (error) {
      console.error('Failed to load lesson from file:', error)
      this.showError('레슨 파일을 읽을 수 없습니다. JSON 형식을 확인해주세요.')
    }
  }

  async loadLesson(lessonData) {
    try {
      this.showLoading('레슨을 불러오는 중...')
      
      // Validate lesson data
      this.validateLessonData(lessonData)
      
      // Create orchestrator if not exists
      if (!this.orchestrator) {
        const container = document.getElementById('activity-container')
        if (!container) {
          throw new Error('Activity container not found')
        }
        
        // Import orchestrator dynamically
        const orchestratorModule = await import('./orchestrator.js')
        const LessonOrchestrator = orchestratorModule.LessonOrchestrator
        
        this.orchestrator = new LessonOrchestrator({
          container,
          userId: 'demo-user',
          locale: lessonData.locale || 'ko',
          debug: true
        })
        
        this.setupOrchestratorEvents()
      }
      
      // Load lesson
      await this.orchestrator.loadLesson(lessonData)
      this.currentLesson = lessonData
      
      // Update UI
      this.updateLessonInfo(lessonData)
      this.updateLessonControls()
      
      // Navigate to player tab
      document.querySelector('[data-tab=\"player\"]')?.click()
      
      this.hideLoading()
      this.showSuccess('레슨이 성공적으로 로드되었습니다!')
      
    } catch (error) {
      console.error('Failed to load lesson:', error)
      this.hideLoading()
      this.showError(`레슨 로드 실패: ${error.message}`)
    }
  }

  validateLessonData(lessonData) {
    if (!lessonData.lessonId) {
      throw new Error('lessonId is required')
    }
    
    if (!lessonData.flow || !Array.isArray(lessonData.flow) || lessonData.flow.length === 0) {
      throw new Error('flow is required and must be a non-empty array')
    }
    
    lessonData.flow.forEach((step, index) => {
      if (!step.activityId) {
        throw new Error(`flow[${index}].activityId is required`)
      }
      if (!step.template) {
        throw new Error(`flow[${index}].template is required`)
      }
      if (!step.params || typeof step.params !== 'object') {
        throw new Error(`flow[${index}].params is required and must be an object`)
      }
    })
  }

  setupOrchestratorEvents() {
    if (!this.orchestrator) return
    
    this.orchestrator.eventBus.on('activity-loaded', (event) => {
      console.log('Activity loaded:', event.payload)
      this.updateActivityInfo(event.payload)
    })
    
    this.orchestrator.eventBus.on('progress', (event) => {
      this.updateProgressBar(event.payload.lessonProgress)
    })
    
    this.orchestrator.eventBus.on('completed', (event) => {
      console.log('Lesson completed:', event.payload)
      this.showLessonResults(event.payload)
    })
    
    this.orchestrator.eventBus.on('*', (event) => {
      // Log all events for debugging
      if (event.type !== 'PROGRESS') {
        console.log(`Event: ${event.type}`, event)
      }
    })
  }

  updateLessonInfo(lessonData) {
    const titleEl = document.getElementById('lesson-title')
    const subtitleEl = document.getElementById('lesson-subtitle')
    const progressEl = document.getElementById('lesson-progress')
    
    if (titleEl) titleEl.textContent = lessonData.title || lessonData.lessonId
    if (subtitleEl) {
      subtitleEl.textContent = `${lessonData.flow.length}개 활동 • ${lessonData.metadata?.estimatedTime || '?'}분`
    }
    if (progressEl) {
      progressEl.innerHTML = `
        <div class="progress">
          <div class="progress-bar" id="progress-bar" style="width: 0%"></div>
        </div>
      `
    }
  }

  updateActivityInfo(activityData) {
    const activityInfoEl = document.getElementById('current-activity-info')
    if (activityInfoEl) {
      activityInfoEl.innerHTML = `
        <div class="activity-info-card">
          <h4>현재 활동</h4>
          <p><strong>ID:</strong> ${activityData.activityId}</p>
          <p><strong>템플릿:</strong> ${activityData.template}</p>
        </div>
      `
    }
  }

  updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar')
    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`
    }
  }

  updateLessonControls() {
    // Setup lesson control buttons
    const prevBtn = document.getElementById('btn-previous')
    const nextBtn = document.getElementById('btn-next')
    const restartBtn = document.getElementById('btn-restart')
    const finishBtn = document.getElementById('btn-finish')
    
    if (prevBtn) {
      prevBtn.onclick = () => this.orchestrator?.previous()
    }
    if (nextBtn) {
      nextBtn.onclick = () => this.orchestrator?.next()
    }
    if (restartBtn) {
      restartBtn.onclick = () => this.restartLesson()
    }
    if (finishBtn) {
      finishBtn.onclick = () => this.finishLesson()
    }
  }

  async restartLesson() {
    if (this.currentLesson && this.orchestrator) {
      await this.orchestrator.loadLesson(this.currentLesson)
      this.showInfo('레슨을 다시 시작합니다.')
    }
  }

  async finishLesson() {
    if (this.orchestrator) {
      const results = this.orchestrator.getLessonSummary()
      this.showLessonResults(results)
    }
  }

  showLessonResults(results) {
    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    modal.innerHTML = `
      <div class="modal-content card">
        <div class="card-header">
          <h3 class="card-title">레슨 완료!</h3>
        </div>
        <div class="results-content">
          <div class="score-display">
            <div class="score-circle ${results.passed ? 'success' : 'warning'}">
              <span class="score-value">${Math.round(results.totalScore * 100)}%</span>
            </div>
            <p class="score-status">
              ${results.passed ? '🎉 합격!' : '📚 더 연습이 필요해요'}
            </p>
          </div>
          
          <div class="activities-summary">
            <h4>활동별 결과</h4>
            <div class="activities-list">
              ${results.activities.map(activity => `
                <div class="activity-result">
                  <span class="activity-name">${activity.activityId}</span>
                  <span class="activity-score ${activity.result?.score >= 0.7 ? 'success' : 'warning'}">
                    ${activity.result ? Math.round(activity.result.score * 100) : 0}%
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="lesson-stats">
            <div class="stat">
              <span class="stat-label">소요 시간</span>
              <span class="stat-value">${this.formatDuration(results.duration)}</span>
            </div>
            <div class="stat">
              <span class="stat-label">통과 기준</span>
              <span class="stat-value">${Math.round(results.passLine * 100)}%</span>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
            닫기
          </button>
          <button class="btn btn-primary" onclick="app.restartLesson(); this.closest('.modal-overlay').remove()">
            다시 시작
          </button>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Auto close after 10 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove()
      }
    }, 10000)
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}분 ${remainingSeconds}초`
    }
    return `${remainingSeconds}초`
  }

  setupResponsiveObserver() {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect
        
        document.body.classList.toggle('mobile', width < 768)
        document.body.classList.toggle('tablet', width >= 768 && width < 1024)
        document.body.classList.toggle('desktop', width >= 1024)
      }
    })
    
    observer.observe(document.body)
  }

  // Utility methods for UI feedback
  showLoading(message = '로딩 중...') {
    this.removeNotifications()
    
    const loading = document.createElement('div')
    loading.id = 'app-loading'
    loading.className = 'notification loading'
    loading.innerHTML = `
      <div class="notification-content">
        <div class="loading-spinner"></div>
        <span>${message}</span>
      </div>
    `
    
    document.body.appendChild(loading)
  }

  hideLoading() {
    const loading = document.getElementById('app-loading')
    if (loading) {
      loading.remove()
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success')
  }

  showError(message) {
    this.showNotification(message, 'error')
  }

  showInfo(message) {
    this.showNotification(message, 'info')
  }

  showNotification(message, type = 'info') {
    this.removeNotifications()
    
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close" onclick="this.closest('.notification').remove()">×</button>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 5000)
  }

  removeNotifications() {
    document.querySelectorAll('.notification').forEach(n => n.remove())
  }

  // Template management methods
  async previewTemplate(templateId) {
    console.log('Previewing template:', templateId)
    // TODO: Implement template preview
  }

  async useTemplate(templateId) {
    console.log('Using template:', templateId)
    // TODO: Navigate to builder with selected template
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new LessonPlatformApp()
})

// Export for module usage
export { LessonPlatformApp }