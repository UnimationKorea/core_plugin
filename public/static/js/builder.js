// Lesson Builder - Visual Lesson Creation Interface

import type { 
  LessonConfig, 
  ActivityStep, 
  ActivityManifest,
  ActivityParam 
} from '../types/activity'

export interface BuilderTemplate {
  manifest: ActivityManifest
  defaultParams: ActivityParam
  configForm: FormField[]
}

export interface FormField {
  name: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'array' | 'object' | 'file' | 'color'
  label: string
  description?: string
  required?: boolean
  default?: any
  options?: { value: any; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: (value: any) => string | null
  }
  conditional?: {
    field: string
    value: any
  }
}

export class LessonBuilder {
  private templates: Map<string, BuilderTemplate> = new Map()
  private currentLesson: LessonConfig | null = null
  private selectedActivity: number = -1
  private container: HTMLElement
  private isDirty = false

  constructor(container: HTMLElement) {
    this.container = container
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
          const builderTemplate: BuilderTemplate = {
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

  private generateDefaultParams(schema: any): ActivityParam {
    const params: ActivityParam = {}
    
    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
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

  private generateFormFields(schema: any): FormField[] {
    const fields: FormField[] = []

    if (schema.properties) {
      Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
        const field: FormField = {
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
          field.options = prop.enum.map((value: any) => ({
            value,
            label: this.humanizeKey(value.toString())
          }))
        }

        fields.push(field)
      })
    }

    return fields
  }

  private mapSchemaTypeToFormType(prop: any): FormField['type'] {
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

  private humanizeKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase())
  }

