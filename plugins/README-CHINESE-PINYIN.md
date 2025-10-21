# 🀄 중국어 한자-병음 매칭 플러그인 (Chinese Pinyin Match Plugin)

## 📖 개요 (Overview)

중국어 학습을 위한 인터랙티브 한자-병음 매칭 플러그인입니다. 드래그 앤 드롭 방식으로 한자 카드와 병음 카드를 매칭하며 학습할 수 있습니다.

An interactive Chinese character-Pinyin matching plugin for Chinese language learning. Students match Hanzi cards with their corresponding Pinyin through drag & drop interaction.

---

## ✨ 주요 기능 (Key Features)

### 🎯 핵심 기능
- **드래그 앤 드롭 매칭**: HTML5 Drag & Drop API를 활용한 직관적인 인터페이스
- **실시간 피드백**: 매칭 성공/실패에 대한 즉각적인 시각적 피드백
- **통계 추적**: 정답/오답 횟수, 정답률 실시간 표시
- **힌트 시스템**: 뜻(meaning)을 통한 학습 보조 기능
- **카드 셔플**: 매번 다른 순서로 카드 배치 (선택적)
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기 지원

### 🎨 사용자 경험
- **시각적 피드백**: 
  - ✅ 정답: 녹색 테두리 + "맞았습니다!" 메시지
  - ❌ 오답: 빨간색 테두리 + 흔들림 애니메이션
  - 🎯 드래그 오버: 병음 카드 하이라이트
- **접근성**: 
  - 고대비 색상 사용 (색맹 대응)
  - 터치 및 마우스 동시 지원
  - 명확한 시각적 구분

---

## 🚀 빠른 시작 (Quick Start)

### 1. 플러그인 등록

```javascript
// 플러그인 로드
const script = document.createElement('script');
script.src = './plugins/chinese-pinyin-match-plugin.js';
document.head.appendChild(script);
```

### 2. 기본 사용 예제

```javascript
// Activity 구성
const activity = {
  id: 'greeting-lesson',
  type: 'chinese-pinyin-match@1.0.0',
  title: '중국어 기초 인사',
  params: {
    words: [
      { hanzi: '你好', pinyin: 'nǐhǎo', meaning: '안녕하세요' },
      { hanzi: '谢谢', pinyin: 'xièxie', meaning: '감사합니다' },
      { hanzi: '再见', pinyin: 'zàijiàn', meaning: '안녕히 가세요' }
    ],
    showHint: true,
    autoShuffle: true
  }
};

// 플러그인 렌더링
const container = document.getElementById('activity-container');
await ChinesePinyinMatchPlugin.render(activity, container);
```

---

## 📋 파라미터 설정 (Parameters)

### `params` 객체 구조

```typescript
interface PluginParams {
  words: Word[];              // 필수: 단어 배열
  showHint?: boolean;         // 선택: 힌트(뜻) 표시 (기본값: true)
  autoShuffle?: boolean;      // 선택: 카드 자동 섞기 (기본값: true)
  successMessage?: string;    // 선택: 성공 메시지 커스터마이징
  failMessage?: string;       // 선택: 실패 메시지 커스터마이징
}

interface Word {
  hanzi: string;     // 필수: 한자 (예: '你好')
  pinyin: string;    // 필수: 병음 (예: 'nǐhǎo')
  meaning: string;   // 필수: 뜻 (예: '안녕하세요')
}
```

### 파라미터 상세 설명

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| `words` | `Word[]` | ✅ | - | 학습할 단어 목록 (최소 1개) |
| `showHint` | `boolean` | ❌ | `true` | 힌트(뜻) 표시 여부 |
| `autoShuffle` | `boolean` | ❌ | `true` | 카드 자동 섞기 여부 |
| `successMessage` | `string` | ❌ | "축하합니다! 모든 매칭을 완료했습니다! 🎉" | 성공 메시지 |
| `failMessage` | `string` | ❌ | "아직 매칭되지 않은 항목이 있습니다. 다시 시도해보세요!" | 실패 메시지 |

---

## 🎓 사용 예제 (Usage Examples)

### 예제 1: 기초 인사말 (힌트 있음)

```json
{
  "id": "basic-greeting",
  "type": "chinese-pinyin-match@1.0.0",
  "title": "🌟 기초 중국어 인사말",
  "params": {
    "words": [
      { "hanzi": "你好", "pinyin": "nǐhǎo", "meaning": "안녕하세요" },
      { "hanzi": "谢谢", "pinyin": "xièxie", "meaning": "감사합니다" },
      { "hanzi": "再见", "pinyin": "zàijiàn", "meaning": "안녕히 가세요" }
    ],
    "showHint": true,
    "autoShuffle": true
  }
}
```

