# 🔌 외부 플러그인 시스템 - 요약 가이드

## 📌 핵심 개념

### 외부 플러그인이란?
코어 시스템을 수정하지 않고, 독립적으로 개발하여 **동적으로 로드**할 수 있는 액티비티 템플릿입니다.

### 왜 외부 플러그인인가?

#### ✅ 장점
1. **독립적 개발**: 코어 저장소 수정 불필요
2. **빠른 배포**: 플랫폼 재빌드 없이 즉시 추가
3. **버전 관리**: 플러그인별 독립적 버전 관리
4. **격리성**: 플러그인 오류가 전체 시스템에 영향 없음
5. **확장성**: 누구나 플러그인 개발 가능
6. **유지보수**: 개별 플러그인만 업데이트

#### ⚠️ 주의사항
1. **보안**: 외부 코드 실행 시 검증 필요
2. **성능**: 런타임 로딩으로 약간의 오버헤드
3. **의존성**: CDN 가용성에 의존

---

## 🏗️ 시스템 아키텍처

### 현재 구조

```
┌─────────────────────────────────────────────────────────┐
│                    교육 플랫폼                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐      ┌──────────────────┐        │
│  │  내장 템플릿     │      │  외부 플러그인    │        │
│  │  (TypeScript)   │      │  (JavaScript)    │        │
│  ├─────────────────┤      ├──────────────────┤        │
│  │ - Multiple      │      │ - Drawing Canvas │        │
│  │   Choice        │      │ - Chinese Pinyin │        │
│  │ - Word Guess    │      │ - Timer Counter  │        │
│  │ - Memory Game   │      │ - (커스텀 추가)   │        │
│  │ - Video         │      │                  │        │
│  │ - Drag & Drop   │      │                  │        │
│  └─────────────────┘      └──────────────────┘        │
│           │                        │                   │
│           └────────┬───────────────┘                   │
│                    ▼                                   │
│         ┌──────────────────────┐                      │
│         │  Template Registry   │                      │
│         │  (통합 관리)          │                      │
│         └──────────────────────┘                      │
│                    │                                   │
│                    ▼                                   │
│         ┌──────────────────────┐                      │
│         │   Orchestrator       │                      │
│         │   (실행 엔진)         │                      │
│         └──────────────────────┘                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 플러그인 로딩 흐름

```
1. 플러그인 URL 지정
   ↓
2. 스크립트 다운로드 (CDN)
   ↓
3. 보안 검증
   ├─ 도메인 체크
   ├─ 인터페이스 검증
   └─ 파라미터 스키마 확인
   ↓
4. 템플릿 레지스트리 등록
   ↓
