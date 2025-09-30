import type { ActivityManifest, ActivityParam, ActivityContext, ActivityResult } from '../../types/activity'
import { BaseActivityTemplate } from '../base/activity-template'

interface MultipleChoiceParams {
  question: string
  choices: {
    id: string
    text: string
    image?: string
  }[]
  correctAnswer: string | string[] // 단일 또는 다중 정답 지원
  allowMultiple?: boolean
  shuffle?: boolean
  timeLimit?: number // seconds
  explanation?: string
  image?: string
  audio?: string
  showFeedback?: boolean
  hints?: string[]
}

export class MultipleChoiceActivityTemplate extends BaseActivityTemplate {
  manifest: ActivityManifest = {
    id: 'multiple-choice@1.0.0',
    name: '4지 선다형 문제',
    version: '1.0.0',
    category: 'assessment',
    capabilities: ['keyboard', 'mouse', 'touch', 'audio'],
    paramsSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: '문제 텍스트',
          minLength: 1
        },
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
          maxItems: 6,
          description: '선택지 목록'
        },
        correctAnswer: {
          oneOf: [
            { type: 'string' },
            { type: 'array', items: { type: 'string' } }
          ],
          description: '정답 ID(들)'
        },
        allowMultiple: {
          type: 'boolean',
          default: false,
          description: '다중 선택 허용'
        },
        shuffle: {
          type: 'boolean',
          default: true,
          description: '선택지 순서 섞기'
        },
        timeLimit: {
          type: 'number',
          minimum: 10,
          maximum: 300,
          description: '제한 시간 (초)'
        },
        explanation: {
          type: 'string',
          description: '정답 해설'
        },
        image: {
          type: 'string',
          description: '문제 이미지 URL'
        },
        audio: {
          type: 'string',
          description: '문제 오디오 URL'
        },
        showFeedback: {
          type: 'boolean',
          default: true,
          description: '즉시 피드백 표시'
        },
        hints: {
          type: 'array',
          items: { type: 'string' },
          description: '힌트 목록'
        }
      },
      required: ['question', 'choices', 'correctAnswer']
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
      maxMemoryMB: 30
    },
    security: {
      allowedDomains: [],
      maxApiCalls: 0,
      requiresAuth: false
    }
  }

  private selectedAnswers: Set<string> = new Set()
  private isAnswered = false
  private timer: number | null = null
  private remainingTime = 0
  private shuffledChoices: typeof this.params.choices = []
  private correctAnswerIds: string[] = []

  async mount(container: HTMLElement, params: ActivityParam, context: ActivityContext): Promise<void> {
    this.initialize(container, params, context)
    
    const mcParams = params as MultipleChoiceParams
    
    // 정답 배열로 정규화
    this.correctAnswerIds = Array.isArray(mcParams.correctAnswer) 
      ? mcParams.correctAnswer 
      : [mcParams.correctAnswer]
    
    // 선택지 준비 (섞기 옵션 적용)
    this.shuffledChoices = [...mcParams.choices]
    if (mcParams.shuffle !== false) {
      this.shuffleArray(this.shuffledChoices)
    }

    // 제한 시간 설정
    if (mcParams.timeLimit) {
      this.remainingTime = mcParams.timeLimit
    }

    // UI 렌더링
    this.renderQuestion()
    
    // 이벤트 리스너 설정
    this.setupEventListeners()
    
    // 접근성 설정
    this.setupAccessibility()
    
    // 타이머 시작
    if (mcParams.timeLimit) {
      this.startTimer()
    }

    this.status.state = 'ready'
    this.log('START')
  }

  private renderQuestion(): void {
    const params = this.params as MultipleChoiceParams
    
    const imageHtml = params.image ? `
      <div class="question-image">
        <img src="${params.image}" alt="문제 이미지" />
      </div>
    ` : ''

    const audioHtml = params.audio ? `
      <div class="question-audio">
        <audio controls preload="metadata">
          <source src="${params.audio}" type="audio/mpeg">
          <source src="${params.audio}" type="audio/wav">
          브라우저가 오디오를 지원하지 않습니다.
        </audio>
      </div>
    ` : ''

    const timerHtml = params.timeLimit ? `
      <div class="timer-section">
        <div class="timer-display">
          <span class="timer-icon">⏱️</span>
          <span class="timer-text">남은 시간: <span id="timer-value">${this.remainingTime}</span>초</span>
        </div>
        <div class="timer-progress">
          <div class="timer-bar" id="timer-bar"></div>
        </div>
      </div>
    ` : ''

    this.container!.innerHTML = `
      <div class="multiple-choice-activity">
        <div class="question-section">
          <h3 class="question-text">${params.question}</h3>
          ${imageHtml}
          ${audioHtml}
        </div>
        
        ${timerHtml}
        
        <div class="choices-section">
          <div class="choices-grid" id="choices-grid">
            ${this.shuffledChoices.map((choice, index) => this.renderChoice(choice, index)).join('')}
          </div>
        </div>
        
        <div class="actions-section">
          <div class="action-buttons">
            <button class="btn btn-secondary" id="hint-btn">💡 힌트</button>
            <button class="btn btn-primary" id="submit-btn" disabled>답안 제출</button>
          </div>
          
          <div class="feedback-area" id="feedback-area" style="display: none;">
            <div class="feedback-content"></div>
          </div>
        </div>
      </div>
    `
  }

  private renderChoice(choice: any, index: number): string {
    const params = this.params as MultipleChoiceParams
    const inputType = params.allowMultiple ? 'checkbox' : 'radio'
    const inputName = params.allowMultiple ? `choice-${choice.id}` : 'choice'
    
    const imageHtml = choice.image ? `
      <div class="choice-image">
        <img src="${choice.image}" alt="선택지 이미지" />
      </div>
    ` : ''

    return `
      <div class="choice-item" data-choice-id="${choice.id}">
        <label class="choice-label">
          <input 
            type="${inputType}" 
            name="${inputName}" 
            value="${choice.id}"
            class="choice-input"
            id="choice-${choice.id}"
          >
          <div class="choice-content">
            <div class="choice-marker">${String.fromCharCode(65 + index)}</div>
            <div class="choice-body">
              ${imageHtml}
              <div class="choice-text">${choice.text}</div>
            </div>
          </div>
        </label>
      </div>
    `
  }

  private setupEventListeners(): void {
    const choiceInputs = this.container!.querySelectorAll('.choice-input')
    const submitBtn = this.container!.querySelector('#submit-btn') as HTMLButtonElement
    const hintBtn = this.container!.querySelector('#hint-btn') as HTMLButtonElement

    // 선택지 변경 이벤트
    choiceInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        const choiceId = target.value
        
        if (target.checked) {
          this.selectedAnswers.add(choiceId)
        } else {
          this.selectedAnswers.delete(choiceId)
        }

        // 단일 선택의 경우 다른 선택 해제
        const params = this.params as MultipleChoiceParams
        if (!params.allowMultiple && target.checked) {
          this.selectedAnswers.clear()
          this.selectedAnswers.add(choiceId)
          
          // 다른 input들 해제
          choiceInputs.forEach(otherInput => {
            if (otherInput !== target) {
              (otherInput as HTMLInputElement).checked = false
            }
          })
        }

        this.updateSubmitButton()
        this.incrementInteractions()
        
        this.log('PROGRESS', { 
          action: 'choice-selected', 
          selected: Array.from(this.selectedAnswers) 
        })
      })
    })

    // 제출 버튼
    submitBtn.addEventListener('click', () => {
      this.submitAnswer()
    })

    // 힌트 버튼
    hintBtn.addEventListener('click', () => {
      this.showHint()
    })

    // 키보드 단축키
    this.container!.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e as KeyboardEvent)
    })
  }

  private setupAccessibility(): void {
    const choiceItems = this.container!.querySelectorAll('.choice-item')
    
    // 키보드 네비게이션 설정
    choiceItems.forEach((item, index) => {
      const input = item.querySelector('.choice-input') as HTMLInputElement
      
      input.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault()
            this.focusChoice(index + 1)
            break
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault()
            this.focusChoice(index - 1)
            break
          case 'Enter':
          case ' ':
            e.preventDefault()
            input.click()
            break
        }
      })
    })
  }

  private focusChoice(index: number): void {
    const choices = this.container!.querySelectorAll('.choice-input')
    const targetIndex = ((index % choices.length) + choices.length) % choices.length
    ;(choices[targetIndex] as HTMLElement).focus()
  }

  private updateSubmitButton(): void {
    const submitBtn = this.container!.querySelector('#submit-btn') as HTMLButtonElement
    submitBtn.disabled = this.selectedAnswers.size === 0 || this.isAnswered
  }

  private startTimer(): void {
    const params = this.params as MultipleChoiceParams
    if (!params.timeLimit) return

    this.timer = window.setInterval(() => {
      this.remainingTime--
      this.updateTimerDisplay()

      if (this.remainingTime <= 0) {
        this.timeUp()
      }
    }, 1000)
  }

  private updateTimerDisplay(): void {
    const timerValue = this.container!.querySelector('#timer-value')
    const timerBar = this.container!.querySelector('#timer-bar') as HTMLElement
    const params = this.params as MultipleChoiceParams

    if (timerValue) {
      timerValue.textContent = this.remainingTime.toString()
    }

    if (timerBar && params.timeLimit) {
      const progress = this.remainingTime / params.timeLimit
      timerBar.style.width = `${progress * 100}%`
      
      // 시간 부족시 색상 변경
      if (progress < 0.2) {
        timerBar.style.background = 'var(--error)'
      } else if (progress < 0.5) {
        timerBar.style.background = 'var(--warning)'
      }
    }
  }

  private timeUp(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    this.announceToScreenReader('시간이 종료되었습니다.')
    this.submitAnswer(true)
  }

  private submitAnswer(timeUp = false): void {
    if (this.isAnswered) return

    this.isAnswered = true
    
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    const isCorrect = this.validateAnswer()
    const params = this.params as MultipleChoiceParams

    // 선택지 상태 업데이트
    this.updateChoiceStates(isCorrect)
    
    // 피드백 표시
    if (params.showFeedback !== false) {
      this.showFeedback(isCorrect, timeUp)
    }

    // 결과 이벤트 발송
    this.log('PROGRESS', {
      action: 'answer-submitted',
      selected: Array.from(this.selectedAnswers),
      correct: this.correctAnswerIds,
      isCorrect,
      timeUp
    })

    // 완료 처리
    setTimeout(() => {
      this.finalize()
    }, params.showFeedback !== false ? 2000 : 0)
  }

  private validateAnswer(): boolean {
    if (this.selectedAnswers.size !== this.correctAnswerIds.length) {
      return false
    }

    return this.correctAnswerIds.every(answerId => 
      this.selectedAnswers.has(answerId)
    )
  }

  private updateChoiceStates(isCorrect: boolean): void {
    const choiceItems = this.container!.querySelectorAll('.choice-item')
    
    choiceItems.forEach(item => {
      const choiceId = item.getAttribute('data-choice-id')!
      const input = item.querySelector('.choice-input') as HTMLInputElement
      const label = item.querySelector('.choice-label') as HTMLElement
      
      input.disabled = true
      
      if (this.correctAnswerIds.includes(choiceId)) {
        // 정답 표시
        label.classList.add('choice-correct')
      } else if (this.selectedAnswers.has(choiceId)) {
        // 잘못 선택된 답 표시
        label.classList.add('choice-incorrect')
      }
    })
  }

  private showFeedback(isCorrect: boolean, timeUp = false): void {
    const params = this.params as MultipleChoiceParams
    const feedbackArea = this.container!.querySelector('#feedback-area') as HTMLElement
    const feedbackContent = feedbackArea.querySelector('.feedback-content') as HTMLElement
    
    let message = ''
    let className = ''
    
    if (timeUp) {
      message = '⏰ 시간이 종료되었습니다!'
      className = 'feedback-timeout'
    } else if (isCorrect) {
      message = '🎉 정답입니다!'
      className = 'feedback-correct'
    } else {
      message = '❌ 틀렸습니다.'
      className = 'feedback-incorrect'
    }

    // 해설 추가
    if (params.explanation) {
      message += `<div class="explanation"><strong>해설:</strong> ${params.explanation}</div>`
    }

    feedbackContent.innerHTML = message
    feedbackArea.className = `feedback-area ${className}`
    feedbackArea.style.display = 'block'

    this.announceToScreenReader(isCorrect ? '정답입니다!' : '틀렸습니다.')
  }

  private handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (this.isAnswered) return

    // 숫자키로 선택지 선택
    const keyNum = parseInt(event.key)
    if (keyNum >= 1 && keyNum <= this.shuffledChoices.length) {
      const choice = this.shuffledChoices[keyNum - 1]
      const input = this.container!.querySelector(`#choice-${choice.id}`) as HTMLInputElement
      input?.click()
    }

    // Enter로 제출
    if (event.key === 'Enter' && this.selectedAnswers.size > 0) {
      this.submitAnswer()
    }
  }

  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  async showHint(level: number = 1): Promise<void> {
    const params = this.params as MultipleChoiceParams
    
    if (!params.hints || params.hints.length === 0) {
      this.showMessage('힌트가 없습니다.', 'info')
      return
    }

    const hintIndex = Math.min(level - 1, params.hints.length - 1)
    const hint = params.hints[hintIndex]
    
    this.showMessage(`💡 힌트: ${hint}`, 'info')
    this.announceToScreenReader(`힌트: ${hint}`)
  }

  async restart(): Promise<void> {
    this.selectedAnswers.clear()
    this.isAnswered = false
    
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    const params = this.params as MultipleChoiceParams
    if (params.timeLimit) {
      this.remainingTime = params.timeLimit
    }

    await super.restart()
  }

  async unmount(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.cleanup()
  }

  async getResult(): Promise<ActivityResult> {
    const isCorrect = this.validateAnswer()
    const params = this.params as MultipleChoiceParams
    
    // 시간 보너스 계산
    let timeBonus = 1
    if (params.timeLimit && this.remainingTime > 0) {
      timeBonus = 1 + (this.remainingTime / params.timeLimit) * 0.2 // 최대 20% 보너스
    }

    const baseScore = isCorrect ? 1 : 0
    const finalScore = Math.min(baseScore * timeBonus, 1)
    
    return {
      score: finalScore,
      durationMs: Date.now() - this.startTime,
      details: {
        selectedAnswers: Array.from(this.selectedAnswers),
        correctAnswers: this.correctAnswerIds,
        isCorrect,
        timeSpent: params.timeLimit ? params.timeLimit - this.remainingTime : undefined,
        timeBonus: isCorrect ? timeBonus - 1 : 0,
        interactions: this.status.interactions
      }
    }
  }
}

export default function createMultipleChoiceTemplate(): MultipleChoiceActivityTemplate {
  return new MultipleChoiceActivityTemplate()
}