### 예제 2: 숫자 연습 (카드 고정 순서)

```json
{
  "id": "numbers",
  "type": "chinese-pinyin-match@1.0.0",
  "title": "🔢 숫자 익히기",
  "params": {
    "words": [
      { "hanzi": "一", "pinyin": "yī", "meaning": "일(1)" },
      { "hanzi": "二", "pinyin": "èr", "meaning": "이(2)" },
      { "hanzi": "三", "pinyin": "sān", "meaning": "삼(3)" },
      { "hanzi": "四", "pinyin": "sì", "meaning": "사(4)" },
      { "hanzi": "五", "pinyin": "wǔ", "meaning": "오(5)" }
    ],
    "showHint": true,
    "autoShuffle": false
  }
}
```

### 예제 3: 고급 학습 (힌트 없음, 많은 단어)

```json
{
  "id": "advanced-family",
  "type": "chinese-pinyin-match@1.0.0",
  "title": "👨‍👩‍👧‍👦 가족 호칭",
  "params": {
    "words": [
      { "hanzi": "爸爸", "pinyin": "bàba", "meaning": "아버지" },
      { "hanzi": "妈妈", "pinyin": "māma", "meaning": "어머니" },
      { "hanzi": "哥哥", "pinyin": "gēge", "meaning": "오빠/형" },
      { "hanzi": "姐姐", "pinyin": "jiějie", "meaning": "언니/누나" },
      { "hanzi": "弟弟", "pinyin": "dìdi", "meaning": "남동생" },
      { "hanzi": "妹妹", "pinyin": "mèimei", "meaning": "여동생" },
      { "hanzi": "爷爷", "pinyin": "yéye", "meaning": "할아버지" },
      { "hanzi": "奶奶", "pinyin": "nǎinai", "meaning": "할머니" }
    ],
    "showHint": false,
    "autoShuffle": true
  }
}
```

---

## 🎮 이벤트 시스템 (Event System)

플러그인은 다음 이벤트를 발생시킵니다:

### `activity:started`
활동이 시작될 때 발생합니다.

```javascript
document.addEventListener('activity:started', (e) => {
  console.log('Activity ID:', e.detail.activityId);
  console.log('Total words:', e.detail.totalWords);
});
```

### `activity:completed`
모든 매칭이 완료되었을 때 발생합니다.

```javascript
document.addEventListener('activity:completed', (e) => {
  console.log('Activity ID:', e.detail.activityId);
  console.log('Correct:', e.detail.correctCount);
  console.log('Incorrect:', e.detail.incorrectCount);
  console.log('Accuracy:', e.detail.accuracy + '%');
});
```

---

## 🎨 스타일링 (Styling)

플러그인은 독립적인 스타일을 포함하고 있지만, 다음 CSS 변수로 커스터마이징 가능합니다:

```css
:root {
  --hanzi-card-bg: #f9fafb;
  --hanzi-card-border: #d1d5db;
  --pinyin-card-bg: #fef3c7;
  --pinyin-card-border: #fbbf24;
  --correct-color: #10b981;
  --incorrect-color: #ef4444;
  --dragover-color: #3b82f6;
}
```

### 반응형 디자인

```css
/* 모바일 (< 768px) */
.hanzi-cards, .pinyin-cards {
  grid-template-columns: repeat(2, 1fr); /* 2열 */
}

/* 태블릿 (768px - 1024px) */
.hanzi-cards, .pinyin-cards {
  grid-template-columns: repeat(3, 1fr); /* 3열 */
}

/* 데스크톱 (> 1024px) */
.hanzi-cards, .pinyin-cards {
  grid-template-columns: repeat(4, 1fr); /* 4열 */
}
```

---

## 🔧 개발자 정보 (Developer Info)

### 플러그인 메타데이터

```javascript
{
  name: 'chinese-pinyin-match',
  version: '1.0.0',
  description: '중국어 한자와 병음 매칭 학습용 드래그 드롭 활동'
}
```

### 필수 메서드

#### `getDefaultParams()`
기본 파라미터를 반환합니다. 6개의 기본 단어가 포함됩니다.

```javascript
const defaults = ChinesePinyinMatchPlugin.getDefaultParams();
console.log(defaults.words.length); // 6
```

