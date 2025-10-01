# 🎓 Enhanced Modular Educational Platform v2.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.0.0-blue.svg)](https://github.com/UnimationKorea/core_plugin)
[![Status](https://img.shields.io/badge/Status-Production_Ready-green.svg)](https://github.com/UnimationKorea/core_plugin)

**완전 기능적인 모듈형 교육 콘텐츠 제작 및 관리 플랫폼**

교육 콘텐츠를 시각적으로 제작하고, 실행하며, 관리할 수 있는 통합 솔루션입니다. 템플릿 기반 아키텍처로 다양한 교육 활동을 지원하며, 사용자 친화적인 인터페이스를 제공합니다.

## 📋 목차

- [주요 특징](#-주요-특징)
- [플랫폼 구성](#-플랫폼-구성)
- [지원 템플릿](#-지원-템플릿)
- [빠른 시작](#-빠른-시작)
- [설치 및 배포](#-설치-및-배포)
- [사용 가이드](#-사용-가이드)
- [개발 정보](#-개발-정보)
- [문제 해결](#-문제-해결)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

## ✨ 주요 특징

### 🔧 **완전한 도구 체인**
- **레슨 빌더**: 드래그 앤 드롭 방식의 시각적 콘텐츠 편집기
- **레슨 플레이어**: 모든 템플릿을 지원하는 강력한 실행 엔진
- **디버그 도구**: 개발 및 문제 진단을 위한 전용 도구

### 🎯 **모듈형 아키텍처**
- **버전 관리**: 템플릿별 독립적인 버전 시스템
- **확장성**: 새로운 템플릿 타입 쉽게 추가 가능
- **격리**: 개별 활동 수정이 다른 영역에 영향 없음

### 🎨 **사용자 경험**
- **직관적 인터페이스**: 코딩 지식 없이도 콘텐츠 제작 가능
- **실시간 미리보기**: 편집과 동시에 결과 확인
- **반응형 디자인**: 모든 디바이스에서 완벽 작동

## 🛠️ 플랫폼 구성

### 📚 **1. 레슨 빌더 (lesson-builder.html)**
시각적 인터페이스로 교육 콘텐츠를 제작하는 핵심 도구입니다.

**주요 기능:**
- 📝 레슨 정보 편집 (제목, 설명, 난이도, 예상 시간)
- 🎯 5가지 템플릿 완전 지원
- 📱 실시간 편집 및 미리보기
- 💾 로컬 저장 및 JSON 내보내기
- 🔄 활동 순서 변경 및 관리

**사용 예시:**
```javascript
// 자동 생성되는 레슨 구조
{
  "lessonId": "my-lesson-001",
  "title": "기초 한국어 문법",
  "locale": "ko",
  "version": "1.0.0",
  "flow": [
    {
      "activityId": "grammar-question-1",
      "template": "multiple-choice@1.0.0",
      "params": {
        "question": "다음 중 올바른 조사는?",
        "choices": [...],
        "correctAnswer": "choice-a"
      }
    }
  ]
}
```

### 🎮 **2. 레슨 플레이어 (simple.html)**
제작된 레슨을 실행하고 테스트하는 강력한 플레이어입니다.

**주요 기능:**
- ▶️ 모든 템플릿 타입 완벽 지원
- 📄 JSON 파일 직접 로딩
- 🔍 실시간 디버깅 도구
- ⌨️ 키보드 단축키 (Ctrl+1/2/3)
- 📊 학습 진도 및 결과 추적

**지원되는 활동 유형:**
- 4지 선다형 문제 (단일/다중 선택)
- 단어 맞추기 게임 (행맨 스타일)
- 메모리 카드 게임
- 비디오 콘텐츠
- 간단한 퀴즈

### 🔧 **3. 디버그 도구 (debug.html)**
개발 및 문제 진단을 위한 전용 도구입니다.

**주요 기능:**
- 🔍 템플릿 로딩 검증
- 📋 단계별 디버깅
- 🔬 JSON 구조 분석
- ⚠️ 오류 진단 및 해결 가이드

### 🏠 **4. 플랫폼 허브 (index-menu.html)**
모든 도구로의 통합 접근점을 제공하는 메인 허브입니다.

**특징:**
- 🎨 현대적인 UI/UX 디자인
- 🚀 각 도구별 기능 소개
- ⌨️ 키보드 단축키 지원
- 📱 반응형 레이아웃

## 🎯 지원 템플릿

### 1. **Multiple Choice (multiple-choice@1.0.0)**
4지 선다형 또는 다중 선택 문제를 지원합니다.

**특징:**
- ✅ 단일/다중 정답 지원
- 🔀 선택지 랜덤 섞기
- ⏱️ 시간 제한 설정
- 💡 힌트 및 설명 제공
- 📊 실시간 피드백

**예시 구조:**
```json
{
  "template": "multiple-choice@1.0.0",
  "params": {
    "question": "다음 중 소수는?",
    "choices": [
      { "id": "choice-a", "text": "2" },
      { "id": "choice-b", "text": "3" },
      { "id": "choice-c", "text": "4" },
      { "id": "choice-d", "text": "5" }
    ],
    "correctAnswer": ["choice-a", "choice-b", "choice-d"],
    "allowMultiple": true,
    "timeLimit": 30,
    "explanation": "소수는 1과 자기 자신으로만 나누어지는 수입니다."
  }
}
```

### 2. **Word Guess (word-guess@1.0.0)**
행맨 스타일의 단어 맞추기 게임입니다.

**특징:**
- 🔤 글자별 입력 시스템
- 💡 힌트 및 카테고리 표시
- 🎯 시도 횟수 제한
- ⏱️ 시간 제한 옵션
- 📈 진행 상황 시각화

**예시 구조:**
```json
{
  "template": "word-guess@1.0.0",
  "params": {
    "word": "프로그래밍",
    "hint": "컴퓨터에게 명령을 내리는 작업",
    "category": "컴퓨터",
    "maxAttempts": 8,
    "timeLimit": 180
  }
}
```

### 3. **Memory Game (memory-game@1.0.0)**
카드 매칭 메모리 게임입니다.

**특징:**
- 🃏 유연한 그리드 시스템 (2x2 ~ 5x4)
- 🔄 카드 자동 섞기
- ⏱️ 타이머 및 시도 횟수 추적
- 🎯 매칭 알고리즘
- 🏆 성과 통계

**예시 구조:**
```json
{
  "template": "memory-game@1.0.0",
  "params": {
    "title": "영어-한국어 매칭",
    "cards": [
      { "id": "card-1", "content": "Hello", "matchId": "greeting" },
      { "id": "card-2", "content": "안녕하세요", "matchId": "greeting" },
      { "id": "card-3", "content": "Thank you", "matchId": "thanks" },
      { "id": "card-4", "content": "감사합니다", "matchId": "thanks" }
    ],
    "timeLimit": 120
  }
}
```

### 4. **Video (video@1.0.0)**
비디오 기반 학습 콘텐츠입니다.

**특징:**
- 🎥 다양한 비디오 포맷 지원
- ▶️ 사용자 정의 컨트롤
- 📝 설명 및 메모 기능

### 5. **Quiz (quiz@1.0.0)**
간단한 텍스트 기반 퀴즈입니다.

**특징:**
- ❓ 간단한 문답 형식
- 🎯 드래그 앤 드롭 지원
- ✅ 즉시 피드백

## 🚀 빠른 시작

### 1. **레슨 제작하기**
```bash
# 1. 레슨 빌더 접속
https://your-domain.com/lesson-builder.html

# 2. 레슨 정보 입력
- 제목: "기초 수학"
- 난이도: "초급"
- 예상 시간: 15분

# 3. 활동 추가
- 템플릿 선택 → "4지 선다형"
- 질문 및 선택지 입력
- 정답 설정

# 4. 저장 및 내보내기
- "레슨 저장" → 로컬 저장소에 저장
- "JSON 내보내기" → 파일 다운로드
```

### 2. **레슨 실행하기**
```bash
# 1. 레슨 플레이어 접속
https://your-domain.com/simple.html

# 2. 레슨 로드
- 샘플 레슨 선택 또는
- JSON 파일 업로드

# 3. 활동 진행
- 문제 해결
- 진도 확인
- 결과 분석
```

### 3. **키보드 단축키**
```
Ctrl+1 : Multiple Choice 테스트
Ctrl+2 : Word Guess 테스트  
Ctrl+3 : Memory Game 테스트
```

## 📦 설치 및 배포

### **로컬 개발 환경**

```bash
# 1. 저장소 클론
git clone https://github.com/UnimationKorea/core_plugin.git
cd core_plugin

# 2. 개발 서버 실행 (Python)
python -m http.server 8080

# 또는 Node.js 사용
npx serve . -p 8080

# 3. 브라우저에서 접속
http://localhost:8080/index-menu.html
```

### **Cloudflare Pages 배포**

```bash
# 1. Wrangler 설치
npm install -g wrangler

# 2. Cloudflare 로그인
wrangler login

# 3. 프로젝트 배포
wrangler pages publish . --project-name=educational-platform

# 4. 커스텀 도메인 설정 (선택사항)
wrangler pages deployment tail --project-name=educational-platform
```

### **Docker 배포**

```dockerfile
# Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# 빌드 및 실행
docker build -t educational-platform .
docker run -p 8080:80 educational-platform
```

## 📖 사용 가이드

### **레슨 빌더 상세 가이드**

#### 1. **프로젝트 시작**
1. 레슨 빌더 접속
2. 좌측 패널에서 레슨 정보 입력
3. "활동 추가" 버튼 클릭

#### 2. **활동 생성**
1. 템플릿 선택 (5가지 중 선택)
2. "활동 생성" 버튼 클릭
3. 우측 편집기에서 세부 내용 입력

#### 3. **편집 기능**
- **편집 탭**: 활동 내용 수정
- **미리보기 탭**: 실제 화면 확인
- **JSON 탭**: 생성된 코드 확인

#### 4. **저장 및 관리**
- **레슨 저장**: 로컬 스토리지에 저장
- **JSON 내보내기**: 파일로 다운로드
- **미리보기**: 새 창에서 테스트

### **레슨 플레이어 사용법**

#### 1. **레슨 로드**
```javascript
// 샘플 레슨 선택
lessonSelect.value = 'english';
loadBtn.click();

// JSON 파일 로드 (키보드 단축키)
// Ctrl+1: Multiple Choice 테스트
// Ctrl+2: Word Guess 테스트
// Ctrl+3: Memory Game 테스트
```

#### 2. **디버깅**
```javascript
// 콘솔에서 확인 가능한 정보
- 레슨 로드 상태
- 템플릿 파싱 결과
- 활동 실행 로그
- 오류 메시지 및 해결 방법
```

## 💻 개발 정보

### **기술 스택**
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **아키텍처**: 모듈형 템플릿 시스템
- **스타일링**: CSS Grid, Flexbox
- **데이터**: JSON 기반 구조
- **저장소**: LocalStorage API

### **프로젝트 구조**
```
webapp/
├── index-menu.html          # 플랫폼 허브
├── lesson-builder.html      # 레슨 빌더
├── simple.html              # 레슨 플레이어
├── debug.html               # 디버그 도구
├── index.html               # 원본 플랫폼 (호환성)
├── sample-lesson-*.json     # 샘플 레슨 파일들
├── src/                     # 소스 파일 (기존)
├── public/                  # 정적 자원
├── dist/                    # 빌드 결과물
└── README.md               # 이 파일
```

### **템플릿 시스템 아키텍처**

#### **1. 템플릿 등록**
```javascript
// 템플릿 파싱
function parseTemplate(templateString) {
    const [name, version] = templateString.split('@');
    return { name, version: version || '1.0.0' };
}

// 예시: "multiple-choice@1.0.0" → {name: "multiple-choice", version: "1.0.0"}
```

#### **2. 렌더링 시스템**
```javascript
// 활동 타입별 렌더링
function loadActivity(index) {
    const activity = activities[index];
    
    switch (activity.type) {
        case 'multiple-choice':
            renderMultipleChoiceActivity(activity);
            break;
        case 'word-guess':
            renderWordGuessActivity(activity);
            break;
        case 'memory-game':
            renderMemoryGameActivity(activity);
            break;
        // ...
    }
}
```

#### **3. 상태 관리**
```javascript
// 전역 상태 관리
let currentLesson = null;
let currentActivity = 0;
let activities = [];
let results = [];

// 활동별 개별 상태
window.currentMultipleChoiceActivity = activity;
window.selectedChoices = [];
```

### **API 문서**

#### **레슨 구조**
```typescript
interface Lesson {
    lessonId: string;
    title: string;
    description?: string;
    locale: string;
    version: string;
    flow: Activity[];
    grading: GradingConfig;
    metadata: LessonMetadata;
}

interface Activity {
    activityId: string;
    template: string; // "template-name@version"
    params: Record<string, any>;
    rules: ActivityRules;
}
```

#### **템플릿 매개변수**
```typescript
// Multiple Choice 템플릿
interface MultipleChoiceParams {
    question: string;
    choices: Array<{id: string, text: string}>;
    correctAnswer: string | string[];
    allowMultiple: boolean;
    shuffle?: boolean;
    timeLimit?: number;
    explanation?: string;
    hints?: string[];
}

// Word Guess 템플릿
interface WordGuessParams {
    word: string;
    hint: string;
    category: string;
    maxAttempts: number;
    timeLimit?: number;
    difficulty?: string;
}
```

### **확장 가이드**

#### **새 템플릿 추가**
1. **렌더링 함수 작성**
```javascript
function renderMyTemplateActivity(activity) {
    const params = activity.params;
    
    activityArea.innerHTML = `
        <div class="my-template-container">
            <h3>${activity.title}</h3>
            <!-- 템플릿별 UI -->
        </div>
    `;
}
```

2. **로딩 시스템에 등록**
```javascript
// loadActivity 함수에 추가
else if (activity.type === 'my-template') {
    renderMyTemplateActivity(activity);
}
```

3. **빌더에 편집기 추가**
```javascript
// renderActivityEditor 함수에 추가
case 'my-template':
    editorHtml = renderMyTemplateEditor(activity);
    break;
```

## 🔧 문제 해결

### **일반적인 문제들**

#### **1. 템플릿 로딩 실패**
```
증상: "지원하지 않는 활동 타입입니다" 오류
해결: 
1. 템플릿 이름 확인 (multiple-choice, word-guess, memory-game)
2. 버전 정보 확인 (@1.0.0)
3. 콘솔에서 파싱 결과 확인
```

#### **2. JSON 파일 로딩 오류**
```
증상: "JSON 로드 실패" 메시지
해결:
1. 파일 경로 확인 (상대 경로 사용)
2. JSON 문법 검증 (jsonlint.com)
3. CORS 정책 확인 (로컬 서버 사용)
```

#### **3. 메모리 게임 표시 문제**
```
증상: 카드 내용이 표시되지 않음
해결:
1. 최신 버전 확인 (이미 수정됨)
2. 브라우저 캐시 삭제
3. CSS 로딩 상태 확인
```

### **디버깅 도구 활용**

#### **1. 브라우저 콘솔**
```javascript
// 레슨 상태 확인
console.log('현재 레슨:', currentLesson);
console.log('활동 목록:', activities);
console.log('진행 상황:', results);

// 템플릿 시스템 테스트
debugTemplateLoading(); // 자동 실행됨
```

#### **2. 키보드 단축키**
```
Ctrl+1 : Multiple Choice JSON 테스트
Ctrl+2 : Word Guess JSON 테스트  
Ctrl+3 : Memory Game JSON 테스트
```

#### **3. 단계별 진단**
1. `debug.html` 접속
2. 템플릿 로딩 테스트 실행
3. JSON 구조 검증
4. 개별 기능 테스트

### **성능 최적화**

#### **1. 로딩 성능**
- JSON 파일 크기 최소화
- 이미지 최적화 (WebP 사용 권장)
- CDN 활용 고려

#### **2. 메모리 관리**
- 불필요한 전역 변수 정리
- 이벤트 리스너 적절한 해제
- DOM 요소 재사용

#### **3. 사용자 경험**
- 로딩 상태 표시
- 오류 메시지 개선
- 키보드 네비게이션 지원

## 🤝 기여하기

### **개발 참여**

1. **Fork** 및 **Clone**
```bash
git clone https://github.com/your-username/core_plugin.git
cd core_plugin
```

2. **브랜치 생성**
```bash
git checkout -b feature/new-template
```

3. **개발 및 테스트**
```bash
# 로컬 서버 실행
python -m http.server 8080

# 기능 테스트
# 브라우저에서 동작 확인
```

4. **커밋 및 푸시**
```bash
git add .
git commit -m "feat: add new template type"
git push origin feature/new-template
```

5. **Pull Request 생성**

### **코딩 스타일**

#### **JavaScript**
```javascript
// 함수명: camelCase
function renderMultipleChoiceActivity(activity) { }

// 상수: UPPER_CASE
const MAX_ATTEMPTS = 6;

// 변수: camelCase
let currentActivity = 0;

// 주석: 한국어 허용
// 활동 로드 함수
function loadActivity(index) { }
```

#### **HTML/CSS**
```css
/* 클래스명: kebab-case */
.memory-game-container { }
.activity-editor { }

/* ID: kebab-case */
#lesson-builder
#activity-list
```

#### **커밋 메시지**
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 업데이트
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드/설정 변경
```

## 📈 로드맵

### **v2.1.0 (예정)**
- [ ] 사용자 계정 시스템
- [ ] 클라우드 저장소 연동
- [ ] 학습 분석 대시보드
- [ ] 모바일 앱 지원

### **v2.2.0 (예정)**
- [ ] AI 기반 콘텐츠 추천
- [ ] 실시간 협업 기능
- [ ] 다국어 지원 확장
- [ ] 접근성 개선

### **v3.0.0 (장기)**
- [ ] VR/AR 템플릿 지원
- [ ] 실시간 화상 수업 통합
- [ ] 블록체인 기반 인증서
- [ ] 메타버스 교실 연동

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

```
MIT License

Copyright (c) 2024 UnimationKorea

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 팀 및 기여자

### **핵심 개발팀**
- **UnimationKorea** - 프로젝트 리드, 아키텍처 설계

### **특별 감사**
- 교육 전문가들의 피드백
- 오픈소스 커뮤니티의 지원

---

## 📞 지원 및 문의

### **문제 신고**
GitHub Issues: https://github.com/UnimationKorea/core_plugin/issues

### **문의사항**
Email: contact@unimationkorea.com

### **문서 및 가이드**
- [사용자 매뉴얼](docs/user-manual.md)
- [개발자 가이드](docs/developer-guide.md)
- [API 문서](docs/api-reference.md)

---

<div align="center">

**🎓 Enhanced Modular Educational Platform v2.0**

*교육의 미래를 만들어가는 혁신적인 플랫폼*

[![GitHub Stars](https://img.shields.io/github/stars/UnimationKorea/core_plugin?style=social)](https://github.com/UnimationKorea/core_plugin)
[![GitHub Forks](https://img.shields.io/github/forks/UnimationKorea/core_plugin?style=social)](https://github.com/UnimationKorea/core_plugin)

</div>