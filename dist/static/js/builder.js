// Lesson Builder - Visual Lesson Creation Interface

class LessonBuilder {
  constructor(container) {
    this.templates = new Map()
    this.currentLesson = null
    this.selectedActivity = -1
    this.container = container
    this.isDirty = false
    this.init()
  }

  async init() {
    await this.loadTemplates()
    this.render()
    this.setupEventListeners()
  }

  async loadTemplates() {
    try {
      const response = await fetch('/api/templates')
      const data = await response.json()

      if (data.templates) {
        for (const template of data.templates) {
          const builderTemplate = {
            manifest: template,
            defaultParams: this.generateDefaultParams(template.paramsSchema),
            configForm: this.generateFormFields(template.paramsSchema)
          }
          this.templates.set(template.id, builderTemplate)
        }
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  generateDefaultParams(schema) {
    const params = {}
    
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]) => {
        if (prop.default !== undefined) {
          params[key] = prop.default
        } else if (prop.type === 'string') {
          params[key] = ''
        } else if (prop.type === 'number') {
          params[key] = 0
        } else if (prop.type === 'boolean') {
          params[key] = false
        } else if (prop.type === 'array') {
          params[key] = []
        } else if (prop.type === 'object') {
          params[key] = {}
        }
      })
    }

    return params
  }

  generateFormFields(schema) {
    const fields = []

    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]) => {
        const field = {
          name: key,
          type: this.mapSchemaTypeToFormType(prop),
          label: prop.title || this.humanizeKey(key),
          description: prop.description,
          required: schema.required?.includes(key) || false,
          default: prop.default
        }

        // Add validation rules
        if (prop.minimum !== undefined || prop.maximum !== undefined) {
          field.validation = {
            min: prop.minimum,
            max: prop.maximum
          }
        }

        if (prop.pattern) {
          field.validation = { ...field.validation, pattern: prop.pattern }
        }

        // Add options for enum/select fields
        if (prop.enum) {
          field.type = 'select'
          field.options = prop.enum.map((value) => ({
            value,
            label: this.humanizeKey(value.toString())
          }))
        }

        fields.push(field)
      })
    }

    return fields
  }

  mapSchemaTypeToFormType(prop) {
    switch (prop.type) {
      case 'string':
        if (prop.format === 'color') return 'color'
        if (prop.format === 'uri' && prop.description?.includes('image')) return 'file'
        return 'text'
      case 'number':
      case 'integer':
        return 'number'
      case 'boolean':
        return 'boolean'
      case 'array':
        return 'array'
      case 'object':
        return 'object'
      default:
        return 'text'
    }
  }

  humanizeKey(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase())
  }

  render() {
    this.container.innerHTML = `
      <div class="lesson-builder">
        <!-- Builder Header -->
        <div class="builder-header">
          <div class="builder-title-section">
            <h2 class="builder-title">🛠️ 레슨 빌더</h2>
            <div class="builder-actions">
              <button class="btn btn-ghost" id="new-lesson-btn">
                📄 새 레슨
              </button>
              <button class="btn btn-secondary" id="load-lesson-btn">
                📁 불러오기
              </button>
              <button class="btn btn-success" id="save-lesson-btn" disabled>
                💾 저장
              </button>
              <button class="btn btn-primary" id="preview-lesson-btn" disabled>
                👁️ 미리보기
              </button>
            </div>
          </div>
        </div>

        <!-- Builder Layout -->
        <div class="builder-layout">
          <!-- Live Preview Area -->
          <div class="preview-area">
            <div class="preview-header">
              <h3>👁️ 실시간 미리보기</h3>
              <div class="preview-controls">
                <button class="btn btn-sm btn-secondary" id="refresh-preview-btn">🔄 새로고침</button>
              </div>
            </div>
            <div class="preview-container">
              <div id="activity-preview-container" class="activity-preview">
                <div class="preview-placeholder">
                  <div class="placeholder-content">
                    <div class="placeholder-icon">👁️</div>
                    <h4>미리보기</h4>
                    <p>활동을 선택하고 저장하면 여기에서 미리보기를 확인할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lesson Canvas -->
          <main class="lesson-canvas">
            <div class="canvas-header">
              <div class="lesson-info">
                <input type="text" placeholder="레슨 제목을 입력하세요" class="lesson-title-input" id="lesson-title-input">
                <textarea placeholder="레슨 설명을 입력하세요" class="lesson-description-input" id="lesson-description-input" rows="2"></textarea>
              </div>
            </div>
            
            <div class="activities-flow" id="activities-flow">
              <div class="flow-placeholder">
                <div class="placeholder-content">
                  <div class="placeholder-icon">🎯</div>
                  <h4>레슨을 구성하세요</h4>
                  <p>아래 템플릿을 끌어다 놓거나 클릭하여 액티비티를 추가하세요.</p>
                </div>
              </div>
            </div>
            
            <!-- Templates Palette (Moved under canvas) -->
            <div class="templates-palette">
              <div class="palette-header">
                <h3>📦 액티비티 템플릿</h3>
                <input type="search" placeholder="템플릿 검색..." class="search-input" id="template-search">
              </div>
              <div class="templates-list" id="templates-list">
                ${this.renderTemplatesPalette()}
              </div>
            </div>
          </main>

          <!-- Property Editor -->
          <aside class="property-editor">
            <div class="editor-header">
              <h3>⚙️ 속성 편집기</h3>
            </div>
            <div class="editor-content" id="property-editor-content">
              <div class="editor-placeholder">
                <p>활동을 선택하면 속성을 편집할 수 있습니다.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    `
  }

  renderTemplatesPalette() {
    const categories = new Map()
    
    // Group templates by category
    this.templates.forEach(template => {
      const category = template.manifest.category
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category).push(template)
    })

    let html = ''
    categories.forEach((templates, category) => {
      html += `
        <div class="template-category">
          <h4 class="category-title">${this.humanizeKey(category)}</h4>
          <div class="category-templates">
            ${templates.map(template => `
              <div class="template-item" 
                   data-template-id="${template.manifest.id}"
                   draggable="true">
                <div class="template-icon">
                  ${this.getTemplateIcon(template.manifest.category)}
                </div>
                <div class="template-info">
                  <div class="template-name">${template.manifest.name}</div>
                  <div class="template-capabilities">
                    ${template.manifest.capabilities.slice(0, 3).map(cap => 
                      `<span class="capability-tag">${cap}</span>`
                    ).join('')}
                  </div>
                </div>
                <div class="template-actions">
                  <button class="btn-icon btn-sm" onclick="event.stopPropagation(); window.builder.addActivity('${template.manifest.id}')" title="추가">
                    ➕
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `
    })

    return html
  }

  getTemplateIcon(category) {
    const icons = {
      'media': '🎥',
      'interaction': '🎯',
      'assessment': '📝',
      'text': '📄',
      'audio': '🎵',
      'game': '🎮',
      'simulation': '⚗️'
    }
    return icons[category] || '🧩'
  }

  setupEventListeners() {
    // New lesson
    document.getElementById('new-lesson-btn')?.addEventListener('click', () => {
      this.createNewLesson()
    })

    // Load lesson
    document.getElementById('load-lesson-btn')?.addEventListener('click', () => {
      this.loadLesson()
    })

    // Save lesson
    document.getElementById('save-lesson-btn')?.addEventListener('click', () => {
      this.saveLesson()
    })

    // Preview lesson
    document.getElementById('preview-lesson-btn')?.addEventListener('click', () => {
      this.previewLesson()
    })

    // Refresh preview
    document.getElementById('refresh-preview-btn')?.addEventListener('click', () => {
      this.previewCurrentActivity()
    })

    // Template search
    document.getElementById('template-search')?.addEventListener('input', (e) => {
      const query = e.target.value
      this.filterTemplates(query)
    })

    // Template drag and drop
    this.setupDragAndDrop()

    // Lesson title/description changes
    document.getElementById('lesson-title-input')?.addEventListener('input', () => {
      this.markDirty()
    })
    
    document.getElementById('lesson-description-input')?.addEventListener('input', () => {
      this.markDirty()
    })

    // Listen for lesson load events from other parts of the app
    window.addEventListener('load-lesson', (e) => {
      this.currentLesson = e.detail
      this.selectedActivity = -1
      this.isDirty = false
      this.renderActivitiesFlow()
      this.updateUI()
      this.updateLessonInputs()
    })
  }

  setupDragAndDrop() {
    const templatesContainer = document.getElementById('templates-list')
    const flowContainer = document.getElementById('activities-flow')

    if (!templatesContainer || !flowContainer) return

    // Template drag start
    templatesContainer.addEventListener('dragstart', (e) => {
      const templateItem = e.target.closest('.template-item')
      if (templateItem) {
        const templateId = templateItem.dataset.templateId
        e.dataTransfer?.setData('text/plain', templateId || '')
        templateItem.classList.add('dragging')
      }
    })

    templatesContainer.addEventListener('dragend', (e) => {
      const templateItem = e.target.closest('.template-item')
      templateItem?.classList.remove('dragging')
    })

    // Template click to add
    templatesContainer.addEventListener('click', (e) => {
      const templateItem = e.target.closest('.template-item')
      if (templateItem && !e.target.closest('.template-actions')) {
        const templateId = templateItem.dataset.templateId
        if (templateId) {
          this.addActivity(templateId)
        }
      }
    })

    // Flow drop zone
    flowContainer.addEventListener('dragover', (e) => {
      e.preventDefault()
      flowContainer.classList.add('drop-zone-active')
    })

    flowContainer.addEventListener('dragleave', (e) => {
      if (!flowContainer.contains(e.relatedTarget)) {
        flowContainer.classList.remove('drop-zone-active')
      }
    })

    flowContainer.addEventListener('drop', (e) => {
      e.preventDefault()
      flowContainer.classList.remove('drop-zone-active')
      
      const templateId = e.dataTransfer?.getData('text/plain')
      if (templateId) {
        this.addActivity(templateId)
      }
    })
  }

  createNewLesson() {
    if (this.isDirty && !confirm('현재 작업이 저장되지 않았습니다. 계속하시겠습니까?')) {
      return
    }

    this.currentLesson = {
      lessonId: `lesson-${Date.now()}`,
      title: '',
      locale: 'ko',
      version: '1.0.0',
      flow: [],
      grading: {
        mode: 'weighted-sum',
        passLine: 0.7,
        showScores: true,
        showProgress: true
      },
      metadata: {
        author: 'Lesson Builder',
        createdAt: new Date().toISOString(),
        tags: [],
        difficulty: 'beginner',
        estimatedTime: 10
      }
    }

    this.selectedActivity = -1
    this.isDirty = false
    this.renderActivitiesFlow()
    this.updateUI()
    this.updateLessonInputs()
  }

  loadLesson() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const lessonData = JSON.parse(event.target.result)
            this.currentLesson = lessonData
            this.selectedActivity = -1
            this.isDirty = false
            this.renderActivitiesFlow()
            this.updateUI()
            this.updateLessonInputs()
          } catch (error) {
            alert('JSON 파일을 읽을 수 없습니다: ' + error.message)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  updateLessonInputs() {
    if (!this.currentLesson) return
    
    const titleInput = document.getElementById('lesson-title-input')
    const descriptionInput = document.getElementById('lesson-description-input')
    
    if (titleInput) titleInput.value = this.currentLesson.title || ''
    if (descriptionInput) descriptionInput.value = this.currentLesson.description || ''
  }

  addActivity(templateId) {
    if (!this.currentLesson) {
      this.createNewLesson()
    }

    const template = this.templates.get(templateId)
    if (!template) return

    const activityId = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newActivity = {
      activityId,
      template: templateId,
      params: JSON.parse(JSON.stringify(template.defaultParams)), // Deep copy
      rules: {
        scoreWeight: 1,
        retryLimit: 3,
        required: true
      }
    }

    this.currentLesson.flow.push(newActivity)
    this.selectedActivity = this.currentLesson.flow.length - 1
    
    this.markDirty()
    this.renderActivitiesFlow()
    this.renderPropertyEditor()
    
    // Show success feedback
    this.showNotification(
      `✨ ${template.manifest.name} 활동이 추가되었습니다. (총 ${this.currentLesson.flow.length}개)`,
      'success'
    )
  }

  removeActivity(index) {
    if (!this.currentLesson || !confirm('이 활동을 삭제하시겠습니까?')) {
      return
    }

    this.currentLesson.flow.splice(index, 1)
    
    if (this.selectedActivity >= index) {
      this.selectedActivity = Math.max(-1, this.selectedActivity - 1)
    }

    this.markDirty()
    this.renderActivitiesFlow()
    this.renderPropertyEditor()
  }

  selectActivity(index) {
    this.selectedActivity = index
    this.renderActivitiesFlow()
    this.renderPropertyEditor()
    
    // Update live preview when activity is selected
    if (index >= 0 && this.currentLesson?.flow) {
      this.updateLivePreview()
    } else {
      this.clearPreview()
    }
  }

  renderActivitiesFlow() {
    const container = document.getElementById('activities-flow')
    if (!container || !this.currentLesson) return

    if (this.currentLesson.flow.length === 0) {
      container.innerHTML = `
        <div class="flow-placeholder">
          <div class="placeholder-content">
            <div class="placeholder-icon">🎯</div>
            <h4>레슨을 구성하세요</h4>
            <p>왼쪽에서 템플릿을 끌어다 놓거나 클릭하여 액티비티를 추가하세요.</p>
          </div>
        </div>
      `
      return
    }

    const flowHtml = this.currentLesson.flow.map((activity, index) => {
      const template = this.templates.get(activity.template)
      const isSelected = index === this.selectedActivity
      
      return `
        <div class="activity-card ${isSelected ? 'selected' : ''}" 
             data-index="${index}"
             onclick="window.builder.selectActivity(${index})">
          <div class="activity-header">
            <div class="activity-icon">
              ${template ? this.getTemplateIcon(template.manifest.category) : '🧩'}
            </div>
            <div class="activity-info">
              <div class="activity-name">${activity.activityId}</div>
              <div class="activity-template">${template?.manifest.name || activity.template}</div>
            </div>
            <div class="activity-actions">
              <button class="btn-icon btn-danger" onclick="event.stopPropagation(); window.builder.removeActivity(${index})" title="삭제">
                🗑️
              </button>
            </div>
          </div>
          
          <div class="activity-preview">
            ${this.renderActivityPreview(activity)}
          </div>
          
          ${index < this.currentLesson.flow.length - 1 ? '<div class="flow-connector">↓</div>' : ''}
        </div>
      `
    }).join('')

    container.innerHTML = flowHtml
  }

  renderActivityPreview(activity) {
    const params = activity.params
    let preview = ''

    if (params.question) {
      preview += `<div class="preview-prompt">${params.question.substring(0, 100)}${params.question.length > 100 ? '...' : ''}</div>`
    }

    if (params.prompt) {
      preview += `<div class="preview-prompt">${params.prompt.substring(0, 100)}${params.prompt.length > 100 ? '...' : ''}</div>`
    }

    if (params.title) {
      preview += `<div class="preview-prompt">${params.title}</div>`
    }

    if (params.src) {
      preview += `<div class="preview-media">🎥 미디어: ${params.src.split('/').pop()}</div>`
    }

    if (params.choices && Array.isArray(params.choices)) {
      const choiceTexts = params.choices.map(c => typeof c === 'string' ? c : c.text).filter(Boolean)
      preview += `<div class="preview-choices">📝 선택지: ${choiceTexts.slice(0, 3).join(', ')}${choiceTexts.length > 3 ? '...' : ''}</div>`
    }

    if (params.cards && Array.isArray(params.cards)) {
      preview += `<div class="preview-choices">🎮 카드: ${params.cards.length}개</div>`
    }

    return preview || '<div class="preview-empty">설정 필요</div>'
  }

  renderPropertyEditor() {
    const container = document.getElementById('property-editor-content')
    if (!container) return

    if (this.selectedActivity === -1 || !this.currentLesson) {
      container.innerHTML = `
        <div class="editor-placeholder">
          <p>활동을 선택하면 속성을 편집할 수 있습니다.</p>
        </div>
      `
      return
    }

    const activity = this.currentLesson.flow[this.selectedActivity]
    const template = this.templates.get(activity.template)
    
    if (!template) {
      container.innerHTML = '<div class="editor-error">템플릿을 찾을 수 없습니다.</div>'
      return
    }

    const formHtml = template.configForm.map(field => 
      this.renderFormField(field, activity.params[field.name])
    ).join('')

    container.innerHTML = `
      <div class="property-form">
        <div class="form-section">
          <h4>📋 기본 정보</h4>
          <div class="form-field">
            <label>활동 ID</label>
            <input type="text" value="${activity.activityId}" 
                   onchange="window.builder.updateActivityProperty('activityId', this.value)">
          </div>
        </div>
        
        <div class="form-section">
          <h4>⚙️ 활동 매개변수</h4>
          ${formHtml}
        </div>
        
        <div class="form-section">
          <h4>📊 규칙 설정</h4>
          <div class="form-field">
            <label>점수 가중치</label>
            <input type="number" min="0" step="0.1" value="${activity.rules?.scoreWeight || 1}"
                   onchange="window.builder.updateActivityRule('scoreWeight', parseFloat(this.value))">
          </div>
          <div class="form-field">
            <label>재시도 제한</label>
            <input type="number" min="1" value="${activity.rules?.retryLimit || 3}"
                   onchange="window.builder.updateActivityRule('retryLimit', parseInt(this.value))">
          </div>
          <div class="form-field">
            <label class="checkbox-label">
              <input type="checkbox" ${activity.rules?.required ? 'checked' : ''}
                     onchange="window.builder.updateActivityRule('required', this.checked)">
              필수 활동
            </label>
          </div>
        </div>
      </div>
    `
  }

  renderFormField(field, value) {
    const fieldId = `field-${field.name}`
    
    let inputHtml = ''
    
    switch (field.type) {
      case 'text':
        inputHtml = `<input type="text" id="${fieldId}" value="${value || ''}" 
                            onchange="window.builder.updateActivityParam('${field.name}', this.value)">`
        break
        
      case 'number':
        inputHtml = `<input type="number" id="${fieldId}" value="${value || 0}"
                            ${field.validation?.min !== undefined ? `min="${field.validation.min}"` : ''}
                            ${field.validation?.max !== undefined ? `max="${field.validation.max}"` : ''}
                            onchange="window.builder.updateActivityParam('${field.name}', parseFloat(this.value) || 0)">`
        break
        
      case 'boolean':
        inputHtml = `<label class="checkbox-label">
                       <input type="checkbox" id="${fieldId}" ${value ? 'checked' : ''}
                              onchange="window.builder.updateActivityParam('${field.name}', this.checked)">
                       ${field.label}
                     </label>`
        break
        
      case 'select':
        const options = field.options?.map(opt => 
          `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
        ).join('') || ''
        inputHtml = `<select id="${fieldId}" onchange="window.builder.updateActivityParam('${field.name}', this.value)">
                       ${options}
                     </select>`
        break
        
      case 'array':
        let arrayValue = ''
        if (Array.isArray(value)) {
          if (typeof value[0] === 'object') {
            // Handle array of objects (like choices)
            arrayValue = value.map(item => {
              if (item.text) return item.text
              if (item.content) return item.content
              return JSON.stringify(item)
            }).join('\n')
          } else {
            arrayValue = value.join('\n')
          }
        }
        inputHtml = `<textarea id="${fieldId}" rows="4" placeholder="한 줄에 하나씩 입력"
                               onchange="window.builder.updateActivityParam('${field.name}', this.value.split('\\n').filter(s => s.trim()))">${arrayValue}</textarea>`
        break
        
      case 'object':
        inputHtml = `<textarea id="${fieldId}" rows="3" placeholder="JSON 형식으로 입력"
                               onchange="try { window.builder.updateActivityParam('${field.name}', JSON.parse(this.value || '{}')); } catch(e) { console.error('Invalid JSON:', e); }">${
                       value && typeof value === 'object' ? JSON.stringify(value, null, 2) : ''
                     }</textarea>`
        break
    }

    return `
      <div class="form-field">
        ${field.type !== 'boolean' ? `<label for="${fieldId}">${field.label}</label>` : ''}
        ${inputHtml}
        ${field.description ? `<small class="field-help">${field.description}</small>` : ''}
      </div>
    `
  }

  // Public methods for UI callbacks
  updateActivityProperty(property, value) {
    if (!this.currentLesson || this.selectedActivity === -1) return
    
    const activity = this.currentLesson.flow[this.selectedActivity]
    activity[property] = value
    
    this.markDirty()
    this.renderActivitiesFlow()
  }

  updateActivityParam(param, value) {
    if (!this.currentLesson || this.selectedActivity === -1) return
    
    const activity = this.currentLesson.flow[this.selectedActivity]
    const oldValue = activity.params[param]
    
    // Skip update if value hasn't changed (performance optimization)
    if (JSON.stringify(oldValue) === JSON.stringify(value)) {
      return
    }
    
    // Special handling for specific parameter types
    if (param === 'choices' && Array.isArray(value)) {
      // Convert string array to choice objects
      activity.params[param] = value.map((text, index) => ({
        id: `choice-${String.fromCharCode(97 + index)}`,
        text: text.trim()
      }))
    } else if (param === 'cards' && Array.isArray(value)) {
      // Convert string array to card objects (simplified)
      activity.params[param] = value.map((content, index) => ({
        id: `card-${index + 1}`,
        content: content.trim(),
        type: 'text',
        matchId: `match-${Math.floor(index / 2)}`
      }))
    } else {
      activity.params[param] = value
    }
    
    console.log(`📝 Updated ${param}:`, value)
    
    this.markDirty()
    
    // Debounced rendering for better performance
    clearTimeout(this._renderTimeout)
    this._renderTimeout = setTimeout(() => {
      this.renderActivitiesFlow()
    }, 150)
    
    // Auto-update preview if currently playing the lesson
    this.updateLivePreview()
  }

  updateActivityRule(rule, value) {
    if (!this.currentLesson || this.selectedActivity === -1) return
    
    const activity = this.currentLesson.flow[this.selectedActivity]
    activity.rules = activity.rules || {}
    activity.rules[rule] = value
    
    this.markDirty()
  }

  markDirty() {
    this.isDirty = true
    this.updateUI()
  }

  updateUI() {
    const saveBtn = document.getElementById('save-lesson-btn')
    const previewBtn = document.getElementById('preview-lesson-btn')
    
    if (saveBtn) {
      saveBtn.disabled = !this.isDirty || !this.currentLesson
    }
    if (previewBtn) {
      previewBtn.disabled = !this.currentLesson || (this.currentLesson.flow && this.currentLesson.flow.length === 0)
    }
  }

  filterTemplates(query) {
    const templateItems = document.querySelectorAll('.template-item')
    
    templateItems.forEach(item => {
      const name = item.querySelector('.template-name')?.textContent?.toLowerCase() || ''
      const match = name.includes(query.toLowerCase())
      item.style.display = match ? 'flex' : 'none'
    })
  }

  async saveLesson() {
    if (!this.currentLesson) return

    // Update lesson metadata
    const titleInput = document.getElementById('lesson-title-input')
    const descriptionInput = document.getElementById('lesson-description-input')
    
    this.currentLesson.title = titleInput.value || this.currentLesson.lessonId
    this.currentLesson.description = descriptionInput.value

    // CRITICAL: Sync all current form values before saving
    this.syncAllFormValues()

    // Download as JSON file
    const blob = new Blob([JSON.stringify(this.currentLesson, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${this.currentLesson.lessonId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    this.isDirty = false
    this.updateUI()
    
    // Show success message with more details
    const activityCount = this.currentLesson.flow ? this.currentLesson.flow.length : 0
    this.showNotification(
      `💾 "${this.currentLesson.title}" 레슨이 JSON 파일로 저장되었습니다. (${activityCount}개 활동)`, 
      'success'
    )
  }

  previewLesson() {
    if (!this.currentLesson) return

    // Update lesson metadata before preview
    const titleInput = document.getElementById('lesson-title-input')
    const descriptionInput = document.getElementById('lesson-description-input')
    
    this.currentLesson.title = titleInput.value || this.currentLesson.lessonId
    this.currentLesson.description = descriptionInput.value

    // CRITICAL: Sync all current form values to lesson data before preview
    this.syncAllFormValues()

    // Show loading state
    const previewBtn = document.getElementById('preview-lesson-btn')
    if (previewBtn) {
      previewBtn.textContent = '🔄 미리보기 중...'
      previewBtn.disabled = true
    }

    // NEW: Show full lesson preview in builder instead of switching tabs
    this.showFullLessonPreview()
      .then(() => {
        this.showNotification(`✅ "${this.currentLesson.title}" 레슨 미리보기가 표시되었습니다.`, 'success')
      })
      .catch(error => {
        this.showNotification('❌ 미리보기 로드 실패: ' + error.message, 'error')
      })
      .finally(() => {
        // Restore button state
        if (previewBtn) {
          previewBtn.textContent = '👁️ 미리보기'
          previewBtn.disabled = false
        }
      })
  }

  // NEW: Show full lesson preview in builder
  async showFullLessonPreview() {
    const previewContainer = document.getElementById('activity-preview-container')
    if (!previewContainer) {
      throw new Error('Preview container not found')
    }

    console.log('🎬 Showing full lesson preview in builder:', this.currentLesson)

    try {
      // Create lesson preview with navigation
      previewContainer.innerHTML = `
        <div class="full-lesson-preview">
          <div class="lesson-preview-header">
            <div class="lesson-info">
              <h3>📚 ${this.currentLesson.title || 'Untitled Lesson'}</h3>
              <p class="lesson-description">${this.currentLesson.description || 'No description'}</p>
            </div>
            <div class="lesson-nav">
              <button id="prev-activity-btn" class="btn btn-sm btn-secondary" disabled>← 이전</button>
              <span id="activity-counter" class="activity-counter">1 / ${this.currentLesson.flow.length}</span>
              <button id="next-activity-btn" class="btn btn-sm btn-secondary">다음 →</button>
            </div>
          </div>
          <div id="lesson-activity-container" class="lesson-activity-container">
            <div class="loading-spinner"></div>
            <p>첫 번째 활동을 로딩 중...</p>
          </div>
        </div>
      `

      // Initialize lesson preview orchestrator
      this.initLessonPreview()

    } catch (error) {
      console.error('Full lesson preview error:', error)
      previewContainer.innerHTML = `
        <div class="preview-error">
          <h4>❌ 레슨 미리보기 오류</h4>
          <p>${error.message}</p>
          <button class="btn btn-sm btn-secondary" onclick="window.builder.clearPreview()">미리보기 닫기</button>
        </div>
      `
      throw error
    }
  }

  // NEW: Initialize lesson preview with navigation
  initLessonPreview() {
    this.previewCurrentIndex = 0
    this.previewFlow = this.currentLesson.flow || []

    // Set up navigation buttons
    const prevBtn = document.getElementById('prev-activity-btn')
    const nextBtn = document.getElementById('next-activity-btn')

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.navigatePreview(-1))
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.navigatePreview(1))
    }

    // Load first activity
    this.loadPreviewActivity(0)
  }

  // NEW: Navigate through preview activities
  navigatePreview(direction) {
    const newIndex = this.previewCurrentIndex + direction
    
    if (newIndex >= 0 && newIndex < this.previewFlow.length) {
      this.previewCurrentIndex = newIndex
      this.loadPreviewActivity(newIndex)
      this.updatePreviewNavigation()
    }
  }

  // NEW: Load specific activity in preview
  async loadPreviewActivity(index) {
    const activityContainer = document.getElementById('lesson-activity-container')
    const counter = document.getElementById('activity-counter')
    
    if (!activityContainer || !this.previewFlow[index]) return

    const activity = this.previewFlow[index]
    
    // Update counter
    if (counter) {
      counter.textContent = `${index + 1} / ${this.previewFlow.length}`
    }

    // Show loading
    activityContainer.innerHTML = `
      <div class="activity-loading">
        <div class="loading-spinner"></div>
        <p>${activity.activityId || `활동 ${index + 1}`} 로딩 중...</p>
      </div>
    `

    try {
      // Render the activity
      await this.renderPreviewActivity(activity, activityContainer)
      this.updatePreviewNavigation()
    } catch (error) {
      console.error('Load preview activity error:', error)
      activityContainer.innerHTML = `
        <div class="activity-error">
          <h4>❌ 활동 로드 오류</h4>
          <p>${error.message}</p>
          <div class="activity-fallback">
            <h5>${activity.activityId || `활동 ${index + 1}`}</h5>
            ${this.renderActivityParamsPreview(activity.params || {})}
          </div>
        </div>
      `
    }
  }

  // NEW: Update navigation button states
  updatePreviewNavigation() {
    const prevBtn = document.getElementById('prev-activity-btn')
    const nextBtn = document.getElementById('next-activity-btn')

    if (prevBtn) {
      prevBtn.disabled = this.previewCurrentIndex === 0
    }
    if (nextBtn) {
      nextBtn.disabled = this.previewCurrentIndex === this.previewFlow.length - 1
    }
  }

  // NEW: Render activity in preview container
  async renderPreviewActivity(activity, container) {
    try {
      // Get template renderer
      const response = await fetch(`/api/templates/${encodeURIComponent(activity.template)}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity.params || {})
      })

      if (!response.ok) {
        throw new Error(`Template render failed: ${response.statusText}`)
      }

      const html = await response.text()
      
      container.innerHTML = `
        <div class="preview-activity-wrapper">
          <div class="activity-header">
            <h4>${activity.activityId || 'Activity'}</h4>
            <span class="template-badge">${activity.template}</span>
          </div>
          <div class="activity-content">
            ${html}
          </div>
        </div>
      `

      // Initialize basic interactions
      this.initPreviewActivityInteractions(container, activity)

    } catch (error) {
      throw new Error(`Failed to render activity: ${error.message}`)
    }
  }

  // NEW: Initialize basic interactions for preview
  initPreviewActivityInteractions(container, activity) {
    // Handle buttons
    container.querySelectorAll('button').forEach(btn => {
      if (!btn.onclick && !btn.dataset.previewHandled) {
        btn.dataset.previewHandled = 'true'
        btn.addEventListener('click', (e) => {
          e.preventDefault()
          console.log('🎯 Preview button clicked:', btn.textContent, 'in activity:', activity.activityId)
          
          // Show feedback for button clicks
          const originalText = btn.textContent
          btn.textContent = '✓ 클릭됨'
          btn.disabled = true
          
          setTimeout(() => {
            btn.textContent = originalText
            btn.disabled = false
          }, 1000)
        })
      }
    })

    // Handle form inputs
    container.querySelectorAll('input, select, textarea').forEach(input => {
      if (!input.dataset.previewHandled) {
        input.dataset.previewHandled = 'true'
        input.addEventListener('change', (e) => {
          console.log('🎯 Preview input changed:', e.target.name || e.target.type, '=', e.target.value)
        })
      }
    })
  }
  }

  // NEW: Preview current activity in builder
  previewCurrentActivity() {
    if (this.selectedActivity === -1 || !this.currentLesson?.flow) return

    const activity = this.currentLesson.flow[this.selectedActivity]
    if (!activity) return

    // Sync current form values before preview
    this.syncAllFormValues()

    this.showActivityPreview(activity)
  }

  // NEW: Show activity preview in builder
  showActivityPreview(activity) {
    const previewContainer = document.getElementById('activity-preview-container')
    if (!previewContainer) return

    console.log('🎬 Showing activity preview:', activity)

    try {
      // Create a temporary orchestrator for preview
      const previewData = {
        lessonId: 'preview',
        title: 'Preview',
        description: 'Activity Preview',
        flow: [activity]
      }

      previewContainer.innerHTML = `
        <div class="preview-activity-header">
          <h4>📋 ${activity.activityId || 'Activity'}</h4>
          <span class="template-badge">${activity.template}</span>
        </div>
        <div id="preview-activity-content" class="preview-activity-content">
          <div class="loading-spinner"></div>
          <p>활동을 로딩 중...</p>
        </div>
      `

      // Load the activity template and render
      this.renderActivityPreview(activity)

    } catch (error) {
      console.error('Preview error:', error)
      previewContainer.innerHTML = `
        <div class="preview-error">
          <h4>❌ 미리보기 오류</h4>
          <p>${error.message}</p>
        </div>
      `
    }
  }

  // NEW: Render activity preview using template
  async renderActivityPreview(activity) {
    const previewContent = document.getElementById('preview-activity-content')
    if (!previewContent) return

    try {
      // Get template renderer
      const response = await fetch(`/api/templates/${encodeURIComponent(activity.template)}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity.params || {})
      })

      if (!response.ok) {
        throw new Error(`Template render failed: ${response.statusText}`)
      }

      const html = await response.text()
      previewContent.innerHTML = html

      // Initialize the rendered activity
      this.initializePreviewActivity(activity)

    } catch (error) {
      console.error('Render preview error:', error)
      previewContent.innerHTML = `
        <div class="preview-fallback">
          <h4>📋 ${activity.activityId || 'Activity Preview'}</h4>
          <div class="activity-params">
            ${this.renderActivityParamsPreview(activity.params || {})}
          </div>
        </div>
      `
    }
  }

  // NEW: Fallback preview when template render fails
  renderActivityParamsPreview(params) {
    return Object.entries(params).map(([key, value]) => {
      let displayValue = value
      if (typeof value === 'object') {
        displayValue = JSON.stringify(value, null, 2)
      } else if (typeof value === 'string' && value.length > 100) {
        displayValue = value.substring(0, 100) + '...'
      }

      return `
        <div class="param-item">
          <strong>${key}:</strong>
          <span class="param-value">${displayValue}</span>
        </div>
      `
    }).join('')
  }

  // NEW: Initialize preview activity (basic functionality)
  initializePreviewActivity(activity) {
    // Add basic event listeners for common elements
    const previewContent = document.getElementById('preview-activity-content')
    if (!previewContent) return

    // Handle buttons
    previewContent.querySelectorAll('button').forEach(btn => {
      if (!btn.onclick) {
        btn.addEventListener('click', (e) => {
          e.preventDefault()
          console.log('Preview button clicked:', btn.textContent)
        })
      }
    })

    // Handle form inputs
    previewContent.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('change', (e) => {
        console.log('Preview input changed:', e.target.name, e.target.value)
      })
    })
  }

  // NEW: Clear preview
  clearPreview() {
    const previewContainer = document.getElementById('activity-preview-container')
    if (previewContainer) {
      previewContainer.innerHTML = `
        <div class="preview-placeholder">
          <div class="placeholder-content">
            <div class="placeholder-icon">👁️</div>
            <h4>미리보기</h4>
            <p>활동을 선택하고 저장하면 여기에서 미리보기를 확인할 수 있습니다.</p>
          </div>
        </div>
      `
    }
  }

  // Update live preview if lesson is currently loaded in player
  updateLivePreview() {
    // Only update if there's an active lesson in the player
    if (window.app && window.app.currentLesson && 
        window.app.currentLesson.lessonId === this.currentLesson.lessonId) {
      console.log('🔄 Updating live preview with new parameters...')
      
      // Create a deep copy of the lesson data
      const updatedLesson = JSON.parse(JSON.stringify(this.currentLesson))
      
      // Update the player's lesson data silently
      window.app.currentLesson = updatedLesson
      
      // If orchestrator is available, update it too
      if (window.app.orchestrator) {
        window.app.orchestrator.lessonData = updatedLesson
        
        // Trigger a refresh of the current activity if possible
        const currentActivityIndex = window.app.orchestrator.currentActivityIndex
        if (currentActivityIndex !== undefined && currentActivityIndex >= 0) {
          console.log('🔄 Refreshing current activity with updated parameters')
          // You could implement a refresh method in orchestrator if needed
        }
      }
      
      // Update lesson info display
      if (window.app.updateLessonInfo) {
        window.app.updateLessonInfo(updatedLesson)
      }
    }
  }

  // Sync all current form values to lesson data - CRITICAL for preview accuracy
  syncAllFormValues() {
    if (!this.currentLesson || this.selectedActivity === -1) return
    
    console.log('🔄 Syncing all form values to lesson data...')
    
    const activity = this.currentLesson.flow[this.selectedActivity]
    const template = this.templates.get(activity.template)
    
    if (!template) return

    // Sync all parameter form fields
    template.configForm.forEach(field => {
      const fieldId = `field-${field.name}`
      const element = document.getElementById(fieldId)
      
      if (!element) return
      
      let value = null
      
      switch (field.type) {
        case 'text':
          value = element.value
          break
          
        case 'number':
          value = parseFloat(element.value) || 0
          break
          
        case 'boolean':
          value = element.checked
          break
          
        case 'select':
          value = element.value
          break
          
        case 'array':
          value = element.value.split('\n').filter(s => s.trim())
          break
          
        case 'object':
          try {
            value = JSON.parse(element.value || '{}')
          } catch (e) {
            console.warn(`Invalid JSON for field ${field.name}:`, e)
            value = {}
          }
          break
      }
      
      if (value !== null) {
        // Apply the same special handling as updateActivityParam
        if (field.name === 'choices' && Array.isArray(value)) {
          activity.params[field.name] = value.map((text, index) => ({
            id: `choice-${String.fromCharCode(97 + index)}`,
            text: text.trim()
          }))
        } else if (field.name === 'cards' && Array.isArray(value)) {
          activity.params[field.name] = value.map((content, index) => ({
            id: `card-${index + 1}`,
            content: content.trim(),
            type: 'text',
            matchId: `match-${Math.floor(index / 2)}`
          }))
        } else {
          activity.params[field.name] = value
        }
      }
    })
    
    // Sync activity rules
    const scoreWeightInput = document.querySelector('input[onchange*="scoreWeight"]')
    if (scoreWeightInput) {
      activity.rules = activity.rules || {}
      activity.rules.scoreWeight = parseFloat(scoreWeightInput.value) || 1
    }
    
    const retryLimitInput = document.querySelector('input[onchange*="retryLimit"]')
    if (retryLimitInput) {
      activity.rules = activity.rules || {}
      activity.rules.retryLimit = parseInt(retryLimitInput.value) || 3
    }
    
    const requiredInput = document.querySelector('input[onchange*="required"]')
    if (requiredInput) {
      activity.rules = activity.rules || {}
      activity.rules.required = requiredInput.checked
    }
    
    // Sync activity ID
    const activityIdInput = document.querySelector('input[onchange*="activityId"]')
    if (activityIdInput) {
      activity.activityId = activityIdInput.value
    }
    
    console.log('✅ Form values synced to lesson data:')
    console.log('  - Activity ID:', activity.activityId)
    console.log('  - Template:', activity.template)
    console.log('  - All Params:', activity.params)
    console.log('  - Choices specifically:', activity.params.choices)
    
    // Auto-update preview after syncing
    this.updateLivePreview()
  }

  // NEW: Update live preview automatically
  updateLivePreview() {
    if (this.selectedActivity !== -1 && this.currentLesson?.flow) {
      const activity = this.currentLesson.flow[this.selectedActivity]
      if (activity) {
        console.log('🔄 Auto-updating live preview...')
        this.showActivityPreview(activity)
      }
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `
    
    // Add to notifications container
    let container = document.getElementById('notifications-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'notifications-container'
      container.className = 'notifications-container'
      document.body.appendChild(container)
    }
    
    container.appendChild(notification)
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 3000)
  }

  // Alias method for external API compatibility
  addTemplateToLesson(templateId) {
    return this.addActivity(templateId)
  }
}

// Global builder instance for UI callbacks
window.builder = null

// Function to initialize builder - can be called dynamically
function initializeLessonBuilder(container) {
  if (!window.builder) {
    console.log('🛠️ Initializing Lesson Builder...')
    window.builder = new LessonBuilder(container)
  }
  return window.builder
}

// Initialize builder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const builderContainer = document.querySelector('[data-panel="builder"]')
  if (builderContainer) {
    // Initialize builder when the builder tab is first activated
    const builderTab = document.querySelector('[data-tab="builder"]')
    builderTab?.addEventListener('click', () => {
      initializeLessonBuilder(builderContainer)
    }, { once: true })
  }
})

// Export for external use
export { LessonBuilder, initializeLessonBuilder }