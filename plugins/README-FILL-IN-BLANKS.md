# ✏️ Fill in the Blanks Plugin

빈칸 채우기 액티비티 플러그인 - 문장의 빈칸을 사용자가 직접 입력하여 완성하는 인터랙티브 학습 도구

## 📋 개요

- **플러그인 ID**: `fill-in-blanks@1.0.0`
- **버전**: 1.0.0
- **작성자**: UnimationKorea AI Team
- **라이선스**: MIT
- **카테고리**: Assessment (평가)

## ✨ 주요 기능

### 🎯 핵심 기능
- ✅ 다중 빈칸 지원 (무제한)
- ✅ 대체 정답 지원 (동의어, 유사어)
- ✅ 대소문자 구분 옵션
- ✅ 힌트 시스템
- ✅ 타이머 기능
- ✅ 실시간 피드백
- ✅ 진행률 표시
- ✅ 다중 시도 허용
- ✅ 자동 완료 체크

### 🎨 UI/UX
- 🌈 그라디언트 배경
- 📱 반응형 디자인 (모바일/태블릿/데스크톱)
- 🎭 애니메이션 효과
- 🔔 시각적 피드백 (정답/오답)
- ⏰ 타이머 경고 색상 (30초/10초)

### 🔔 이벤트 시스템
- `activity:started` - 액티비티 시작
- `activity:completed` - 액티비티 완료
- `activity:timeout` - 시간 초과

## 📦 설치 및 사용

### 1. 플러그인 로드

#### HTML에서 직접 로드
```html
<!-- 플러그인 시스템 -->
<script src="plugin-system.js"></script>

<!-- Fill in the Blanks 플러그인 -->
<script src="plugins/fill-in-blanks-plugin.js"></script>
```

#### JavaScript에서 동적 로드
```javascript
await window.PluginSystem.loadExternalPlugin(
  'https://cdn.jsdelivr.net/gh/UnimationKorea/core_plugin@main/plugins/fill-in-blanks-plugin.js'
);
```

### 2. 액티비티 생성

```javascript
const activity = {
  activityId: 'my-activity-1',
  template: 'fill-in-blanks@1.0.0',
  params: {
    title: '빈칸 채우기',
    sentence: '고양이가 {blank}를 쫓는다.',
    blanks: [
      { 
        id: 'blank-1', 
        position: '{blank}', 
        answer: '쥐',
        alternatives: ['쥐', '생쥐'] // 선택사항
      }
    ],
    showHints: true,
    hints: ['작은 동물', '치즈를 좋아함'],
    timeLimit: 60 // 초 (0 = 무제한)
  }
};

// 렌더링
const container = document.getElementById('container');
window.PluginSystem.renderActivity(activity, container);
```

## 🔧 파라미터 설명

### 필수 파라미터

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `sentence` | string | 빈칸이 포함된 문장 (예: "나는 {blank}입니다.") |
| `blanks` | array | 빈칸 정의 배열 |

#### blanks 배열 항목

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | string | ✅ | 빈칸 고유 ID |
| `position` | string | ✅ | 문장 내 위치 표시자 (예: "{blank}") |
| `answer` | string | ✅ | 정답 |
| `alternatives` | array | ❌ | 대체 정답 목록 (동의어) |

### 선택적 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| `title` | string | "빈칸 채우기" | 액티비티 제목 |
| `caseSensitive` | boolean | false | 대소문자 구분 여부 |
| `showHints` | boolean | true | 힌트 표시 여부 |
| `hints` | array | [] | 힌트 목록 |
| `timeLimit` | number | 0 | 제한 시간(초), 0=무제한 |
| `allowMultipleAttempts` | boolean | true | 다중 시도 허용 |
| `showProgressBar` | boolean | true | 진행률 표시 |
| `autoCheckOnComplete` | boolean | false | 자동 완료 체크 |
| `feedback` | object | {...} | 피드백 메시지 커스터마이즈 |

#### feedback 객체

```javascript
feedback: {
  correct: '정답입니다! 🎉',
  incorrect: '다시 시도해보세요. 💭',
  timeout: '시간이 종료되었습니다! ⏰',
  complete: '모든 빈칸을 완성했습니다! 🌟'
}
```