5. 레슨에서 사용 가능
```

---

## 💡 플러그인 개발 단계

### Step 1: 플러그인 코드 작성

```javascript
// my-plugin.js
(function() {
  const MyPlugin = {
    name: 'my-plugin',           // 플러그인 이름
    version: '1.0.0',            // 버전
    description: '설명',          // 설명
    
    // 기본 파라미터 정의
    getDefaultParams() {
      return {
        title: '기본 제목',
        // ... 기타 설정
      };
    },
    
    // 렌더링 함수 (필수)
    async render(activity, container) {
      const params = { 
        ...this.getDefaultParams(), 
        ...activity.params 
      };
      
      // 1. 스타일 주입
      this.injectStyles();
      
      // 2. HTML 생성
      container.innerHTML = this.generateHTML(params);
      
      // 3. 이벤트 바인딩
      this.setupEventListeners(container, params);
    },
    
    // HTML 생성
    generateHTML(params) {
      return `<div class="my-plugin">${params.title}</div>`;
    },
    
    // CSS 주입
    injectStyles() {
      if (document.getElementById('my-plugin-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'my-plugin-styles';
      style.textContent = `
        .my-plugin {
          /* 스타일 정의 */
        }
      `;
      document.head.appendChild(style);
    },
    
    // 이벤트 설정
    setupEventListeners(container, params) {
      // 클릭, 키보드 등 이벤트 처리
    }
  };
  
  // 플러그인 등록
  if (window.registerEduPlugin) {
    window.registerEduPlugin(
      MyPlugin.name,
      MyPlugin.version,
      MyPlugin
    );
  }
})();
```

### Step 2: 로컬 테스트

```html
<!DOCTYPE html>
<html>
<head>
  <title>Plugin Test</title>
</head>
<body>
  <div id="container"></div>
  
  <!-- 1. 플러그인 시스템 로드 -->
  <script src="plugin-system.js"></script>
  
  <!-- 2. 플러그인 로드 -->
  <script src="my-plugin.js"></script>
  
  <!-- 3. 테스트 실행 -->
  <script>
    const activity = {
      activityId: 'test-1',
      template: 'my-plugin@1.0.0',
      params: { title: '테스트' }
    };
    
    window.PluginSystem.renderActivity(
      activity, 
      document.getElementById('container')
    );
  </script>
</body>
</html>
```

### Step 3: CDN 배포

#### Option A: GitHub + jsDelivr
```bash
# 1. GitHub에 푸시
git add my-plugin.js
git commit -m "feat: Add my-plugin v1.0.0"
git tag v1.0.0
git push origin main --tags

# 2. CDN URL 생성 (자동)
https://cdn.jsdelivr.net/gh/username/repo@1.0.0/my-plugin.js
```

#### Option B: npm + unpkg
```bash
# 1. package.json 생성
{
  "name": "my-plugin",
  "version": "1.0.0",
  "main": "index.js"
}

# 2. npm 발행
npm publish

# 3. CDN URL (자동)
https://unpkg.com/my-plugin@1.0.0/index.js
```

### Step 4: 플랫폼에 등록

#### 방법 1: HTML에서 직접 로드
```html
<script>
  // 플랫폼 초기화 후
  window.PluginSystem.loadExternalPlugin(
    'https://cdn.jsdelivr.net/gh/user/my-plugin@1.0.0/index.js'
  ).then(() => {
    console.log('플러그인 로드 완료!');
  });
</script>
```

#### 방법 2: 설정 파일로 관리
```javascript
// plugin-config.js
export const externalPlugins = [
  {
    id: 'my-plugin@1.0.0',
    name: '나의 플러그인',
    url: 'https://cdn.jsdelivr.net/gh/user/my-plugin@1.0.0/index.js',
    enabled: true
  }
];
```

### Step 5: 레슨에서 사용

```json
{
  "lessonId": "lesson-001",
  "title": "테스트 레슨",
  "flow": [
    {
      "activityId": "activity-1",
      "template": "my-plugin@1.0.0",
      "params": {
        "title": "실제 사용 예제",
        "customParam": "값"
      }
    }
  ]
}
```

---

## 🎨 플러그인 예제 모음

### 1. 빈칸 채우기 (Fill in the Blanks)
```javascript
{
  template: 'fill-in-blanks@1.0.0',
  params: {
    sentence: '고양이가 {blank}를 쫓는다.',
    blanks: [
      { id: 'blank-1', position: '{blank}', answer: '쥐' }
    ],
    hints: ['작은 동물', '치즈를 좋아함']
  }
}
```

### 2. 순서 맞추기 (Sequence Order)
```javascript
{
  template: 'sequence-order@1.0.0',
  params: {
    items: [
      { id: 'item-1', content: '첫 번째', order: 1 },
      { id: 'item-2', content: '두 번째', order: 2 }
    ],
    direction: 'vertical'
  }
}
```

### 3. 이미지 핫스팟 (Image Hotspot)
```javascript
{
  template: 'image-hotspot@1.0.0',
  params: {
    image: 'https://example.com/image.jpg',
    hotspots: [
      { x: 50, y: 30, label: '심장', description: '...' }
    ]
  }
}
```

### 4. 플래시카드 (Flashcard)
```javascript
{
  template: 'flashcard@1.0.0',
  params: {
    cards: [
      { front: 'Apple', back: '사과', audio: 'apple.mp3' }
    ],
    shuffle: true
  }
}
```

---

## 🔐 보안 체크리스트

### 플러그인 개발 시
- [ ] 사용자 입력 sanitize (XSS 방지)
- [ ] eval() 사용 금지
- [ ] 외부 API 호출 시 CORS 확인
- [ ] 민감 정보 로깅 금지
- [ ] 에러 처리 및 fallback 구현

### 플랫폼 관리 시
- [ ] 신뢰할 수 있는 CDN만 허용
- [ ] Content Security Policy (CSP) 설정
- [ ] Subresource Integrity (SRI) 사용
- [ ] 플러그인 코드 리뷰
- [ ] 정기적인 보안 감사

---

## 📊 비교: 내장 vs 외부 플러그인

| 항목 | 내장 템플릿 | 외부 플러그인 |
|------|------------|--------------|
| **개발 언어** | TypeScript | JavaScript |
| **빌드 필요** | ✅ 필요 | ❌ 불필요 |
| **타입 안정성** | ✅ 강력 | ⚠️ 약함 |
| **배포 속도** | ⏱️ 느림 (빌드) | ⚡ 빠름 (즉시) |
| **코어 수정** | ✅ 필요 | ❌ 불필요 |
| **버전 관리** | 플랫폼 버전 | 독립 버전 |
| **보안** | ✅ 높음 | ⚠️ 검증 필요 |
| **성능** | ⚡ 빠름 | ⚠️ 약간 느림 |
| **추천 용도** | 핵심 기능 | 확장 기능 |

### 언제 내장 템플릿을 사용할까?
- 플랫폼의 **핵심 기능**
- **높은 보안**이 필요한 경우
- **타입 안정성**이 중요한 경우
- **성능 최적화**가 필수인 경우

### 언제 외부 플러그인을 사용할까?
- **실험적 기능**
- **특정 고객** 요구사항
- **빠른 프로토타이핑**
- **커뮤니티 기여**
- **제3자 개발**

---

## 🚀 빠른 시작 가이드

### 5분 만에 플러그인 만들기

#### 1단계: 템플릿 복사
```bash
# 공식 템플릿 클론
git clone https://github.com/UnimationKorea/plugin-template.git my-plugin
cd my-plugin
```

#### 2단계: 커스터마이즈
```javascript
// index.js 파일 수정
const MyPlugin = {
  name: 'my-custom-plugin',  // 변경
  version: '1.0.0',
  
  getDefaultParams() {
    return {
      title: '나의 플러그인',  // 변경
      // 파라미터 추가
    };
  },
  
  async render(activity, container) {
    // 렌더링 로직 구현
  }
};
```

#### 3단계: 테스트
```bash
# 로컬 서버 실행
python -m http.server 8080

# 브라우저에서 test.html 열기
```

#### 4단계: 배포
```bash
# GitHub에 푸시
git add .
git commit -m "Initial commit"
git push origin main
git tag v1.0.0
git push --tags

# CDN URL 자동 생성 (jsDelivr)
# https://cdn.jsdelivr.net/gh/username/my-plugin@1.0.0/index.js
```

#### 5단계: 사용
```javascript
// 플랫폼에서 로드
await window.PluginSystem.loadExternalPlugin(
  'https://cdn.jsdelivr.net/gh/username/my-plugin@1.0.0/index.js'
);

// 레슨에서 사용
{
  "template": "my-custom-plugin@1.0.0",
  "params": { "title": "테스트" }
}
```

---

## 📚 추가 리소스

### 문서
- [📖 상세 설계 문서](./EXTERNAL_PLUGIN_DESIGN.md)
- [🔧 플러그인 API 레퍼런스](./PLUGIN_API_REFERENCE.md)
- [🛡️ 보안 가이드라인](./SECURITY_GUIDELINES.md)

### 예제
- [🎨 공식 플러그인 컬렉션](https://github.com/UnimationKorea/official-plugins)
- [👥 커뮤니티 플러그인](https://github.com/UnimationKorea/community-plugins)
- [📦 플러그인 템플릿](https://github.com/UnimationKorea/plugin-template)

### 도구
- [🔍 플러그인 검증기](https://validator.unimationkorea.com)
- [📊 성능 분석기](https://profiler.unimationkorea.com)
- [🧪 테스트 플레이그라운드](https://playground.unimationkorea.com)

### 커뮤니티
- [💬 Discord](https://discord.gg/unimation)
- [🐙 GitHub Discussions](https://github.com/UnimationKorea/core_plugin/discussions)
- [📧 Email](mailto:plugin-support@unimationkorea.com)

---

## ❓ FAQ

### Q1: 플러그인이 로드되지 않아요
**A:** 다음을 확인하세요:
1. CDN URL이 올바른가?
2. CORS가 허용되어 있는가?
3. 플러그인 인터페이스가 올바른가? (`name`, `version`, `render` 필수)
4. 브라우저 콘솔에 에러가 있는가?

### Q2: 플러그인을 업데이트하려면?
**A:** 
1. 버전을 올립니다 (1.0.0 → 1.0.1)
2. GitHub에 새 태그를 푸시합니다
3. jsDelivr가 자동으로 새 버전을 제공합니다

### Q3: 내장 템플릿으로 전환할 수 있나요?
**A:** 네! TypeScript로 재작성하여 `src/templates/`에 추가하고 빌드하면 됩니다.

### Q4: 플러그인 간 통신이 가능한가요?
**A:** 현재는 제한적입니다. 이벤트 시스템을 통해 간접적으로 가능합니다.

### Q5: 플러그인 성능이 걱정돼요
**A:** 
- 스타일은 한 번만 주입
- 이미지는 lazy loading
- 무거운 연산은 Web Worker 사용
- 메모리 누수 방지 (이벤트 정리)

---

## 🎯 다음 단계

이제 설계 문서를 확인하셨다면:

1. ✅ [상세 설계 문서 읽기](./EXTERNAL_PLUGIN_DESIGN.md)
2. 🔨 샘플 플러그인 구현 (빈칸 채우기)
3. 🧪 테스트 및 검증
4. 📦 배포 및 등록
5. 📖 사용 가이드 작성

**준비되셨나요?** 다음 명령으로 샘플 플러그인 구현을 시작하세요! 🚀

---

**작성일:** 2025-10-21  
**버전:** 1.0.0  
**라이선스:** MIT
