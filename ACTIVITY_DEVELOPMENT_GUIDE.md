# 🎯 액티비티 개발 가이드

## 📌 개요
이 문서는 교육 플랫폼에서 새로운 액티비티(활동)를 개발하고 추가하는 방법을 설명합니다.

## 🎯 1. 액티비티 개발 기준

### 1.1 기본 원칙
- **교육적 가치**: 명확한 학습 목표가 있어야 함
- **사용자 친화성**: 직관적이고 접근하기 쉬운 인터페이스
- **반응형 디자인**: 모든 디바이스에서 작동
- **접근성**: 장애인도 사용할 수 있는 디자인
- **성능**: 빠른 로딩과 매끄러운 상호작용

### 1.2 액티비티 유형별 기준
- **평가형**: 명확한 정답/오답 체계
- **탐색형**: 자유로운 탐색과 발견 기능
- **게임형**: 재미있고 몰입감 있는 경험
- **미디어형**: 고품질 콘텐츠 제공
- **협업형**: 다중 사용자 상호작용

## 🏗️ 2. 템플릿 개발 구조

### 2.1 필수 인터페이스 (ActivityModule)
모든 액티비티는 다음 인터페이스를 구현해야 합니다:

```javascript
interface ActivityModule {
  id: string                    // 고유 식별자 (예: "quiz@1.0.0")
  paramsSchema: JSONSchema      // 파라미터 스키마 정의
  mount(container, params, context): Promise<void>   // 액티비티 마운트
  unmount(): Promise<void>      // 액티비티 언마운트
  getResult(): Promise<ActivityResult>  // 결과 반환
}
```

### 2.2 파라미터 스키마 (JSON Schema)
액티비티의 설정 가능한 파라미터를 정의합니다:

```javascript
paramsSchema: {
  type: 'object',
  properties: {
    title: { 
      type: 'string', 
      description: '액티비티 제목',
      minLength: 1,
      maxLength: 100
    },
    difficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    timeLimit: {
      type: 'number',
      minimum: 10,
      maximum: 300,
      description: '제한 시간(초)'
    },
    // ... 기타 파라미터
  },
  required: ['title'],
  additionalProperties: false
}
```

### 2.3 컨텍스트 객체
액티비티에 전달되는 컨텍스트 정보:

```javascript
interface ActivityContext {
  activityId: string      // 액티비티 인스턴스 ID
  eventBus: EventBus     // 이벤트 버스
  userId?: string        // 사용자 ID
  locale?: string        // 언어 설정
}
```

## 📁 3. 파일 구조

새로운 액티비티는 다음과 같은 구조로 생성합니다:

```
src/templates/my-activity/
├── my-activity-template.ts    # 메인 템플릿 로직
├── my-activity.css           # 스타일시트
├── my-activity-schema.json   # 파라미터 스키마
└── README.md                # 액티비티 문서
```

## 🔧 4. 개발 단계별 가이드

### 4.1 계획 단계
1. **학습 목표 정의**: 무엇을 가르칠 것인가?
2. **상호작용 설계**: 사용자가 어떻게 상호작용할 것인가?
3. **평가 방식**: 어떻게 결과를 측정할 것인가?
4. **시각적 디자인**: UI/UX 목업 제작

### 4.2 개발 단계
1. **스키마 정의**: 파라미터 스키마 작성
2. **템플릿 구현**: 핵심 로직 개발
3. **스타일링**: CSS 및 반응형 디자인
4. **테스트**: 다양한 시나리오 테스트

### 4.3 등록 단계
1. **orchestrator.js 등록**: 템플릿 레지스트리에 추가
2. **API 등록**: `/api/templates` 엔드포인트에 추가
3. **문서화**: 사용법과 예제 작성

## 🎨 5. 스타일 가이드라인

### 5.1 색상 팔레트
```css
:root {
  /* Primary Colors */
  --primary-blue: #3b82f6;
  --primary-dark: #1e40af;
  
  /* Success/Error */
  --success-green: #22c55e;
  --error-red: #ef4444;
  --warning-yellow: #f59e0b;
  
  /* Neutral */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #e6edf7;
  --text-secondary: #94a3b8;
}
```

### 5.2 디자인 원칙
- **다크 테마**: 기본 다크 모드 지원
- **고대비**: 접근성을 위한 충분한 대비
- **애니메이션**: 부드럽고 의미있는 트랜지션
- **반응형**: 모든 스크린 크기 지원

## 📊 6. 이벤트 시스템

액티비티는 다음 이벤트들을 발생시켜야 합니다:

### 6.1 필수 이벤트
```javascript
// 시작
context.eventBus.emit({
  type: 'START',
  activityId: context.activityId,
  timestamp: Date.now()
})

// 진행률 업데이트
context.eventBus.emit({
  type: 'PROGRESS', 
  activityId: context.activityId,
  payload: { progress: 0.5 } // 0.0 ~ 1.0
})

// 완료
context.eventBus.emit({
  type: 'COMPLETE',
  activityId: context.activityId,
  payload: { 
    score: 0.85,
    success: true 
  }
})
```

### 6.2 선택적 이벤트
- `INTERACTION`: 사용자 상호작용
- `ERROR`: 오류 발생
- `HINT_USED`: 힌트 사용
- `ATTEMPT`: 시도 횟수

## 🔍 7. 테스트 가이드라인

### 7.1 필수 테스트 항목
- [ ] 파라미터 유효성 검증
- [ ] 모든 브라우저에서 작동
- [ ] 모바일 디바이스 호환성
- [ ] 접근성 기준 충족
- [ ] 성능 최적화

### 7.2 테스트 시나리오
```javascript
// 테스트용 파라미터 세트
const testParams = {
  basic: { /* 기본 설정 */ },
  minimal: { /* 최소 필수 설정 */ },
  complex: { /* 복잡한 설정 */ },
  edge: { /* 극단적 케이스 */ }
}
```

## 📝 8. 문서화 요구사항

각 액티비티는 다음을 포함한 README.md를 작성해야 합니다:

```markdown
# [액티비티 이름]

## 개요
- 학습 목표
- 대상 연령/수준
- 예상 소요시간

## 파라미터
| 파라미터 | 타입 | 필수 | 설명 | 기본값 |
|----------|------|------|------|--------|
| title | string | O | 제목 | - |

## 사용 예제
[JSON 예제 코드]

## 스크린샷
[실제 사용 화면]
```

## 🚀 9. 성능 최적화

### 9.1 로딩 성능
- 이미지 최적화 (WebP, lazy loading)
- 코드 분할 및 동적 import
- CSS 최소화
- 캐싱 전략

### 9.2 실행 성능
- 60fps 유지
- 메모리 누수 방지
- 이벤트 리스너 정리
- DOM 조작 최소화

## 🔐 10. 보안 고려사항

- XSS 방지: 사용자 입력 검증
- CSRF 보호: 적절한 토큰 사용
- 데이터 유효성: 클라이언트/서버 양측 검증
- 개인정보: 최소한의 데이터만 수집

---

## 📞 지원 및 문의

개발 중 문제가 있거나 질문이 있을 경우:
1. GitHub Issues 생성
2. 개발팀 슬랙 채널
3. 기술 문서 참조

---
*이 가이드는 지속적으로 업데이트됩니다. 최신 버전을 확인해주세요.*