## 💡 사용 예제

### 예제 1: 기본 사용
```javascript
{
  template: 'fill-in-blanks@1.0.0',
  params: {
    title: '간단한 문장',
    sentence: '고양이가 {blank}를 쫓는다.',
    blanks: [
      { id: 'blank-1', position: '{blank}', answer: '쥐' }
    ]
  }
}
```

### 예제 2: 복수 빈칸
```javascript
{
  template: 'fill-in-blanks@1.0.0',
  params: {
    title: '복수 빈칸 테스트',
    sentence: '나는 {blank1}에서 {blank2}를 공부합니다.',
    blanks: [
      { id: 'blank-1', position: '{blank1}', answer: '학교' },
      { id: 'blank-2', position: '{blank2}', answer: '수학' }
    ]
  }
}
```

### 예제 3: 힌트 포함
```javascript
{
  template: 'fill-in-blanks@1.0.0',
  params: {
    title: '힌트가 있는 문제',
    sentence: '한국의 수도는 {blank}입니다.',
    blanks: [
      { id: 'blank-1', position: '{blank}', answer: '서울' }
    ],
    showHints: true,
    hints: [
      '대한민국의 수도',
      '한강이 흐르는 도시',
      '인구가 가장 많은 도시'
    ]
  }
}
```

### 예제 4: 타이머 및 대체 정답
```javascript
{
  template: 'fill-in-blanks@1.0.0',
  params: {
    title: '시간 제한 문제',
    sentence: '가장 큰 동물은 {blank}입니다.',
    blanks: [
      { 
        id: 'blank-1', 
        position: '{blank}', 
        answer: '고래',
        alternatives: ['고래', '흰수염고래', '대왕고래']
      }
    ],
    timeLimit: 30,
    hints: ['바다에 사는 동물', '포유류입니다']
  }
}
```

### 예제 5: 커스텀 피드백
```javascript
{
  template: 'fill-in-blanks@1.0.0',
  params: {
    title: '역사 문제',
    sentence: '세종대왕은 {blank}을 창제했습니다.',
    blanks: [
      { 
        id: 'blank-1', 
        position: '{blank}', 
        answer: '한글',
        alternatives: ['한글', '훈민정음']
      }
    ],
    feedback: {
      correct: '훌륭합니다! 한글의 역사를 잘 알고 계시네요! 🎉',
      incorrect: '다시 한 번 생각해보세요. 💭',
      complete: '완벽합니다! 한국 역사 지식이 훌륭하네요! 🌟'
    }
  }
}
```

## 🎓 레슨 통합

### 레슨 JSON 예제

```json
{
  "lessonId": "grammar-lesson-001",
  "title": "한국어 문법 연습",
  "flow": [
    {
      "activityId": "activity-1",
      "template": "fill-in-blanks@1.0.0",
      "params": {
        "title": "조사 넣기",
        "sentence": "나{blank1} 친구{blank2} 만났다.",
        "blanks": [
          { "id": "blank-1", "position": "{blank1}", "answer": "는" },
          { "id": "blank-2", "position": "{blank2}", "answer": "를" }
        ],
        "hints": ["주격 조사", "목적격 조사"]
      }
    }
  ]
}
```

## 🔔 이벤트 처리

### 이벤트 리스너 등록

```javascript
// 액티비티 시작 이벤트
window.PluginSystem.on('activity:started', (data) => {
  console.log('시작:', data);
});

// 액티비티 완료 이벤트
window.PluginSystem.on('activity:completed', (data) => {
  console.log('완료:', data);
  console.log('점수:', data.score); // 0.0 ~ 1.0
  console.log('소요 시간:', data.durationMs, 'ms');
  console.log('시도 횟수:', data.attempts);
});

// 시간 초과 이벤트
window.PluginSystem.on('activity:timeout', (data) => {
  console.log('시간 초과:', data);
});
```

### 완료 이벤트 데이터 구조

