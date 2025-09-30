import type { 
  ActivityEventBus, 
  ActivityEvent, 
  ActivityEventType, 
  ActivityEventHandler 
} from '../types/activity'

export class CoreEventBus implements ActivityEventBus {
  private handlers: Map<ActivityEventType, Set<ActivityEventHandler>> = new Map()
  private eventHistory: ActivityEvent[] = []
  private maxHistorySize = 1000

  emit(event: ActivityEvent): void {
    // 이벤트에 타임스탬프 추가
    const enrichedEvent: ActivityEvent = {
      ...event,
      timestamp: event.timestamp || Date.now()
    }

    // 히스토리에 저장
    this.eventHistory.push(enrichedEvent)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // 핸들러 호출
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

    // 글로벌 이벤트도 발송 ('*' 타입)
    const globalHandlers = this.handlers.get('*' as ActivityEventType)
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

  on(type: ActivityEventType, handler: ActivityEventHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)
  }

  off(type: ActivityEventType, handler: ActivityEventHandler): void {
    const eventHandlers = this.handlers.get(type)
    if (eventHandlers) {
      eventHandlers.delete(handler)
      if (eventHandlers.size === 0) {
        this.handlers.delete(type)
      }
    }
  }

  // 유틸리티 메서드들
  getEventHistory(activityId?: string, type?: ActivityEventType): ActivityEvent[] {
    let events = this.eventHistory

    if (activityId) {
      events = events.filter(e => e.activityId === activityId)
    }

    if (type) {
      events = events.filter(e => e.type === type)
    }

    return events
  }

  clearHistory(): void {
    this.eventHistory = []
  }

  getHandlerCount(type?: ActivityEventType): number {
    if (type) {
      return this.handlers.get(type)?.size || 0
    }
    
    let total = 0
    this.handlers.forEach(handlers => total += handlers.size)
    return total
  }

  // 이벤트 패턴 매칭
  onPattern(pattern: RegExp, handler: ActivityEventHandler): void {
    // 모든 이벤트를 감시하고 패턴 매칭
    this.on('*' as ActivityEventType, (event) => {
      if (pattern.test(event.type)) {
        handler(event)
      }
    })
  }

  // 디버깅용 - 모든 이벤트 로깅
  enableDebugLogging(): void {
    this.on('*' as ActivityEventType, (event) => {
      console.log(`[EventBus] ${event.type}:`, event)
    })
  }
}