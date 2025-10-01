// Enhanced Lesson Platform - Modern ES6+ with Modular Sandbox Architecture
// Version 2.0 - Supports Enhanced Template Registry and Guardrail System

class EnhancedLessonPlatformApp {
  constructor() {
    this.currentLesson = null
    this.orchestrator = null
    this.templates = new Map()
    this.registryStats = null
    
    this.init()
  }

  async init() {
    console.log('🚀 Enhanced Lesson Platform v2.0 initializing...')
    
    // Check system health
    await this.checkSystemHealth()
    
    // Load available templates from enhanced registry
    await this.loadTemplatesCatalog()
    
    // Setup navigation
    this.setupNavigation()
    
    // Setup lesson loader
    this.setupLessonLoader()
    
    // Setup resize observer for responsive behavior
    this.setupResponsiveObserver()
    
    // Setup error boundaries
    this.setupErrorBoundaries()
    
    console.log('✅ Enhanced Lesson Platform ready!')
  }

  async checkSystemHealth() {
    try {
      const response = await fetch('/api/health')
      const health = await response.json()
      
      if (health.status === 'healthy') {
        console.log('🟢 System healthy:', health.version, health.architecture)
        console.log('📋 Features:', health.features)
        this.registryStats = health.registry
      } else {
        console.warn('🟡 System degraded:', health.error)
      }
    } catch (error) {
      console.error('🔴 System health check failed:', error)
    }
  }

  async loadTemplatesCatalog() {
    try {
      const response = await fetch('/api/templates')
      const apiData = await response.json()
      
      if (apiData.success && apiData.data) {
        apiData.data.forEach(templateInfo => {
          this.templates.set(templateInfo.manifest.id, templateInfo)
        })
        console.log(`📦 Loaded ${apiData.data.length} templates from registry`)
        console.log('📊 Registry stats:', apiData.stats)
        this.renderTemplatesCatalog(apiData.data)
      } else {
        // Fallback to legacy API
        await this.loadLegacyTemplates()
      }
    } catch (error) {
      console.error('Failed to load enhanced templates:', error)
      await this.loadLegacyTemplates()
    }
  }

  async loadLegacyTemplates() {
    try {
      console.log('🔄 Falling back to legacy template API...')
      const response = await fetch('/api/templates/legacy')
      const legacyData = await response.json()
      
      if (legacyData.success && legacyData.data) {
        const templates = legacyData.data.map(template => ({
          manifest: template,
          bundle: `builtin:${template.id.split('@')[0]}`,
          checksum: 'legacy',
          loadCount: 0,
          lastUsed: new Date()
        }))
        
        templates.forEach(templateInfo => {
          this.templates.set(templateInfo.manifest.id, templateInfo)
        })
        
        console.log(`📦 Loaded ${templates.length} templates (legacy mode)`)
        this.renderTemplatesCatalog(templates)
      }
    } catch (error) {
      console.error('Legacy template loading also failed:', error)
      this.showError('템플릿 카탈로그를 불러올 수 없습니다.')
    }
  }

