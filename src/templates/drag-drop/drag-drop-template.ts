import type { ActivityManifest, ActivityParam, ActivityContext, ActivityResult } from '../../types/activity'
import { BaseActivityTemplate } from '../base/activity-template'

interface DragDropParams {
  prompt: string
  choices: string[]
  answer: string | string[] // 단일 또는 다중 정답 지원
  image?: string
  allowMultiple?: boolean // 다중 선택 허용
  shuffleChoices?: boolean
  maxAttempts?: number
  showFeedback?: boolean
  hints?: string[]
}

export class DragDropActivityTemplate extends BaseActivityTemplate {
  manifest: ActivityManifest = {
    id: 'drag-drop-choices@2.0.0',
    name: 'Drag & Drop Multiple Choice',
    version: '2.0.0',
    category: 'interaction',
    capabilities: ['drag', 'drop', 'keyboard', 'mouse', 'touch'],
    paramsSchema: {
      type: 'object',
      properties: {
        prompt: { 
          type: 'string', 
          description: 'Question prompt text',
          minLength: 1
        },
        choices: { 
          type: 'array', 
          items: { type: 'string' },
          minItems: 2,
          maxItems: 8,
          description: 'Available choices for drag and drop'
        },
        answer: { 
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } }
          ],
          description: 'Correct answer(s)'
        },
        image: { 
          type: 'string',
          description: 'Optional image URL to display with prompt'
        },
        allowMultiple: {
          type: 'boolean',
          default: false,
          description: 'Allow multiple selections'
        },
        shuffleChoices: {
          type: 'boolean', 
          default: true,
          description: 'Shuffle choice order'
        },
        maxAttempts: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          default: 3,
          description: 'Maximum number of attempts'
        },
        showFeedback: {
          type: 'boolean',
          default: true,
          description: 'Show immediate feedback'
        },
        hints: {
          type: 'array',
          items: { type: 'string' },
          description: 'Hint messages for different levels'
        }
      },
      required: ['prompt', 'choices', 'answer']
    },
    i18n: {
      supported: ['ko', 'en', 'ja', 'zh'],
      defaultLocale: 'ko'
    },
    accessibility: {
      keyboardNavigation: true,
      screenReader: true,
      highContrast: true
    },
    performance: {
      maxLoadTimeMs: 2000,
      maxMemoryMB: 50
    },
    security: {
      allowedDomains: [],
      maxApiCalls: 0,
      requiresAuth: false
    }
  }

  private selectedChoices: string[] = []
  private attempts = 0
  private isCompleted = false
  private draggedElement: HTMLElement | null = null
  private choices: string[] = []
  private correctAnswers: string[] = []

  async mount(container: HTMLElement, params: ActivityParam, context: ActivityContext): Promise<void> {
    this.initialize(container, params, context)
    
    const dragDropParams = params as DragDropParams
    
    // 정답 배열로 정규화
    this.correctAnswers = Array.isArray(dragDropParams.answer) 
      ? dragDropParams.answer 
      : [dragDropParams.answer]
    
    // 선택지 준비 (섞기 옵션 적용)
    this.choices = [...dragDropParams.choices]
    if (dragDropParams.shuffleChoices !== false) {
      this.shuffleArray(this.choices)
    }

    // UI 구성
    const activityContainer = this.createElement('div', 'drag-drop-activity')
    activityContainer.innerHTML = this.renderHTML(dragDropParams)
    
    container.appendChild(activityContainer)
    
    // 이벤트 리스너 설정
    this.setupDragDropEvents()
    this.setupKeyboardNavigation()
    this.setupTouchEvents()
    
    // 반응형 레이아웃
    this.setupResponsiveLayout()
    
    this.status.state = 'ready'
    this.log('START')
  }

  private renderHTML(params: DragDropParams): string {
    const imageHtml = params.image ? `
      <div class="prompt-image">
        <img src="${params.image}" alt="Question illustration" />
      </div>
    ` : ''
    
    const promptWithBlank = params.prompt.replace(
      /___+/g, 
      `<span class="drop-zone" data-placeholder="여기로 드래그하세요">
        <span class="placeholder-text">___</span>
      </span>`
    )

    return `
      <div class="activity-header">
        <div class="prompt-section">
          <h3 class="prompt-text">${promptWithBlank}</h3>
          ${imageHtml}
        </div>
        
        <div class="feedback-section">
          <div class="attempts-display">
            시도: <span class="attempts-count">0</span>/<span class="max-attempts">${params.maxAttempts || 3}</span>
          </div>
          <div class="feedback-message" aria-live="polite"></div>
        </div>
      </div>

      <div class="choices-section">
        <h4 class="choices-title">선택지</h4>
        <div class="choices-container">
          ${this.choices.map((choice, index) => `
            <div class="choice-item" 
                 draggable="true" 
                 tabindex="0"
                 data-choice="${choice}"
                 data-index="${index}"
                 role="button"
                 aria-label="선택지: ${choice}">
              <span class="choice-text">${choice}</span>
              <span class="drag-handle" aria-hidden="true">⋮⋮</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="actions-section">
        <button class="btn-check" disabled>답안 확인</button>
        <button class="btn-clear">다시 시작</button>
        <button class="btn-hint">힌트</button>
      </div>
    `
  }

  private setupDragDropEvents(): void {
    const choicesContainer = this.querySelector('.choices-container')
    const dropZones = this.querySelectorAll('.drop-zone')
    const checkBtn = this.querySelector('.btn-check') as HTMLButtonElement
    const clearBtn = this.querySelector('.btn-clear') as HTMLButtonElement
    const hintBtn = this.querySelector('.btn-hint') as HTMLButtonElement

    // 선택지 드래그 이벤트
    choicesContainer?.addEventListener('dragstart', (e) => {
      const target = (e.target as Element).closest('.choice-item') as HTMLElement
      if (!target) return
      
      this.draggedElement = target
      target.classList.add('dragging')
      
      const choice = target.dataset.choice || ''
      e.dataTransfer?.setData('text/plain', choice)
      e.dataTransfer?.setEffectAllowed('move')
      
      this.announceToScreenReader(`${choice} 선택됨`)
    })

    choicesContainer?.addEventListener('dragend', (e) => {
      const target = (e.target as Element).closest('.choice-item') as HTMLElement
      target?.classList.remove('dragging')
      this.draggedElement = null
    })

    // 드롭 존 이벤트
    dropZones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault()
        zone.classList.add('drag-over')
      })

      zone.addEventListener('dragleave', (e) => {
        zone.classList.remove('drag-over')
      })

      zone.addEventListener('drop', (e) => {
        e.preventDefault()
        zone.classList.remove('drag-over')
        
        const choice = e.dataTransfer?.getData('text/plain')
        if (choice) {
          this.selectChoice(choice, zone as HTMLElement)
        }
      })
    })

    // 버튼 이벤트
    checkBtn?.addEventListener('click', () => this.checkAnswer())
    clearBtn?.addEventListener('click', () => this.clearSelections())
    hintBtn?.addEventListener('click', () => this.showHint())
  }

  private setupKeyboardNavigation(): void {
    const choiceItems = this.querySelectorAll('.choice-item')
    
    choiceItems.forEach((item, index) => {
      item.addEventListener('keydown', (e) => {
        const event = e as KeyboardEvent
        
        switch (event.key) {
          case 'Enter':
          case ' ':
            event.preventDefault()
            this.selectChoiceByKeyboard(item as HTMLElement)
            break
            
          case 'ArrowRight':
          case 'ArrowDown':
            event.preventDefault()
            this.focusNextChoice(index, 1)
            break
            
          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault()
            this.focusNextChoice(index, -1)
            break
        }
      })
    })
  }

  private setupTouchEvents(): void {
    // 터치 디바이스에서 드래그 앤 드롭 대신 탭으로 선택
    const choicesContainer = this.querySelector('.choices-container')
    
    choicesContainer?.addEventListener('touchstart', (e) => {
      e.preventDefault()
      const target = (e.target as Element).closest('.choice-item') as HTMLElement
      if (target) {
        target.classList.add('touch-active')
      }
    })

    choicesContainer?.addEventListener('touchend', (e) => {
      e.preventDefault()
      const target = (e.target as Element).closest('.choice-item') as HTMLElement
      if (target) {
        target.classList.remove('touch-active')
        this.selectChoiceByTouch(target)
      }
    })
  }

  private selectChoice(choice: string, dropZone: HTMLElement): void {
    const params = this.params as DragDropParams
    
    if (!params.allowMultiple) {
      this.selectedChoices = [choice]
    } else {
      if (!this.selectedChoices.includes(choice)) {
        this.selectedChoices.push(choice)
      }
    }
    
    this.updateDropZone(dropZone, choice)
    this.updateCheckButton()
    this.incrementInteractions()
    
    this.log('PROGRESS', { 
      action: 'choice-selected', 
      choice, 
      selected: [...this.selectedChoices] 
    })
  }

  private selectChoiceByKeyboard(choiceElement: HTMLElement): void {
    const choice = choiceElement.dataset.choice
    if (!choice) return
    
    const dropZone = this.querySelector('.drop-zone') as HTMLElement
    if (dropZone) {
      this.selectChoice(choice, dropZone)
      this.announceToScreenReader(`${choice} 선택됨`)
    }
  }

  private selectChoiceByTouch(choiceElement: HTMLElement): void {
    this.selectChoiceByKeyboard(choiceElement)
  }

  private updateDropZone(dropZone: HTMLElement, choice: string): void {
    const placeholderText = dropZone.querySelector('.placeholder-text')
    if (placeholderText) {
      placeholderText.textContent = choice
      dropZone.classList.add('filled')
    }
  }

  private updateCheckButton(): void {
    const checkBtn = this.querySelector('.btn-check') as HTMLButtonElement
    checkBtn.disabled = this.selectedChoices.length === 0
  }

  private clearSelections(): void {
    this.selectedChoices = []
    
    const dropZones = this.querySelectorAll('.drop-zone')
    dropZones.forEach(zone => {
      const placeholder = zone.querySelector('.placeholder-text')
      if (placeholder) {
        placeholder.textContent = '___'
        zone.classList.remove('filled')
      }
    })
    
    this.updateCheckButton()
    this.clearFeedback()
    
    this.log('PROGRESS', { action: 'cleared' })
  }

  private async checkAnswer(): Promise<void> {
    if (this.isCompleted || this.selectedChoices.length === 0) return
    
    this.attempts++
    this.updateAttemptsDisplay()
    
    const isCorrect = this.validateAnswer()
    const params = this.params as DragDropParams
    
    if (isCorrect) {
      this.isCompleted = true
      this.status.state = 'completed'
      
      if (params.showFeedback !== false) {
        this.showFeedback('정답입니다! 🎉', 'success')
      }
      
      this.announceToScreenReader('정답입니다!')
      await this.playAudio('success-sound')
      this.finalize()
      
    } else {
      const maxAttempts = params.maxAttempts || 3
      
      if (this.attempts >= maxAttempts) {
        this.isCompleted = true
        this.status.state = 'completed'
        
        if (params.showFeedback !== false) {
          this.showFeedback(`오답입니다. 정답: ${this.correctAnswers.join(', ')}`, 'error')
        }
        
        this.announceToScreenReader('최대 시도 횟수에 도달했습니다.')
        this.finalize()
        
      } else {
        if (params.showFeedback !== false) {
          this.showFeedback(`오답입니다. ${maxAttempts - this.attempts}번 더 시도할 수 있습니다.`, 'warning')
        }
        
        this.incrementErrors()
      }
    }
    
    this.log('PROGRESS', {
      action: 'answer-checked',
      selected: [...this.selectedChoices],
      correct: this.correctAnswers,
      isCorrect,
      attempts: this.attempts
    })
  }

  private validateAnswer(): boolean {
    if (this.selectedChoices.length !== this.correctAnswers.length) {
      return false
    }
    
    return this.correctAnswers.every(answer => 
      this.selectedChoices.includes(answer)
    )
  }

  private showFeedback(message: string, type: 'success' | 'error' | 'warning'): void {
    const feedbackEl = this.querySelector('.feedback-message')
    if (feedbackEl) {
      feedbackEl.textContent = message
      feedbackEl.className = `feedback-message feedback-${type}`
    }
  }

  private clearFeedback(): void {
    const feedbackEl = this.querySelector('.feedback-message')
    if (feedbackEl) {
      feedbackEl.textContent = ''
      feedbackEl.className = 'feedback-message'
    }
  }

  private updateAttemptsDisplay(): void {
    const attemptsEl = this.querySelector('.attempts-count')
    if (attemptsEl) {
      attemptsEl.textContent = this.attempts.toString()
    }
  }

  private focusNextChoice(currentIndex: number, direction: number): void {
    const choices = this.querySelectorAll('.choice-item')
    const nextIndex = (currentIndex + direction + choices.length) % choices.length
    ;(choices[nextIndex] as HTMLElement).focus()
  }

  private shuffleArray(array: string[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  async showHint(level: number = 1): Promise<void> {
    const params = this.params as DragDropParams
    const hints = params.hints || [
      '선택지를 드래그하여 빈 칸에 넣어보세요.',
      '정답이 여러 개일 수 있습니다.',
      '다시 한 번 문제를 읽어보세요.'
    ]
    
    const hintIndex = Math.min(level - 1, hints.length - 1)
    const hint = hints[hintIndex]
    
    this.showMessage(hint, 'info')
    this.announceToScreenReader(`힌트: ${hint}`)
  }

  async restart(): Promise<void> {
    this.selectedChoices = []
    this.attempts = 0
    this.isCompleted = false
    this.clearSelections()
    await super.restart()
  }

  async unmount(): Promise<void> {
    this.cleanup()
  }

  async getResult(): Promise<ActivityResult> {
    const maxScore = 1.0
    let score = 0
    
    if (this.validateAnswer()) {
      // 시도 횟수에 따른 점수 조정
      const params = this.params as DragDropParams
      const maxAttempts = params.maxAttempts || 3
      score = Math.max(0.3, maxScore - (this.attempts - 1) * 0.2)
    }
    
    return {
      score,
      durationMs: Date.now() - this.startTime,
      details: {
        selectedChoices: [...this.selectedChoices],
        correctAnswers: [...this.correctAnswers],
        attempts: this.attempts,
        isCorrect: this.validateAnswer(),
        interactions: this.status.interactions,
        errors: this.status.errors
      }
    }
  }
}

// 템플릿 등록을 위한 팩토리 함수
export default function createDragDropTemplate(): DragDropActivityTemplate {
  return new DragDropActivityTemplate()
}