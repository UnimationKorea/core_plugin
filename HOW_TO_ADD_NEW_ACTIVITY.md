# 🎯 신규 액티비티 추가 완전 가이드

## 📌 개요
이 문서는 교육 플랫폼에 새로운 액티비티를 개발하고 추가하는 완전한 절차를 설명합니다.

---

## 🚀 **빠른 시작 가이드**

### 1. 개발 기준 확인
- **교육적 가치**: 명확한 학습 목표 필수
- **사용자 경험**: 직관적이고 접근하기 쉬운 UI
- **기술적 호환성**: 모든 브라우저와 디바이스에서 작동
- **성능**: 빠른 로딩과 반응성

### 2. 필수 구현 요소
- **ActivityModule 인터페이스** 준수
- **JSON Schema** 파라미터 정의  
- **이벤트 시스템** 연동
- **접근성** 고려 (키보드, 스크린 리더 지원)

---

## 📁 **단계별 개발 프로세스**

### **Step 1: 프로젝트 구조 생성**

```bash
# 새 액티비티 디렉토리 생성
mkdir -p src/templates/[activity-name]/

# 예시: 단어 맞추기
mkdir -p src/templates/word-guess/
```

### **Step 2: 파라미터 스키마 정의**

`src/templates/[activity-name]/[activity-name]-schema.json`

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "액티비티 제목",
      "minLength": 1,
      "maxLength": 100
    }
  },
  "required": ["title"],
  "additionalProperties": false
}
```

### **Step 3: 스타일시트 작성**

`src/templates/[activity-name]/[activity-name].css`

```css
/* 플랫폼 표준 색상 사용 */
:root {
  --primary-blue: #3b82f6;
  --success-green: #22c55e;
  --error-red: #ef4444;
  --bg-primary: #0f172a;
  --text-primary: #e6edf7;
}

.my-activity {
  padding: 24px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 12px;
}

/* 반응형 디자인 필수 */
@media (max-width: 768px) {
  .my-activity {
    padding: 16px;
  }
}

/* 접근성 지원 필수 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### **Step 4: 메인 템플릿 구현**

`src/templates/[activity-name]/[activity-name]-template.ts`

```typescript
export interface MyActivityParams {
  title: string
  // ... 기타 파라미터
}

export interface MyActivityContext {
  activityId: string
  eventBus: {
    emit(event: { type: string; activityId: string; timestamp?: number; payload?: any }): void
  }
}

export class MyActivityTemplate {
  private params: MyActivityParams
  private context: MyActivityContext
  private container: HTMLElement
  
  constructor(container: HTMLElement, params: MyActivityParams, context: MyActivityContext) {
    this.container = container
    this.params = params
    this.context = context
  }

  async mount(): Promise<void> {
    await this.loadStyles()
    this.render()
    this.setupEventListeners()
    
    // 필수: 시작 이벤트 발생
    this.context.eventBus.emit({
      type: 'START',
      activityId: this.context.activityId,
      timestamp: Date.now()
    })
  }

  private async loadStyles(): Promise<void> {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/static/css/templates/my-activity.css'
    document.head.appendChild(link)
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="my-activity">
        <h2>${this.params.title}</h2>
        <!-- 액티비티 UI -->
      </div>
    `
  }

  private setupEventListeners(): void {
    // 이벤트 리스너 설정
  }

  // 필수: 진행률 업데이트
  private updateProgress(progress: number): void {
    this.context.eventBus.emit({
      type: 'PROGRESS',
      activityId: this.context.activityId,
      payload: { progress } // 0.0 ~ 1.0
    })
  }

  // 필수: 완료 처리
  private complete(success: boolean, score: number): void {
    this.context.eventBus.emit({
      type: 'COMPLETE',
      activityId: this.context.activityId,
      payload: { success, score }
    })
  }

  async unmount(): Promise<void> {
    // 정리 작업
  }

  async getResult() {
    return {
      score: 0.85, // 0.0 ~ 1.0
      success: true,
      durationMs: 60000,
      details: { /* 추가 정보 */ }
    }
  }
}
```

### **Step 5: CSS 파일 배포**

```bash
# CSS를 public 디렉토리로 복사
mkdir -p public/static/css/templates/
cp src/templates/[activity-name]/[activity-name].css public/static/css/templates/
```

---

## 🔧 **시스템 등록 절차**

### **Step 1: orchestrator.js에 등록**

`public/static/js/orchestrator.js` 파일에서:

```javascript
// registerNewTemplates 함수 끝부분에 추가
function registerMyActivityTemplate() {
  window.TemplateRegistry.set('my-activity@1.0.0', {
    id: 'my-activity@1.0.0',
    paramsSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1 }
      },
      required: ['title']
    },
    async mount(container, params, context) {
      // 액티비티 로직 구현
      
      // CSS 로드
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/static/css/templates/my-activity.css'
      document.head.appendChild(link)

      // UI 렌더링
      container.innerHTML = `
        <div class="my-activity">
          <h2>${params.title}</h2>
          <!-- 액티비티 내용 -->
        </div>
      `

      // 이벤트 처리
      // ...

      // 시작 이벤트 발생
      context.eventBus.emit({
        type: 'START',
        activityId: context.activityId,
        timestamp: Date.now()
      })
    },
    async unmount() {
      // 정리 작업
    },
    async getResult() {
      return { score: 0.8, success: true, durationMs: 30000 }
    }
  })
}