#### `render(activity, container)`
플러그인을 렌더링합니다.

```javascript
await ChinesePinyinMatchPlugin.render(activity, container);
```

**Parameters:**
- `activity` (Object): Activity 데이터 (id, type, title, params 포함)
- `container` (HTMLElement): 렌더링할 컨테이너 요소

**Returns:** Promise<void>

---

## 📁 파일 구조 (File Structure)

```
webapp/
├── plugins/
│   ├── chinese-pinyin-match-plugin.js  # 메인 플러그인 파일
│   └── README-CHINESE-PINYIN.md        # 이 문서
├── test-chinese-pinyin.html            # 테스트 페이지
├── sample-lesson-chinese-pinyin.json   # 샘플 레슨
└── index-menu.html                     # 플랫폼 허브 (5번 카드)
```

---

## 🧪 테스트 (Testing)

### 테스트 페이지 실행

1. 개발 서버 시작:
   ```bash
   npm run dev
   ```

2. 브라우저에서 접속:
   ```
   http://localhost:3000/test-chinese-pinyin.html
   ```

3. 4가지 테스트 시나리오 확인:
   - **기본 테스트**: 6개 단어, 힌트 있음
   - **간단한 테스트**: 3개 단어, 힌트 있음
   - **고급 테스트**: 8개 단어, 힌트 있음
   - **커스터마이징**: 4개 단어, 힌트 없음, 커스텀 메시지

### 수동 테스트 체크리스트

- [ ] 한자 카드가 정상적으로 표시됨
- [ ] 병음 카드가 정상적으로 표시됨
- [ ] 드래그 앤 드롭이 원활하게 작동함
- [ ] 정답 매칭 시 녹색 피드백 표시됨
- [ ] 오답 매칭 시 빨간색 피드백 + 흔들림 애니메이션
- [ ] 통계가 실시간으로 업데이트됨
- [ ] 모든 매칭 완료 시 성공 메시지 표시됨
- [ ] 힌트 표시/숨김이 정상 작동함
- [ ] 카드 셔플이 정상 작동함
- [ ] 모바일 화면에서 레이아웃이 적절함

---

## 🐛 문제 해결 (Troubleshooting)

### 문제 1: 플러그인이 로드되지 않음
```javascript
// 콘솔에서 확인
console.log(window.ChinesePinyinMatchPlugin);
// undefined → 플러그인 스크립트가 로드되지 않음
```

**해결책**: 플러그인 스크립트 경로 확인
```javascript
<script src="./plugins/chinese-pinyin-match-plugin.js"></script>
```

### 문제 2: 드래그 앤 드롭이 작동하지 않음

**원인**: 모바일 브라우저에서 터치 이벤트 미지원

**해결책**: 터치 이벤트 폴리필 추가 필요 (향후 업데이트 예정)

### 문제 3: 카드가 정렬되지 않음

**원인**: CSS Grid 미지원 브라우저

**해결책**: 최신 브라우저 사용 권장 (Chrome 57+, Firefox 52+, Safari 10.1+)

---

## 📚 추가 리소스 (Resources)

### 관련 문서
- [External Plugin System 설계 문서](../EXTERNAL_PLUGIN_DESIGN.md)
- [플러그인 추가 가이드](../NEW_TEMPLATE_GUIDE.md)
- [플랫폼 아키텍처 문서](../PLUGIN_DESIGN.md)

### 샘플 레슨
- [sample-lesson-chinese-pinyin.json](../sample-lesson-chinese-pinyin.json) - 4가지 예제 액티비티

### 테스트 페이지
- [test-chinese-pinyin.html](../test-chinese-pinyin.html) - 4가지 테스트 시나리오

---

## 🤝 기여하기 (Contributing)

플러그인 개선 아이디어가 있으시면 PR을 제출해주세요!

### 개선 아이디어
- [ ] 터치 이벤트 지원 추가
- [ ] 음성 발음 기능 추가
- [ ] 애니메이션 효과 개선
- [ ] 타이머 기능 추가
- [ ] 점수 시스템 추가
- [ ] 다국어 인터페이스 지원

---

## 📄 라이선스 (License)

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 📞 지원 (Support)

문제가 발생하거나 질문이 있으시면:
- GitHub Issues에 문의
- 플랫폼 허브의 디버그 도구 활용
- 테스트 페이지에서 콘솔 로그 확인

---

**최종 업데이트**: 2025-10-21  
**플러그인 버전**: 1.0.0  
**플랫폼 버전**: Enhanced Modular Architecture v2.0