  renderTemplatesCatalog(templates) {
    const catalogContainer = document.getElementById('templates-catalog')
    if (!catalogContainer) return
    
    // Enhanced template catalog with registry stats
    catalogContainer.innerHTML = `
      <div class="templates-header">
        <div class="templates-stats">
          <div class="stat-item">
            <span class="stat-label">전체 템플릿</span>
            <span class="stat-value">${templates.length}</span>
          </div>
          ${this.registryStats ? `
            <div class="stat-item">
              <span class="stat-label">로드된 모듈</span>
              <span class="stat-value">${this.registryStats.loadedModules}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">카테고리</span>
              <span class="stat-value">${this.registryStats.categories.length}</span>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="templates-grid"></div>
    `
    
    const templatesGrid = catalogContainer.querySelector('.templates-grid')
    
    // Group templates by category
    const categories = {}
    templates.forEach(templateInfo => {
      const manifest = templateInfo.manifest
      const category = manifest.category || 'other'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(templateInfo)
    })
    
    // Render categories
    Object.entries(categories).forEach(([category, templateList]) => {
      const categorySection = document.createElement('div')
      categorySection.className = 'template-category'
      categorySection.innerHTML = `
        <h4 class="category-title">
          ${this.getCategoryIcon(category)} ${this.getCategoryName(category)}
        </h4>
        <div class="template-cards"></div>
      `
      
      const cardsContainer = categorySection.querySelector('.template-cards')
      
      templateList.forEach(templateInfo => {
        const manifest = templateInfo.manifest
        const card = this.createTemplateCard(templateInfo)
        cardsContainer.appendChild(card)
      })
      
      templatesGrid.appendChild(categorySection)
    })
  }
  
  createTemplateCard(templateInfo) {
    const manifest = templateInfo.manifest
    const card = document.createElement('div')
    card.className = 'template-card'
    
    card.innerHTML = `
      <div class="template-card-header">
        <div class="template-icon">${this.getTemplateIcon(manifest.category)}</div>
        <div class="template-info">
          <h5 class="template-name">${manifest.name}</h5>
          <div class="template-meta">
            <span class="template-version">v${manifest.version}</span>
            <span class="template-category">${manifest.category}</span>
          </div>
        </div>
      </div>
      
      <div class="template-card-body">
        <div class="template-capabilities">
          ${manifest.capabilities.map(cap => 
            `<span class="capability-badge">${cap}</span>`
          ).join('')}
        </div>
        
        <div class="template-features">
          <div class="feature-item">
            <span class="feature-label">접근성</span>
            <span class="feature-value ${
              manifest.accessibility?.keyboardNavigation ? 'success' : 'warning'
            }">
              ${manifest.accessibility?.keyboardNavigation ? '✓ 지원' : '× 미지원'}
            </span>
          </div>
          <div class="feature-item">
            <span class="feature-label">성능</span>
            <span class="feature-value">${manifest.performance?.maxMemoryMB || 'N/A'}MB</span>
          </div>
          ${templateInfo.loadCount !== undefined ? `
            <div class="feature-item">
              <span class="feature-label">사용횟수</span>
              <span class="feature-value">${templateInfo.loadCount}회</span>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="template-card-actions">
        <button class="btn btn-primary btn-sm template-use-btn" 
                data-template-id="${manifest.id}">
          사용하기
        </button>
        <button class="btn btn-ghost btn-sm template-info-btn"
                data-template-id="${manifest.id}">
          정보
        </button>
      </div>
    `
    
    // Add event listeners
    const useBtn = card.querySelector('.template-use-btn')
    const infoBtn = card.querySelector('.template-info-btn')
    
    useBtn.addEventListener('click', () => {
      this.openBuilderWithTemplate(manifest.id)
    })
    
    infoBtn.addEventListener('click', () => {
      this.showTemplateInfo(templateInfo)
    })
    
    return card
  }
  
  getCategoryIcon(category) {
    const icons = {
      'assessment': '📝',
      'media': '🎥',
      'interaction': '🎮',
      'presentation': '📊',
      'collaboration': '🤝',
      'other': '📦'
    }
    return icons[category] || icons.other
  }
  
  getCategoryName(category) {
    const names = {
      'assessment': '평가',
      'media': '미디어',
      'interaction': '상호작용',
      'presentation': '프레젠테이션',
      'collaboration': '협업',
      'other': '기타'
    }
    return names[category] || category
  }
  
  getTemplateIcon(category) {
    const icons = {
      'assessment': '📝',
      'media': '🎥', 
      'interaction': '🎮',
      'presentation': '📊',
      'collaboration': '🤝'
    }
    return icons[category] || '📦'
  }
  
  openBuilderWithTemplate(templateId) {
    // Switch to builder tab and initialize with selected template
    this.switchTab('builder')
    
    // Initialize builder with template (implement in builder.js)
    if (window.lessonBuilder) {
      window.lessonBuilder.addTemplate(templateId)
    }
    
    this.showNotification('빌더에 템플릿이 추가되었습니다.', 'success')
  }
  