  private render() {
    this.container.innerHTML = `
      <div class="lesson-builder">
        <!-- Builder Header -->
        <div class="builder-header">
          <div class="builder-title-section">
            <h2 class="builder-title">레슨 빌더</h2>
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
          <!-- Templates Palette -->
          <aside class="templates-palette">
            <div class="palette-header">
              <h3>액티비티 템플릿</h3>
              <input type="search" placeholder="템플릿 검색..." class="search-input" id="template-search">
            </div>
            <div class="templates-list" id="templates-list">
              ${this.renderTemplatesPalette()}
            </div>
          </aside>

          <!-- Lesson Canvas -->
          <main class="lesson-canvas">
            <div class="canvas-header">
              <div class="lesson-info">
                <input type="text" placeholder="레슨 제목을 입력하세요" class="lesson-title-input" id="lesson-title-input">
                <textarea placeholder="레슨 설명을 입력하세요" class="lesson-description-input" id="lesson-description-input"></textarea>
              </div>
            </div>
            
            <div class="activities-flow" id="activities-flow">
              <div class="flow-placeholder">
                <div class="placeholder-content">
                  <div class="placeholder-icon">🎯</div>
                  <h4>레슨을 구성하세요</h4>
                  <p>왼쪽에서 템플릿을 끌어다 놓거나 클릭하여 액티비티를 추가하세요.</p>
                </div>
              </div>
            </div>
          </main>

          <!-- Property Editor -->
          <aside class="property-editor">
            <div class="editor-header">
              <h3>속성 편집기</h3>
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

  private renderTemplatesPalette(): string {
    const categories = new Map<string, BuilderTemplate[]>()
    
    // Group templates by category
    this.templates.forEach(template => {
      const category = template.manifest.category
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category)!.push(template)
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
              </div>
            `).join('')}
          </div>
        </div>
      `
    })

    return html
  }

  private getTemplateIcon(category: string): string {
    const icons: Record<string, string> = {
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

  private setupEventListeners() {
    // New lesson
    document.getElementById('new-lesson-btn')?.addEventListener('click', () => {
      this.createNewLesson()
    })

    // Save lesson
    document.getElementById('save-lesson-btn')?.addEventListener('click', () => {
      this.saveLesson()
    })

    // Preview lesson
    document.getElementById('preview-lesson-btn')?.addEventListener('click', () => {
      this.previewLesson()
    })

    // Template search
    document.getElementById('template-search')?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value
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
  }

  private setupDragAndDrop() {
    const templatesContainer = document.getElementById('templates-list')
    const flowContainer = document.getElementById('activities-flow')

    if (!templatesContainer || !flowContainer) return

    // Template drag start
    templatesContainer.addEventListener('dragstart', (e) => {
      const templateItem = (e.target as Element).closest('.template-item') as HTMLElement
      if (templateItem) {
        const templateId = templateItem.dataset.templateId
        e.dataTransfer?.setData('text/plain', templateId || '')
        templateItem.classList.add('dragging')
      }
    })

    templatesContainer.addEventListener('dragend', (e) => {
      const templateItem = (e.target as Element).closest('.template-item') as HTMLElement
      templateItem?.classList.remove('dragging')
    })

    // Template click to add
    templatesContainer.addEventListener('click', (e) => {
      const templateItem = (e.target as Element).closest('.template-item') as HTMLElement
      if (templateItem) {
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
      if (!flowContainer.contains(e.relatedTarget as Node)) {
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

  private createNewLesson() {
    if (this.isDirty && !confirm('현재 작업이 저장되지 않았습니다. 계속하시겠습니까?')) {
      return
    }

    this.currentLesson = {
      lessonId: `lesson-${Date.now()}`,
      title: '',
      locale: 'ko',
      flow: [],
      grading: {
        mode: 'weighted-sum',
        passLine: 0.7
      }
    }

    this.selectedActivity = -1
    this.isDirty = false
    this.renderActivitiesFlow()
    this.updateUI()
  }

  private addActivity(templateId: string) {
    if (!this.currentLesson) {
      this.createNewLesson()
    }

    const template = this.templates.get(templateId)
    if (!template) return

    const activityId = `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const newActivity: ActivityStep = {
      activityId,
      template: templateId,
      params: { ...template.defaultParams },
      rules: {
        scoreWeight: 1,
        retryLimit: 3,
        required: true
      }
    }

    this.currentLesson!.flow.push(newActivity)
    this.selectedActivity = this.currentLesson!.flow.length - 1
    
    this.markDirty()
    this.renderActivitiesFlow()
    this.renderPropertyEditor()
  }

  private removeActivity(index: number) {
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

  private selectActivity(index: number) {
    this.selectedActivity = index
    this.renderActivitiesFlow()
    this.renderPropertyEditor()
  }

  private renderActivitiesFlow() {
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
             onclick="builder.selectActivity(${index})">
          <div class="activity-header">
            <div class="activity-icon">
              ${template ? this.getTemplateIcon(template.manifest.category) : '🧩'}
            </div>
            <div class="activity-info">
              <div class="activity-name">${activity.activityId}</div>
              <div class="activity-template">${template?.manifest.name || activity.template}</div>
            </div>
            <div class="activity-actions">
              <button class="btn-icon btn-danger" onclick="event.stopPropagation(); builder.removeActivity(${index})" title="삭제">
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

  private renderActivityPreview(activity: ActivityStep): string {
    // Generate a preview of the activity based on its parameters
    const params = activity.params
    let preview = ''

    if (params.prompt) {
      preview += `<div class="preview-prompt">${params.prompt}</div>`
    }

    if (params.src) {
      preview += `<div class="preview-media">미디어: ${params.src}</div>`
    }

    if (params.choices && Array.isArray(params.choices)) {
      preview += `<div class="preview-choices">선택지: ${params.choices.slice(0, 3).join(', ')}${params.choices.length > 3 ? '...' : ''}</div>`
    }

    return preview || '<div class="preview-empty">설정 없음</div>'
  }

  private renderPropertyEditor() {
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
          <h4>기본 정보</h4>
          <div class="form-field">
            <label>활동 ID</label>
            <input type="text" value="${activity.activityId}" 
                   onchange="builder.updateActivityProperty('activityId', this.value)">
          </div>
        </div>
        
        <div class="form-section">
          <h4>활동 매개변수</h4>
          ${formHtml}
        </div>
        
        <div class="form-section">
          <h4>규칙 설정</h4>
          <div class="form-field">
            <label>점수 가중치</label>
            <input type="number" min="0" step="0.1" value="${activity.rules?.scoreWeight || 1}"
                   onchange="builder.updateActivityRule('scoreWeight', parseFloat(this.value))">
          </div>
          <div class="form-field">
            <label>재시도 제한</label>
            <input type="number" min="1" value="${activity.rules?.retryLimit || 3}"
                   onchange="builder.updateActivityRule('retryLimit', parseInt(this.value))">
          </div>
          <div class="form-field">
            <label class="checkbox-label">
              <input type="checkbox" ${activity.rules?.required ? 'checked' : ''}
                     onchange="builder.updateActivityRule('required', this.checked)">
              필수 활동
            </label>
          </div>
        </div>
      </div>
    `
  }

  private renderFormField(field: FormField, value: any): string {
    const fieldId = `field-${field.name}`
    
    let inputHtml = ''
    
    switch (field.type) {
      case 'text':
        inputHtml = `<input type="text" id="${fieldId}" value="${value || ''}" 
                            onchange="builder.updateActivityParam('${field.name}', this.value)">`
        break
        
      case 'number':
        inputHtml = `<input type="number" id="${fieldId}" value="${value || 0}"
                            ${field.validation?.min !== undefined ? `min="${field.validation.min}"` : ''}
                            ${field.validation?.max !== undefined ? `max="${field.validation.max}"` : ''}
                            onchange="builder.updateActivityParam('${field.name}', parseFloat(this.value) || 0)">`
        break
        
      case 'boolean':
        inputHtml = `<label class="checkbox-label">
                       <input type="checkbox" id="${fieldId}" ${value ? 'checked' : ''}
                              onchange="builder.updateActivityParam('${field.name}', this.checked)">
                       ${field.label}
                     </label>`
        break
        
      case 'select':
        const options = field.options?.map(opt => 
          `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
        ).join('') || ''
        inputHtml = `<select id="${fieldId}" onchange="builder.updateActivityParam('${field.name}', this.value)">
                       ${options}
                     </select>`
        break
        
      case 'array':
        inputHtml = `<textarea id="${fieldId}" rows="3" placeholder="한 줄에 하나씩 입력"
                               onchange="builder.updateActivityParam('${field.name}', this.value.split('\\n').filter(s => s.trim()))">${
                       Array.isArray(value) ? value.join('\n') : ''
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
  updateActivityProperty(property: string, value: any) {
    if (!this.currentLesson || this.selectedActivity === -1) return
    
    const activity = this.currentLesson.flow[this.selectedActivity]
    ;(activity as any)[property] = value
    
    this.markDirty()
    this.renderActivitiesFlow()
  }

  updateActivityParam(param: string, value: any) {
    if (!this.currentLesson || this.selectedActivity === -1) return
    
    const activity = this.currentLesson.flow[this.selectedActivity]
    activity.params[param] = value
    
    this.markDirty()
    this.renderActivitiesFlow()
  }

  updateActivityRule(rule: string, value: any) {
    if (!this.currentLesson || this.selectedActivity === -1) return
    
    const activity = this.currentLesson.flow[this.selectedActivity]
    activity.rules = activity.rules || {}
    ;(activity.rules as any)[rule] = value
    
    this.markDirty()
  }

  selectActivity(index: number) {
    this.selectActivity(index)
  }

  removeActivity(index: number) {
    this.removeActivity(index)
  }

  private markDirty() {
    this.isDirty = true
    this.updateUI()
  }

  private updateUI() {
    const saveBtn = document.getElementById('save-lesson-btn') as HTMLButtonElement
    const previewBtn = document.getElementById('preview-lesson-btn') as HTMLButtonElement
    
    if (saveBtn) saveBtn.disabled = !this.isDirty
    if (previewBtn) previewBtn.disabled = !this.currentLesson
  }

  private filterTemplates(query: string) {
    const templateItems = document.querySelectorAll('.template-item')
    
    templateItems.forEach(item => {
      const element = item as HTMLElement
      const name = element.querySelector('.template-name')?.textContent?.toLowerCase() || ''
      const match = name.includes(query.toLowerCase())
      element.style.display = match ? 'flex' : 'none'
    })
  }

  private async saveLesson() {
    if (!this.currentLesson) return

    // Update lesson metadata
    const titleInput = document.getElementById('lesson-title-input') as HTMLInputElement
    const descriptionInput = document.getElementById('lesson-description-input') as HTMLTextAreaElement
    
    this.currentLesson.title = titleInput.value || this.currentLesson.lessonId
    this.currentLesson.description = descriptionInput.value

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
  }

  private previewLesson() {
    if (!this.currentLesson) return

    // Send lesson data to player
    window.dispatchEvent(new CustomEvent('load-lesson', {
      detail: this.currentLesson
    }))

    // Switch to player tab
    document.querySelector('[data-tab="player"]')?.dispatchEvent(new Event('click'))
  }
}

// Global builder instance for UI callbacks
let builder: LessonBuilder

// Initialize builder when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const builderContainer = document.querySelector('[data-panel="builder"]') as HTMLElement
  if (builderContainer) {
    // Initialize builder when the builder tab is first activated
    const builderTab = document.querySelector('[data-tab="builder"]')
    builderTab?.addEventListener('click', () => {
      if (!builder) {
        builder = new LessonBuilder(builderContainer)
        // Make builder globally available for UI callbacks
        ;(window as any).builder = builder
      }
    }, { once: true })
  }
})