// 기존 초기화 코드 뒤에 추가
registerBuiltInTemplates()
registerNewTemplates()
registerMyActivityTemplate() // 새로 추가
```

### **Step 2: API 엔드포인트에 추가**

`src/index.tsx` 파일의 `/api/templates` 엔드포인트에:

```typescript
{
  id: 'my-activity@1.0.0',
  name: '내 액티비티',
  category: 'interaction', // media, interaction, assessment, game 등
  capabilities: ['keyboard', 'mouse', 'touch'],
  paramsSchema: {
    type: 'object',
    properties: {
      title: { 
        type: 'string', 
        description: '액티비티 제목' 
      }
    },
    required: ['title']
  }
}
```

---

## 📋 **테스트 및 검증**

### **필수 테스트 항목**

1. **기능 테스트**
   - [ ] 파라미터 유효성 검증
   - [ ] 모든 상호작용 동작
   - [ ] 이벤트 발생 확인
   - [ ] 결과 데이터 정확성

2. **호환성 테스트**
   - [ ] Chrome, Firefox, Safari, Edge
   - [ ] 데스크톱, 태블릿, 모바일
   - [ ] 키보드 전용 조작
   - [ ] 스크린 리더 지원

3. **성능 테스트**
   - [ ] 3초 이내 로딩
   - [ ] 60fps 유지
   - [ ] 메모리 누수 없음

### **테스트용 샘플 JSON**

```json
{
  "lessonId": "test-my-activity",
  "title": "내 액티비티 테스트",
  "flow": [
    {
      "activityId": "test-1",
      "template": "my-activity@1.0.0",
      "params": {
        "title": "테스트 액티비티"
      }
    }
  ]
}
```

---

## 🚀 **배포 절차**

### **Step 1: 빌드 및 재시작**

```bash
cd /home/user/webapp

# 빌드
npm run build

# 서버 재시작
pm2 restart webapp
```

### **Step 2: 등록 확인**

```bash
# API에서 템플릿 확인
curl -s http://localhost:3000/api/templates | jq '.templates[] | select(.id == "my-activity@1.0.0")'

# 브라우저에서 테스트
# 1. 템플릿 카탈로그에서 확인
# 2. 미리보기로 테스트
# 3. 빌더에서 레슨 작성
```

---

## 📚 **실제 예제: 단어 맞추기**

구현된 "단어 맞추기" 액티비티를 참조하세요:

- **소스 코드**: `src/templates/word-guess/`
- **문서**: `src/templates/word-guess/README.md`  
- **샘플**: `sample-lesson-word-guess.json`
- **테스트 URL**: https://3000-ia40t94o18s60hijnc2ja-6532622b.e2b.dev

---

## 🔧 **고급 기능**

### **A. 다국어 지원**
```javascript
const messages = {
  ko: { title: '제목', start: '시작' },
  en: { title: 'Title', start: 'Start' }
}
```

### **B. 외부 리소스 활용**
```javascript
// 이미지 로드
const img = new Image()
img.onload = () => { /* 처리 */ }
img.src = params.imageUrl

// 오디오 재생
const audio = new Audio(params.audioUrl)
await audio.play()
```

### **C. 로컬 스토리지 활용**
```javascript
// 진행상황 저장
localStorage.setItem(`activity-${context.activityId}`, JSON.stringify(state))

// 복원
const saved = localStorage.getItem(`activity-${context.activityId}`)
if (saved) state = JSON.parse(saved)
```

---

## ⚠️ **주의사항 및 제한사항**

### **Cloudflare Pages 제약**
- **파일 시스템**: 런타임에 파일 읽기/쓰기 불가
- **Node.js API**: `fs`, `path` 등 사용 불가
- **서버 프로세스**: 지속적인 백그라운드 프로세스 불가
- **데이터베이스**: 로컬 DB 불가 (외부 API 사용)

### **보안 고려사항**
- **XSS 방지**: 사용자 입력 검증 필수
- **콘텐츠 보안**: 외부 리소스 검증
- **개인정보**: 최소한의 데이터만 수집

### **성능 최적화**
- **이미지 최적화**: WebP 형식 사용
- **CSS 최소화**: 불필요한 스타일 제거
- **JavaScript 분할**: 필요시에만 로드

---

## 📞 **지원 및 문의**

### **도움이 필요할 때**
1. **개발 가이드**: `ACTIVITY_DEVELOPMENT_GUIDE.md` 참조
2. **기존 템플릿**: `src/templates/` 디렉토리 예제 확인
3. **API 문서**: `/api/templates` 엔드포인트 확인
4. **샘플 파일**: `sample-lesson-*.json` 파일들 참조

### **문제 해결**
- **빌드 오류**: TypeScript 문법 및 타입 확인
- **스타일 오류**: CSS 경로 및 문법 확인
- **등록 오류**: orchestrator.js 함수명 확인
- **API 오류**: index.tsx 스키마 구문 확인

---

## 🎯 **체크리스트**

새 액티비티 추가 시 다음을 확인하세요:

- [ ] 파라미터 스키마 JSON 작성
- [ ] CSS 스타일시트 작성 및 배포
- [ ] TypeScript 템플릿 구현
- [ ] orchestrator.js에 등록
- [ ] API 엔드포인트에 추가
- [ ] 샘플 JSON 파일 작성
- [ ] README.md 문서 작성
- [ ] 빌드 및 배포
- [ ] 브라우저 테스트
- [ ] 접근성 테스트
- [ ] 모바일 테스트

**완료되면 새로운 액티비티가 플랫폼에 정상적으로 추가됩니다!** 🎉

---
*이 가이드는 지속적으로 업데이트됩니다. 피드백이나 개선사항이 있으면 알려주세요.*