  async showTemplateInfo(templateInfo) {
    const manifest = templateInfo.manifest
    
    // Create modal with template information
    const modal = document.createElement('div')
    modal.className = 'modal active'
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${this.getTemplateIcon(manifest.category)} ${manifest.name}</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="template-detail-info">
            <div class="info-section">
              <h4>기본 정보</h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">ID</span>
                  <code class="info-value">${manifest.id}</code>
                </div>
                <div class="info-item">
                  <span class="info-label">버전</span>
                  <span class="info-value">${manifest.version}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">카테고리</span>
                  <span class="info-value">${manifest.category}</span>
                </div>
              </div>
            </div>
            
            <div class="info-section">
              <h4>기능 및 접근성</h4>
              <div class="capabilities-list">
                ${manifest.capabilities.map(cap => 
                  `<span class="capability-tag">${cap}</span>`
                ).join('')}
              </div>
              
              <div class="accessibility-info">
                <div class="accessibility-item ${
                  manifest.accessibility?.keyboardNavigation ? 'supported' : 'not-supported'
                }">
                  <span class="accessibility-icon">
                    ${manifest.accessibility?.keyboardNavigation ? '✓' : '×'}
                  </span>
                  키보드 내비게이션
                </div>
                <div class="accessibility-item ${
                  manifest.accessibility?.screenReader ? 'supported' : 'not-supported'
                }">
                  <span class="accessibility-icon">
                    ${manifest.accessibility?.screenReader ? '✓' : '×'}
                  </span>
                  스크린 리더
                </div>
                <div class="accessibility-item ${
                  manifest.accessibility?.highContrast ? 'supported' : 'not-supported'
                }">
                  <span class="accessibility-icon">
                    ${manifest.accessibility?.highContrast ? '✓' : '×'}
                  </span>
                  고대비 모드
                </div>
              </div>
            </div>
            
            <div class="info-section">
              <h4>성능 요구사항</h4>
              <div class="performance-info">
                <div class="performance-item">
                  <span class="performance-label">최대 로드 시간</span>
                  <span class="performance-value">${manifest.performance?.maxLoadTimeMs || 'N/A'}ms</span>
                </div>
                <div class="performance-item">
                  <span class="performance-label">최대 메모리</span>
                  <span class="performance-value">${manifest.performance?.maxMemoryMB || 'N/A'}MB</span>
                </div>
              </div>
            </div>
            
            ${templateInfo.loadCount !== undefined ? `
              <div class="info-section">
                <h4>사용 통계</h4>
                <div class="usage-stats">
                  <div class="stat-item">
                    <span class="stat-label">로드 횟수</span>
                    <span class="stat-value">${templateInfo.loadCount}회</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">마지막 사용</span>
                    <span class="stat-value">${new Date(templateInfo.lastUsed).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              </div>
            ` : ''}
            
            <div class="info-section">
              <h4>파라미터 스키마</h4>
              <pre class="schema-preview"><code>${JSON.stringify(manifest.paramsSchema, null, 2)}</code></pre>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()">확인</button>
        </div>
      </div>
    `
    
    // Add close functionality
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove())
    modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.remove())
    
    document.body.appendChild(modal)
  }
  
  setupErrorBoundaries() {
    // Global error handler for enhanced error reporting
    window.addEventListener('error', (event) => {
      console.error('🚨 Global error caught:', event.error)
      this.handleGlobalError(event.error)
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason)
      this.handleGlobalError(event.reason)
    })
  }
  
  handleGlobalError(error) {
    // Show user-friendly error message
    this.showNotification('예상치 못한 오류가 발생했습니다. 페이지를 새로고침해 주세요.', 'error')
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link')
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const tabName = link.dataset.tab
        this.switchTab(tabName)
      })
    })
  }
  
  switchTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.tab === tabName)
    })
    
    // Update panels
    document.querySelectorAll('.content-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.panel === tabName)
    })
  }
  
  setupLessonLoader() {
    // Enhanced lesson loader with API integration
    const sampleSelect = document.getElementById('sample-lesson-select')
    const loadBtn = document.getElementById('load-selected-sample-btn')
    const fileInput = document.getElementById('lesson-file-input')
    const dropZone = document.getElementById('lesson-drop-zone')
    
    // Sample lesson selection
    sampleSelect?.addEventListener('change', () => {
      loadBtn.disabled = !sampleSelect.value
    })
    
    loadBtn?.addEventListener('click', async () => {
      const selectedLesson = sampleSelect.value
      if (selectedLesson) {
        await this.loadSampleLesson(selectedLesson)
      }
    })
    
    // File upload
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        this.loadLessonFromFile(file)
      }
    })
    
    // Drag and drop
    dropZone?.addEventListener('dragover', (e) => {
      e.preventDefault()
      dropZone.classList.add('drag-over')
    })
    
    dropZone?.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over')
    })
    
    dropZone?.addEventListener('drop', (e) => {
      e.preventDefault()
      dropZone.classList.remove('drag-over')
      
      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.loadLessonFromFile(files[0])
      }
    })
  }
  
  async loadSampleLesson(lessonId) {
    try {
      this.showNotification('레슨을 로드하고 있습니다...', 'info')
      
      // Try enhanced API first
      let response = await fetch(`/api/lesson/${lessonId.replace('.json', '')}`)
      let lessonData
      
      if (response.ok) {
        const apiData = await response.json()
        lessonData = apiData.success ? apiData.data : apiData
      } else {
        // Fallback to legacy lesson files
        response = await fetch(`/lessons/${lessonId}`)
        if (response.ok) {
          const legacyData = await response.json()
          lessonData = legacyData.success ? legacyData.data : legacyData
        } else {
          throw new Error(`Failed to load lesson: ${response.status}`)
        }
      }
      
      await this.startLesson(lessonData)
      this.showNotification('레슨이 성공적으로 로드되었습니다.', 'success')
      
    } catch (error) {
      console.error('Failed to load sample lesson:', error)
      this.showNotification('레슨 로드에 실패했습니다: ' + error.message, 'error')
    }
  }
  
  async loadLessonFromFile(file) {
    try {
      if (!file.type.includes('json')) {
        throw new Error('JSON 파일만 지원됩니다.')
      }
      
      const text = await file.text()
      const lessonData = JSON.parse(text)
      
      await this.startLesson(lessonData)
      this.showNotification('파일에서 레슨이 로드되었습니다.', 'success')
      
    } catch (error) {
      console.error('Failed to load lesson from file:', error)
      this.showNotification('파일 로드에 실패했습니다: ' + error.message, 'error')
    }
  }
  
  async startLesson(lessonData) {
    try {
      // Initialize enhanced orchestrator  
      if (this.orchestrator) {
        await this.orchestrator.cleanup()
      }
      
      // For now, use a mock orchestrator until the full implementation is ready
      const container = document.getElementById('activity-container')
      this.orchestrator = {
        async loadLesson(data) {
          console.log('Mock orchestrator loading lesson:', data)
          container.innerHTML = `
            <div class="enhanced-lesson-preview">
              <div class="lesson-header">
                <h3>${data.title}</h3>
                <p>${data.description || 'Enhanced Modular Lesson'}</p>
              </div>
              <div class="lesson-activities">
                ${data.flow.map((activity, index) => `
                  <div class="activity-preview" data-index="${index}">
                    <div class="activity-icon">${this.getTemplateIcon(this.getTemplateCategory(activity.template))}</div>
                    <div class="activity-info">
                      <div class="activity-name">${activity.activityId}</div>
                      <div class="activity-template">${activity.template}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
              <div class="enhanced-features">
                <div class="feature-badge">🛡️ Enhanced Sandbox</div>
                <div class="feature-badge">🔒 Guardrail System</div>
                <div class="feature-badge">📊 Resource Monitoring</div>
                <div class="feature-badge">🔄 Auto Recovery</div>
              </div>
            </div>
          `
        },
        
        async cleanup() {
          console.log('Mock orchestrator cleanup')
        },
        
        getLessonSummary() {
          return {
            lessonId: lessonData.lessonId,
            totalScore: 0.85,
            passed: true,
            duration: 300000,
            activities: lessonData.flow.map(activity => ({
              activityId: activity.activityId,
              template: activity.template,
              result: { score: 0.8 }
            })),
            sandboxStats: {
              activeModules: 5,
              errorRecoveryAttempts: 0
            }
          }
        }
      }
      
      await this.orchestrator.loadLesson(lessonData)
      this.currentLesson = lessonData
      
      // Update UI
      this.updateLessonInfo(lessonData)
      this.showLessonControls()
      
    } catch (error) {
      console.error('Failed to start lesson:', error)
      throw error
    }
  }
  
  updateLessonInfo(lessonData) {
    // Update lesson info display
    const infoSection = document.getElementById('lesson-info-section')
    const titleEl = document.getElementById('lesson-title')
    const subtitleEl = document.getElementById('lesson-subtitle')
    const activitiesList = document.getElementById('activities-list')
    
    if (titleEl) titleEl.textContent = lessonData.title
    if (subtitleEl) {
      subtitleEl.textContent = `${lessonData.flow.length}개 활동 • 예상 시간: ${lessonData.metadata?.estimatedTime || 15}분`
    }
    
    // Show activities list
    if (activitiesList) {
      activitiesList.innerHTML = lessonData.flow.map((activity, index) => `
        <div class="activity-item" data-activity-index="${index}">
          <div class="activity-icon">${this.getTemplateIcon(this.getTemplateCategory(activity.template))}</div>
          <div class="activity-info">
            <div class="activity-name">${activity.activityId}</div>
            <div class="activity-template">${activity.template}</div>
          </div>
          <div class="activity-status" id="activity-status-${index}">
            <div class="status-dot status-pending"></div>
          </div>
        </div>
      `).join('')
    }
    
    if (infoSection) infoSection.style.display = 'block'
  }
  
  getTemplateCategory(templateId) {
    const templateInfo = this.templates.get(templateId)
    return templateInfo?.manifest?.category || 'other'
  }
  
  showLessonControls() {
    const controlsEl = document.getElementById('lesson-controls')
    if (controlsEl) {
      controlsEl.style.display = 'block'
    }
    
    // Setup control buttons
    this.setupLessonControlButtons()
  }
  
  setupLessonControlButtons() {
    const prevBtn = document.getElementById('btn-previous')
    const nextBtn = document.getElementById('btn-next')
    const restartBtn = document.getElementById('btn-restart')
    const finishBtn = document.getElementById('btn-finish')
    
    prevBtn?.addEventListener('click', async () => {
      if (this.orchestrator?.previous) {
        await this.orchestrator.previous()
      }
    })
    
    nextBtn?.addEventListener('click', async () => {
      if (this.orchestrator?.next) {
        await this.orchestrator.next()
      }
    })
    
    restartBtn?.addEventListener('click', async () => {
      if (this.orchestrator && this.currentLesson) {
        await this.orchestrator.loadLesson(this.currentLesson)
      }
    })
    
    finishBtn?.addEventListener('click', () => {
      this.showLessonSummary()
    })
  }
  
  showLessonSummary() {
    if (!this.orchestrator) return
    
    const summary = this.orchestrator.getLessonSummary()
    
    // Create summary modal
    const modal = document.createElement('div')
    modal.className = 'modal active'
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content large">
        <div class="modal-header">
          <h3 class="modal-title">📈 레슨 요약</h3>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <div class="lesson-summary">
            <div class="summary-header">
              <div class="score-display ${
                summary.passed ? 'passed' : 'failed'
              }">
                <div class="score-value">${Math.round(summary.totalScore * 100)}%</div>
                <div class="score-label">최종 점수</div>
              </div>
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-label">소요 시간</span>
                  <span class="stat-value">${Math.round(summary.duration / 1000 / 60)}분</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">합격 여부</span>
                  <span class="stat-value ${summary.passed ? 'success' : 'error'}">
                    ${summary.passed ? '합격' : '불합격'}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="activities-results">
              <h4>활동별 결과</h4>
              ${summary.activities.map((activity, index) => `
                <div class="activity-result">
                  <div class="activity-info">
                    <div class="activity-name">${activity.activityId}</div>
                    <div class="activity-template">${activity.template}</div>
                  </div>
                  <div class="activity-score">
                    ${activity.result ? `
                      <span class="score">${Math.round(activity.result.score * 100)}%</span>
                    ` : '<span class="score na">N/A</span>'}
                  </div>
                </div>
              `).join('')}
            </div>
            
            ${summary.sandboxStats ? `
              <div class="system-stats">
                <h4>시스템 통계</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">활성 모듈</span>
                    <span class="stat-value">${summary.sandboxStats.activeModules}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">오류 복구</span>
                    <span class="stat-value">${summary.errorRecoveryAttempts || 0}회</span>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">닫기</button>
          <button class="btn btn-primary" id="download-results-btn">결과 다운로드</button>
        </div>
      </div>
    `
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove())
    modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.remove())
    
    modal.querySelector('#download-results-btn').addEventListener('click', () => {
      this.downloadResults(summary)
    })
    
    document.body.appendChild(modal)
  }
  
  downloadResults(summary) {
    const dataStr = JSON.stringify(summary, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `lesson-results-${summary.lessonId}-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }
  
  setupResponsiveObserver() {
    // Enhanced responsive behavior
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const { width } = entry.contentRect
        document.documentElement.classList.toggle('mobile', width < 768)
        document.documentElement.classList.toggle('tablet', width >= 768 && width < 1024)
        document.documentElement.classList.toggle('desktop', width >= 1024)
      })
    })
    
    observer.observe(document.documentElement)
  }
  
  showNotification(message, type = 'info') {
    const container = document.getElementById('notifications-container') || this.createNotificationContainer()
    
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close">×</button>
      </div>
    `
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.remove()
    })
    
    container.appendChild(notification)
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 5000)
  }
  
  createNotificationContainer() {
    const container = document.createElement('div')
    container.id = 'notifications-container'
    container.className = 'notifications-container'
    document.body.appendChild(container)
    return container
  }
  
  getNotificationIcon(type) {
    const icons = {
      'info': '📝',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌'
    }
    return icons[type] || icons.info
  }
  
  showError(message) {
    this.showNotification(message, 'error')
  }
}

// Initialize enhanced app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.enhancedApp = new EnhancedLessonPlatformApp()
  })
} else {
  window.enhancedApp = new EnhancedLessonPlatformApp()
}