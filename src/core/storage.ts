import type { ActivityStorage } from '../types/activity'

export class CoreStorage implements ActivityStorage {
  private prefix: string
  private maxSize: number // bytes
  
  constructor(prefix = 'lesson-platform:', maxSize = 10 * 1024 * 1024) { // 10MB
    this.prefix = prefix
    this.maxSize = maxSize
  }

  async get(key: string): Promise<any> {
    try {
      const fullKey = this.prefix + key
      const value = localStorage.getItem(fullKey)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const fullKey = this.prefix + key
      const serialized = JSON.stringify(value)
      
      // 크기 체크
      if (serialized.length > this.maxSize) {
        throw new Error(`Value too large: ${serialized.length} bytes (max: ${this.maxSize})`)
      }
      
      // 전체 스토리지 크기 체크
      const currentSize = this.getCurrentSize()
      if (currentSize + serialized.length > this.maxSize) {
        // 오래된 항목들 정리
        await this.cleanup()
        
        // 여전히 크다면 에러
        const newSize = this.getCurrentSize()
        if (newSize + serialized.length > this.maxSize) {
          throw new Error('Storage quota exceeded')
        }
      }
      
      localStorage.setItem(fullKey, serialized)
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error)
      throw error
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const fullKey = this.prefix + key
      localStorage.removeItem(fullKey)
    } catch (error) {
      console.error(`Storage remove error for key ${key}:`, error)
      throw error
    }
  }

  // 현재 사용중인 스토리지 크기 계산
  private getCurrentSize(): number {
    let totalSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += value.length
        }
      }
    }
    return totalSize
  }

  // 오래된 항목들 정리 (LRU 방식)
  private async cleanup(): Promise<void> {
    const items: { key: string; timestamp: number; size: number }[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            const parsed = JSON.parse(value)
            const timestamp = parsed._timestamp || 0
            items.push({
              key,
              timestamp,
              size: value.length
            })
          }
        } catch (error) {
          // 파싱 실패한 항목은 삭제 대상
          items.push({
            key,
            timestamp: 0,
            size: (localStorage.getItem(key) || '').length
          })
        }
      }
    }
    
    // 타임스탬프 기준으로 정렬 (오래된 순)
    items.sort((a, b) => a.timestamp - b.timestamp)
    
    // 전체 크기의 25% 정도 정리
    const targetSize = this.getCurrentSize() * 0.25
    let cleanedSize = 0
    
    for (const item of items) {
      if (cleanedSize >= targetSize) break
      
      localStorage.removeItem(item.key)
      cleanedSize += item.size
    }
  }

  // 항목 저장시 타임스탬프 추가
  async setWithTimestamp(key: string, value: any): Promise<void> {
    const wrappedValue = {
      ...value,
      _timestamp: Date.now()
    }
    await this.set(key, wrappedValue)
  }

  // 모든 키 나열
  async keys(): Promise<string[]> {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length))
      }
    }
    return keys
  }

  // 스토리지 상태 정보
  async getInfo(): Promise<{
    totalItems: number
    totalSize: number
    maxSize: number
    usage: number // 0-1
  }> {
    const keys = await this.keys()
    const totalSize = this.getCurrentSize()
    
    return {
      totalItems: keys.length,
      totalSize,
      maxSize: this.maxSize,
      usage: totalSize / this.maxSize
    }
  }

  // 전체 정리
  async clear(): Promise<void> {
    const keys = await this.keys()
    for (const key of keys) {
      await this.remove(key)
    }
  }
}