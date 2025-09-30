import type { ActivityManifest, ActivityParam, ActivityContext, ActivityResult } from '../../types/activity'
import { BaseActivityTemplate } from '../base/activity-template'

interface MemoryGameCard {
  id: string
  content: string
  type: 'text' | 'image' | 'emoji'
  matchId: string  // 매칭될 카드의 그룹 ID
  image?: string
}

interface MemoryGameParams {
  title: string
  cards: MemoryGameCard[]
  gridSize?: 'auto' | '4x4' | '4x6' | '6x6'
  timeLimit?: number // seconds
  allowRetries?: boolean
  maxAttempts?: number
  showTimer?: boolean
  cardBackImage?: string
  successMessage?: string
  failureMessage?: string
  hints?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  shuffle?: boolean
}

interface CardState {
  id: string
  isFlipped: boolean
  isMatched: boolean
  matchId: string
}

export class MemoryGameActivityTemplate extends BaseActivityTemplate {
  manifest: ActivityManifest = {
    id: 'memory-game@1.0.0',
    name: '메모리 게임',
    version: '1.0.0',
    category: 'game',
    capabilities: ['keyboard', 'mouse', 'touch'],
    paramsSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: '게임 제목',
          minLength: 1
        },
        cards: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'string' },
              type: { 
                type: 'string', 
                enum: ['text', 'image', 'emoji'] 
              },
              matchId: { type: 'string' },
              image: { type: 'string' }
            },
            required: ['id', 'content', 'type', 'matchId']
          },
          minItems: 4,
          maxItems: 36,
          description: '카드 목록 (짝수 개수 필요)'
        },
        gridSize: {
          type: 'string',
          enum: ['auto', '4x4', '4x6', '6x6'],
          default: 'auto',
          description: '그리드 크기'
        },
        timeLimit: {
          type: 'number',
          minimum: 30,
          maximum: 600,
          description: '제한 시간 (초)'
        },
        allowRetries: {
          type: 'boolean',
          default: true,
          description: '재시도 허용'
        },
        maxAttempts: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          default: 3,
          description: '최대 시도 횟수'
        },
        showTimer: {
          type: 'boolean',
          default: true,
          description: '타이머 표시'
        },
        cardBackImage: {
          type: 'string',
          description: '카드 뒷면 이미지 URL'
        },
        successMessage: {
          type: 'string',
          default: '🎉 축하합니다! 모든 카드를 맞췄습니다!',
          description: '성공 메시지'
        },
        failureMessage: {
          type: 'string',
          default: '😔 시간이 부족했습니다. 다시 시도해보세요!',
          description: '실패 메시지'
        },
        hints: {
          type: 'array',
          items: { type: 'string' },
          description: '힌트 목록'
        },
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
          description: '난이도'
        },
        shuffle: {
          type: 'boolean',
          default: true,
          description: '카드 섞기'
        }
      },
      required: ['title', 'cards']
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
      maxLoadTimeMs: 3000,
      maxMemoryMB: 50
    },
    security: {
      allowedDomains: [],
      maxApiCalls: 0,
      requiresAuth: false
    }
  }

  private cardStates: Map<string, CardState> = new Map()
  private flippedCards: string[] = []
  private matchedPairs = 0
  private totalPairs = 0
  private attempts = 0
  private timer: number | null = null
  private remainingTime = 0
  private gameStarted = false
  private gameCompleted = false
  private shuffledCards: MemoryGameCard[] = []
  private gridColumns = 4
  private flipDelay = 1000 // 카드 뒤집기 지연 시간

  async mount(container: HTMLElement, params: ActivityParam, context: ActivityContext): Promise<void> {
    this.initialize(container, params, context)
    
    const mgParams = params as MemoryGameParams
    
    // 카드 검증 및 준비
    this.validateAndPrepareCards(mgParams)
    
    // 그리드 크기 설정
    this.setupGrid(mgParams)
    
    // 제한 시간 설정
    if (mgParams.timeLimit) {
      this.remainingTime = mgParams.timeLimit
    }

    // UI 렌더링
    this.renderGame()
    
    // 이벤트 리스너 설정
    this.setupEventListeners()
    
    // 접근성 설정
    this.setupAccessibility()

    this.status.state = 'ready'
    this.log('START')
  }

  private validateAndPrepareCards(params: MemoryGameParams): void {
    // 카드 개수가 짝수인지 확인
    if (params.cards.length % 2 !== 0) {
      throw new Error('카드 개수는 짝수여야 합니다.')
    }

    // 매칭 검증
    const matchGroups = new Map<string, number>()
    params.cards.forEach(card => {
      const count = matchGroups.get(card.matchId) || 0
      matchGroups.set(card.matchId, count + 1)
    })

    // 각 매치 그룹이 2개씩 있는지 확인
    for (const [matchId, count] of matchGroups.entries()) {
      if (count !== 2) {
        throw new Error(`매치 그룹 "${matchId}"의 카드 개수가 올바르지 않습니다. (현재: ${count}개, 필요: 2개)`)
      }
    }

    this.totalPairs = matchGroups.size
    
    // 카드 준비 (섞기 옵션 적용)
    this.shuffledCards = [...params.cards]
    if (params.shuffle !== false) {
      this.shuffleArray(this.shuffledCards)
    }

    // 카드 상태 초기화
    this.shuffledCards.forEach(card => {
      this.cardStates.set(card.id, {
        id: card.id,
        isFlipped: false,
        isMatched: false,
        matchId: card.matchId
      })
    })
  }

  private setupGrid(params: MemoryGameParams): void {
    const cardCount = params.cards.length
    
    if (params.gridSize === 'auto') {
      // 자동 그리드 크기 계산
      if (cardCount <= 8) {
        this.gridColumns = 4
      } else if (cardCount <= 16) {
        this.gridColumns = 4
      } else if (cardCount <= 24) {
        this.gridColumns = 6
      } else {
        this.gridColumns = 6
      }
    } else {
      // 명시적 그리드 크기
      switch (params.gridSize) {
        case '4x4':
          this.gridColumns = 4
          break
        case '4x6':
          this.gridColumns = 4
          break
        case '6x6':
          this.gridColumns = 6
          break
      }
    }
  }

  private renderGame(): void {
    const params = this.params as MemoryGameParams
    
    const timerHtml = params.showTimer !== false && params.timeLimit ? `
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

    const statsHtml = `
      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-label">매칭된 쌍:</span>
          <span class="stat-value" id="matched-pairs">0</span>
          <span class="stat-total">/ ${this.totalPairs}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">시도 횟수:</span>
          <span class="stat-value" id="attempt-count">0</span>
          ${params.maxAttempts ? `<span class="stat-total">/ ${params.maxAttempts}</span>` : ''}
        </div>
      </div>
    `

    this.container!.innerHTML = `
      <div class="memory-game-activity">
        <div class="game-header">
          <h3 class="game-title">${params.title}</h3>
          
          ${timerHtml}
          ${statsHtml}
        </div>
        
        <div class="game-board">
          <div class="cards-grid" id="cards-grid" style="grid-template-columns: repeat(${this.gridColumns}, 1fr);">
            ${this.shuffledCards.map(card => this.renderCard(card)).join('')}
          </div>
        </div>
        
        <div class="actions-section">
          <div class="action-buttons">
            <button class="btn btn-secondary" id="hint-btn">💡 힌트</button>
            <button class="btn btn-secondary" id="restart-btn">🔄 다시 시작</button>
            <button class="btn btn-primary" id="start-btn">🎮 게임 시작</button>
          </div>
          
          <div class="feedback-area" id="feedback-area" style="display: none;">
            <div class="feedback-content"></div>
          </div>
        </div>
      </div>
    `
  }

  private renderCard(card: MemoryGameCard): string {
    const params = this.params as MemoryGameParams
    const cardState = this.cardStates.get(card.id)!
    
    const backContent = params.cardBackImage ? 
      `<img src="${params.cardBackImage}" alt="카드 뒷면" class="card-back-image">` :
      `<div class="card-back-pattern">?</div>`

    const frontContent = this.renderCardContent(card)
    
    return `
      <div class="memory-card ${cardState.isFlipped ? 'flipped' : ''} ${cardState.isMatched ? 'matched' : ''}" 
           data-card-id="${card.id}" 
           data-match-id="${card.matchId}"
           tabindex="0"
           role="button"
           aria-label="메모리 카드 ${card.content}">
        <div class="card-inner">
          <div class="card-back">
            ${backContent}
          </div>
          <div class="card-front">
            ${frontContent}
          </div>
        </div>
      </div>
    `
  }

  private renderCardContent(card: MemoryGameCard): string {
    switch (card.type) {
      case 'image':
        return `<img src="${card.image || card.content}" alt="${card.content}" class="card-image">`
      case 'emoji':
        return `<div class="card-emoji">${card.content}</div>`
      case 'text':
      default:
        return `<div class="card-text">${card.content}</div>`
    }
  }

  private setupEventListeners(): void {
    const cards = this.container!.querySelectorAll('.memory-card')
    const startBtn = this.container!.querySelector('#start-btn') as HTMLButtonElement
    const restartBtn = this.container!.querySelector('#restart-btn') as HTMLButtonElement
    const hintBtn = this.container!.querySelector('#hint-btn') as HTMLButtonElement

    // 카드 클릭 이벤트
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        this.handleCardClick(e.target as HTMLElement)
      })
      
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          this.handleCardClick(e.target as HTMLElement)
        }
      })
    })

    // 버튼 이벤트
    startBtn.addEventListener('click', () => {
      this.startGame()
    })

    restartBtn.addEventListener('click', () => {
      this.restartGame()
    })

    hintBtn.addEventListener('click', () => {
      this.showHint()
    })

    // 키보드 네비게이션
    this.container!.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e as KeyboardEvent)
    })
  }

  private setupAccessibility(): void {
    // 카드에 ARIA 속성 설정
    const cards = this.container!.querySelectorAll('.memory-card')
    
    cards.forEach((card, index) => {
      const cardElement = card as HTMLElement
      cardElement.setAttribute('aria-posinset', (index + 1).toString())
      cardElement.setAttribute('aria-setsize', cards.length.toString())
      
      // 초기 상태 안내
      this.updateCardAriaLabel(cardElement)
    })
  }

  private updateCardAriaLabel(cardElement: HTMLElement): void {
    const cardId = cardElement.getAttribute('data-card-id')!
    const cardState = this.cardStates.get(cardId)!
    const card = this.shuffledCards.find(c => c.id === cardId)!
    
    let label = `메모리 카드`
    
    if (cardState.isMatched) {
      label += ` ${card.content}, 매칭 완료`
    } else if (cardState.isFlipped) {
      label += ` ${card.content}, 뒤집힌 상태`
    } else {
      label += `, 뒤집지 않은 상태`
    }
    
    cardElement.setAttribute('aria-label', label)
  }

  private startGame(): void {
    if (this.gameStarted) return

    this.gameStarted = true
    const params = this.params as MemoryGameParams

    // 시작 버튼 숨기기
    const startBtn = this.container!.querySelector('#start-btn') as HTMLButtonElement
    startBtn.style.display = 'none'

    // 타이머 시작
    if (params.timeLimit && params.showTimer !== false) {
      this.startTimer()
    }

    // 카드 활성화
    const cards = this.container!.querySelectorAll('.memory-card')
    cards.forEach(card => {
      (card as HTMLElement).style.pointerEvents = 'auto'
    })

    this.log('PROGRESS', { action: 'game-started' })
    this.announceToScreenReader('게임이 시작되었습니다. 카드를 클릭하여 짝을 맞춰보세요.')
  }

  private handleCardClick(target: HTMLElement): void {
    if (!this.gameStarted || this.gameCompleted) return

    const cardElement = target.closest('.memory-card') as HTMLElement
    if (!cardElement) return

    const cardId = cardElement.getAttribute('data-card-id')!
    const cardState = this.cardStates.get(cardId)!

    // 이미 뒤집힌 카드나 매칭된 카드는 무시
    if (cardState.isFlipped || cardState.isMatched) return

    // 이미 2장이 뒤집혀 있으면 무시
    if (this.flippedCards.length >= 2) return

    // 카드 뒤집기
    this.flipCard(cardId, true)
    this.flippedCards.push(cardId)
    
    this.incrementInteractions()
    this.log('PROGRESS', { 
      action: 'card-flipped', 
      cardId,
      flippedCount: this.flippedCards.length 
    })

    // 2장이 뒤집혔으면 매칭 검사
    if (this.flippedCards.length === 2) {
      setTimeout(() => {
        this.checkMatch()
      }, this.flipDelay)
    }

    // 카드 접근성 업데이트
    this.updateCardAriaLabel(cardElement)
  }

  private flipCard(cardId: string, flipped: boolean): void {
    const cardState = this.cardStates.get(cardId)!
    cardState.isFlipped = flipped

    const cardElement = this.container!.querySelector(`[data-card-id="${cardId}"]`) as HTMLElement
    
    if (flipped) {
      cardElement.classList.add('flipped')
    } else {
      cardElement.classList.remove('flipped')
    }

    // 접근성 업데이트
    this.updateCardAriaLabel(cardElement)
  }

  private checkMatch(): void {
    const [cardId1, cardId2] = this.flippedCards
    const cardState1 = this.cardStates.get(cardId1)!
    const cardState2 = this.cardStates.get(cardId2)!

    this.attempts++
    this.updateAttemptDisplay()

    if (cardState1.matchId === cardState2.matchId) {
      // 매칭 성공
      cardState1.isMatched = true
      cardState2.isMatched = true

      const cardElements = [
        this.container!.querySelector(`[data-card-id="${cardId1}"]`) as HTMLElement,
        this.container!.querySelector(`[data-card-id="${cardId2}"]`) as HTMLElement
      ]

      cardElements.forEach(element => {
        element.classList.add('matched')
        this.updateCardAriaLabel(element)
      })

      this.matchedPairs++
      this.updateMatchedPairsDisplay()

      this.log('PROGRESS', { 
        action: 'match-success', 
        matchedCards: [cardId1, cardId2],
        matchedPairs: this.matchedPairs 
      })

      this.announceToScreenReader(`매칭 성공! ${this.matchedPairs}개 쌍이 완성되었습니다.`)

      // 모든 쌍이 매칭되었는지 확인
      if (this.matchedPairs === this.totalPairs) {
        setTimeout(() => {
          this.completeGame(true)
        }, 500)
      }
    } else {
      // 매칭 실패
      this.log('PROGRESS', { 
        action: 'match-failed', 
        attemptedCards: [cardId1, cardId2] 
      })

      this.announceToScreenReader('매칭 실패. 카드가 다시 뒤집힙니다.')

      setTimeout(() => {
        this.flipCard(cardId1, false)
        this.flipCard(cardId2, false)
      }, this.flipDelay)

      // 최대 시도 횟수 확인
      const params = this.params as MemoryGameParams
      if (params.maxAttempts && this.attempts >= params.maxAttempts) {
        setTimeout(() => {
          this.completeGame(false)
        }, this.flipDelay + 500)
      }
    }

    this.flippedCards = []
  }

  private startTimer(): void {
    const params = this.params as MemoryGameParams
    if (!params.timeLimit) return

    this.timer = window.setInterval(() => {
      this.remainingTime--
      this.updateTimerDisplay()

      if (this.remainingTime <= 0) {
        this.completeGame(false)
      }
    }, 1000)
  }

  private updateTimerDisplay(): void {
    const timerValue = this.container!.querySelector('#timer-value')
    const timerBar = this.container!.querySelector('#timer-bar') as HTMLElement
    const params = this.params as MemoryGameParams

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

  private updateMatchedPairsDisplay(): void {
    const matchedPairsElement = this.container!.querySelector('#matched-pairs')
    if (matchedPairsElement) {
      matchedPairsElement.textContent = this.matchedPairs.toString()
    }
  }

  private updateAttemptDisplay(): void {
    const attemptCountElement = this.container!.querySelector('#attempt-count')
    if (attemptCountElement) {
      attemptCountElement.textContent = this.attempts.toString()
    }
  }

  private completeGame(success: boolean): void {
    if (this.gameCompleted) return

    this.gameCompleted = true

    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    // 카드 비활성화
    const cards = this.container!.querySelectorAll('.memory-card')
    cards.forEach(card => {
      (card as HTMLElement).style.pointerEvents = 'none'
    })

    // 피드백 표시
    this.showGameResult(success)

    this.log('PROGRESS', {
      action: 'game-completed',
      success,
      matchedPairs: this.matchedPairs,
      totalPairs: this.totalPairs,
      attempts: this.attempts,
      timeSpent: this.getTimeSpent()
    })

    // 완료 처리
    setTimeout(() => {
      this.finalize()
    }, 3000)
  }

  private showGameResult(success: boolean): void {
    const params = this.params as MemoryGameParams
    const feedbackArea = this.container!.querySelector('#feedback-area') as HTMLElement
    const feedbackContent = feedbackArea.querySelector('.feedback-content') as HTMLElement
    
    let message = success ? 
      params.successMessage || '🎉 축하합니다! 모든 카드를 맞췄습니다!' :
      params.failureMessage || '😔 시간이 부족했습니다. 다시 시도해보세요!'
    
    const timeSpent = this.getTimeSpent()
    message += `<div class="game-stats">
      <div>매칭된 쌍: ${this.matchedPairs}/${this.totalPairs}</div>
      <div>시도 횟수: ${this.attempts}번</div>
      <div>소요 시간: ${timeSpent}초</div>
    </div>`

    feedbackContent.innerHTML = message
    feedbackArea.className = `feedback-area ${success ? 'feedback-success' : 'feedback-failure'}`
    feedbackArea.style.display = 'block'

    this.announceToScreenReader(success ? '게임 완료! 모든 카드를 맞췄습니다!' : '게임이 종료되었습니다.')
  }

  private getTimeSpent(): number {
    const params = this.params as MemoryGameParams
    if (params.timeLimit) {
      return params.timeLimit - this.remainingTime
    }
    return Math.floor((Date.now() - this.startTime) / 1000)
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    if (!this.gameStarted || this.gameCompleted) return

    const cards = Array.from(this.container!.querySelectorAll('.memory-card')) as HTMLElement[]
    const activeElement = document.activeElement as HTMLElement
    const currentIndex = cards.indexOf(activeElement)

    let targetIndex = currentIndex

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        targetIndex = (currentIndex + 1) % cards.length
        break
      case 'ArrowLeft':
        event.preventDefault()
        targetIndex = ((currentIndex - 1) + cards.length) % cards.length
        break
      case 'ArrowDown':
        event.preventDefault()
        targetIndex = (currentIndex + this.gridColumns) % cards.length
        break
      case 'ArrowUp':
        event.preventDefault()
        targetIndex = ((currentIndex - this.gridColumns) + cards.length) % cards.length
        break
      default:
        return
    }

    cards[targetIndex].focus()
  }

  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  async showHint(level: number = 1): Promise<void> {
    const params = this.params as MemoryGameParams
    
    if (!params.hints || params.hints.length === 0) {
      this.showMessage('힌트가 없습니다.', 'info')
      return
    }

    const hintIndex = Math.min(level - 1, params.hints.length - 1)
    const hint = params.hints[hintIndex]
    
    this.showMessage(`💡 힌트: ${hint}`, 'info')
    this.announceToScreenReader(`힌트: ${hint}`)
  }

  async restartGame(): Promise<void> {
    // 게임 상태 초기화
    this.gameStarted = false
    this.gameCompleted = false
    this.matchedPairs = 0
    this.attempts = 0
    this.flippedCards = []

    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    const params = this.params as MemoryGameParams
    if (params.timeLimit) {
      this.remainingTime = params.timeLimit
    }

    // 카드 상태 초기화
    this.cardStates.forEach(state => {
      state.isFlipped = false
      state.isMatched = false
    })

    // 카드 다시 섞기
    if (params.shuffle !== false) {
      this.shuffleArray(this.shuffledCards)
    }

    // UI 다시 렌더링
    this.renderGame()
    this.setupEventListeners()
    this.setupAccessibility()

    this.log('PROGRESS', { action: 'game-restarted' })
    this.announceToScreenReader('게임이 다시 시작되었습니다.')
  }

  async unmount(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.cleanup()
  }

  async getResult(): Promise<ActivityResult> {
    const params = this.params as MemoryGameParams
    const successRate = this.matchedPairs / this.totalPairs
    const timeSpent = this.getTimeSpent()
    
    // 점수 계산 (성공률 + 시간 보너스 + 시도 패널티)
    let score = successRate
    
    // 시간 보너스 (빨리 완료할수록 높은 점수)
    if (params.timeLimit && successRate === 1) {
      const timeBonus = (this.remainingTime / params.timeLimit) * 0.2
      score += timeBonus
    }
    
    // 시도 패널티 (적은 시도로 완료할수록 높은 점수)
    if (params.maxAttempts && this.attempts > 0) {
      const attemptPenalty = (this.attempts / params.maxAttempts) * 0.1
      score = Math.max(0, score - attemptPenalty)
    }
    
    score = Math.min(1, score) // 최대 점수 1로 제한
    
    return {
      score,
      durationMs: Date.now() - this.startTime,
      details: {
        matchedPairs: this.matchedPairs,
        totalPairs: this.totalPairs,
        successRate,
        attempts: this.attempts,
        timeSpent,
        remainingTime: this.remainingTime,
        gameCompleted: this.gameCompleted,
        interactions: this.status.interactions
      }
    }
  }
}

export default function createMemoryGameTemplate(): MemoryGameActivityTemplate {
  return new MemoryGameActivityTemplate()
}