```javascript
{
  activityId: "activity-1",
  score: 1.0,           // 0.0 ~ 1.0 (100%)
  success: true,        // 성공 여부
  durationMs: 15432,    // 소요 시간 (밀리초)
  attempts: 2,          // 시도 횟수
  details: {
    correctCount: 3,    // 정답 개수
    totalCount: 3,      // 전체 빈칸 개수
    userAnswers: {      // 사용자 답변
      0: "학교",
      1: "수학"
    }
  }
}
```

## 🧪 테스트

### 테스트 페이지
플러그인 테스트 페이지를 제공합니다:
```
/test-fill-in-blanks.html
```

### 테스트 시나리오
1. **기본 테스트**: 단순한 단일 빈칸
2. **복수 빈칸**: 여러 개의 빈칸
3. **힌트 포함**: 힌트 시스템 테스트
4. **타이머**: 제한 시간 기능
5. **대체 정답**: 동의어 처리
6. **복잡한 문장**: 긴 문장과 다중 빈칸

### 수동 테스트 방법

1. 테스트 페이지 열기
```bash
# 개발 서버 실행 (이미 실행 중)
# 브라우저에서 접속
https://your-domain.com/test-fill-in-blanks.html
```

2. 시나리오 선택 후 "테스트 로드" 클릭

3. 빈칸 입력 및 "정답 확인" 클릭

4. 이벤트 로그 확인

## 🎨 스타일 커스터마이징

### CSS 변수 오버라이드

```css
.fill-in-blanks-container {
  /* 배경 그라디언트 변경 */
  background: linear-gradient(135deg, #your-color-1, #your-color-2) !important;
}

.blank-input {
  /* 입력 필드 스타일 변경 */
  border-color: #your-border-color !important;
  font-size: 1.5rem !important;
}
```

### 테마 적용 예제

```javascript
// 커스텀 스타일 주입
const customStyle = document.createElement('style');
customStyle.textContent = `
  .fill-in-blanks-container {
    background: linear-gradient(135deg, #ff6b6b, #feca57) !important;
  }
`;
document.head.appendChild(customStyle);
```

## 📊 성능 최적화

### 권장 사항
- ✅ 빈칸 개수: 1~10개 (최적)
- ✅ 문장 길이: 200자 이내 권장
- ✅ 힌트 개수: 3~5개 권장
- ✅ 타이머: 30초~120초 권장

### 메모리 사용
- 평균 메모리: ~2MB
- 최대 메모리: ~5MB (복잡한 경우)

## 🐛 문제 해결

### 플러그인이 로드되지 않음
```javascript
// 콘솔에서 확인
console.log(window.PluginSystem);
console.log(window.PluginSystem.hasTemplate('fill-in-blanks@1.0.0'));
```

### 렌더링 오류
1. 파라미터 검증 확인
2. 브라우저 콘솔 에러 메시지 확인
3. sentence에 position이 정확히 포함되어 있는지 확인

### 이벤트가 발생하지 않음
```javascript
// 이벤트 리스너가 등록되었는지 확인
console.log(window.PluginSystem.eventHandlers);
```

## 🔐 보안

### XSS 방지
- 모든 사용자 입력은 `escapeHtml()` 함수로 이스케이프 처리
- innerHTML 사용 시 검증된 데이터만 사용

### 입력 검증
- 파라미터 타입 체크
- 필수 필드 존재 여부 확인
- position이 sentence에 존재하는지 검증

## 📝 버전 히스토리

### v1.0.0 (2025-10-21)
- ✨ 초기 릴리스
- ✅ 기본 빈칸 채우기 기능
- ✅ 다중 빈칸 지원
- ✅ 힌트 시스템
- ✅ 타이머 기능
- ✅ 대체 정답 지원
- ✅ 진행률 표시
- ✅ 이벤트 시스템

## 🤝 기여하기

이슈나 개선 사항이 있다면 GitHub에 제보해주세요:
- GitHub: https://github.com/UnimationKorea/core_plugin
- Issues: https://github.com/UnimationKorea/core_plugin/issues

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

**제작**: UnimationKorea AI Team  
**문의**: plugin-support@unimationkorea.com  
**웹사이트**: https://unimationkorea.com
