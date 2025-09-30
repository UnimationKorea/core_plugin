# Educational Lesson Platform - Plugin Architecture v2.0

![Platform Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-2.2.0-blue)
![Tech Stack](https://img.shields.io/badge/Tech-Hono+TypeScript+Cloudflare-purple)

## 🎯 프로젝트 개요

**목표**: 플러그인 기반의 확장 가능한 교육용 레슨 플랫폼
**주요 기능**: 인터랙티브 액티비티, 템플릿 시스템, 레슨 빌더, 오케스트레이션

## 🌐 공개 URL

- **운영 환경**: https://3000-ia40t94o18s60hijnc2ja-6532622b.e2b.dev
- **GitHub 저장소**: https://github.com/UnimationKorea/core_plugin

## ✨ 현재 구현된 기능

### 📚 레슨 플레이어
- JSON 기반 레슨 로딩 (파일 업로드/드래그드롭/샘플 선택)
- 4가지 샘플 레슨 지원 (4지선다, 메모리게임, 단어맞추기, 혼합템플릿)
- 실시간 진행률 추적 및 활동별 상태 표시
- 이벤트 기반 오케스트레이션 시스템
- 레슨 요약 모달 및 JSON 다운로드 기능

### 🧩 템플릿 시스템 (5가지 활동 타입)
- **Multiple Choice (v1.0.0)**: 4지 선다형 문제
  - 단일/다중 정답 지원, 힌트 시스템
  - 시간 제한, 피드백 표시, 설명 제공
  - 접근성 지원 (키보드 네비게이션)
- **Drag & Drop Choices (v2.0.0)**: 드래그드롭 선택형 문제
  - 직관적인 드래그 앤 드롭 인터페이스
  - 클릭 선택 대안 지원, 힌트 시스템
  - 접근성 (키보드 내비게이션, 스크린리더)
- **Memory Game (v1.0.0)**: 메모리 카드 매칭 게임
  - 카드 뒤집기 애니메이션, 매칭 로직
  - 시간 제한, 재시도 기능, 그리드 사이즈 설정
- **Word Guess (v1.0.0)**: 단어 맞추기 게임
  - 힌트 기반 단어 추측, 진행률 표시
  - 카테고리별 분류, 난이도 조절
- **Video Player (v2.0.0)**: 동영상 시청 액티비티
  - 자동재생, 컨트롤, 자막 지원
  - 키보드 단축키, 시청 진행률 추적

### 🛠️ 레슨 빌더 (v2.2 완전 개선)
- **3단 레이아웃**: 미리보기 | 캔버스 | 속성편집기
- **실시간 직접 미리보기**: 왼쪽 영역에서 활동 즉시 확인 (탭 전환 불필요)
- **전체 레슨 미리보기**: 네비게이션으로 모든 활동 순차 체험
- **실시간 속성 편집기**: 폼 변경 시 미리보기 자동 업데이트
- **템플릿 카탈로그**: 드래그드롭 + 클릭 추가 지원
- **JSON 관리**: 내보내기/가져오기, 자동 검증
- **반응형 지원**: 모바일에서 4단 스택 레이아웃

### 🎨 현대적 UI/UX (v2.2 최적화)
- **컴팩트 레이아웃**: 활동 영역 70% 축소, 공간 효율성 극대화
- **텍스트 기반 네비게이션**: 아이콘 대신 텍스트로 60% 공간 절약
- **실시간 미리보기**: 빌더에서 직접 활동 체험 가능
- **반응형 디자인**: 모든 화면 크기에 최적화된 레이아웃
- **다크 테마**: 일관된 디자인 시스템
- **접근성**: 키보드 네비게이션, 스크린 리더 지원

## 🏗️ 핵심 아키텍처

### 플러그인 시스템
```typescript
// 모든 액티비티는 공통 인터페이스를 구현
interface ActivityModule {
  manifest: ActivityManifest
  mount(container: HTMLElement, params: ActivityParam, context: ActivityContext): Promise<void>
  unmount(): Promise<void>
  getResult(): Promise<ActivityResult>
}
```

### 보안 샌드박스
- DOM 접근 제한 및 안전한 API 제공
- 화이트리스트 기반 외부 도메인 접근
- CSP (Content Security Policy) 적용
- 템플릿 격리 실행 환경

### 이벤트 기반 통신
```typescript
// 템플릿과 코어 간 이벤트 버스 통신
eventBus.emit({ type: 'PROGRESS', payload: { score: 0.8 } })
eventBus.on('COMPLETE', (event) => { /* 완료 처리 */ })
```

## 📁 프로젝트 구조

```
webapp/
├── src/
│   ├── index.tsx              # Hono 애플리케이션 진입점
│   ├── types/activity.ts      # 핵심 타입 정의
│   ├── core/                  # 코어 시스템
│   │   ├── event-bus.ts      # 이벤트 버스
│   │   ├── storage.ts        # 로컬 스토리지 관리
│   │   ├── sandbox.ts        # 샌드박스 관리
│   │   └── orchestrator.ts   # 레슨 오케스트레이터
│   ├── templates/             # 액티비티 템플릿
│   │   ├── base/             # 기본 템플릿 클래스
│   │   ├── video/            # 비디오 템플릿
│   │   └── drag-drop/        # 드래그드롭 템플릿
│   └── builder/              # 레슨 빌더
├── public/static/            # 정적 자원
│   ├── css/                  # 스타일시트
│   └── js/                   # 클라이언트 JavaScript
├── lessons/                  # 샘플 레슨 파일
└── dist/                     # 빌드 출력
```

## 🔧 데이터 아키텍처

### 레슨 구성 (JSON)
```json
{
  "lessonId": "U15-L03",
  "title": "영어 기초 - 비교급 학습",
  "locale": "ko",
  "flow": [
    {
      "activityId": "intro-video",
      "template": "video@2.0.0",
      "params": { "src": "video.mp4", "autoplay": false },
      "rules": { "scoreWeight": 1, "required": true }
    }
  ],
  "grading": { "mode": "weighted-sum", "passLine": 0.7 }
}
```

### 템플릿 매니페스트
- 고유 ID 및 버전 관리
- 파라미터 스키마 (JSON Schema)
- 지원 기능 및 접근성 정보
- 성능 및 보안 요구사항

## 🎮 사용자 가이드

### 레슨 플레이어 사용법
1. **샘플 레슨 로드**: "샘플 레슨 로드" 버튼 클릭
2. **파일 업로드**: JSON 파일을 드래그드롭 또는 파일 선택
3. **학습 진행**: 각 액티비티를 순서대로 완료
4. **결과 확인**: 레슨 완료 후 점수 및 세부 결과 확인

### 레슨 빌더 사용법
1. **새 레슨**: "새 레슨" 버튼으로 빈 레슨 생성
2. **템플릿 추가**: 왼쪽 템플릿을 캔버스로 드래그 또는 클릭
3. **속성 편집**: 오른쪽 속성 편집기에서 파라미터 수정
4. **저장**: "저장" 버튼으로 JSON 파일 다운로드

### 🧩 신규 활동 템플릿 개발 가이드 (완전판)
**AI 코딩을 위한 완벽한 아키텍처 가이드 제공**

1. **개발 조건**: Manifest + HTML + JavaScript 필수 구조
2. **이벤트 시스템**: COMPLETE, ERROR, RETRY 이벤트 구현
3. **필수 함수**: `initializeActivity()`, `validateAnswer()`, `resetActivity()`
4. **스타일링**: CSS Variables, 반응형 디자인, 접근성
5. **통합 과정**: 파일 배치 → API 등록 → 렌더링 엔진 → 테스트

**📋 AI 개발용 프롬프트 템플릿 포함**

## 📊 성능 및 기술 스펙

### 기술 스택
- **Backend**: Hono Framework (TypeScript)
- **Frontend**: Vanilla JavaScript + Modern CSS
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages
- **Package Manager**: npm

### 성능 지표
- **초기 로딩**: < 2초 (First Contentful Paint)
- **템플릿 로딩**: < 500ms per template
- **메모리 사용**: < 50MB per activity
- **번들 크기**: < 40KB (gzipped)

### 브라우저 지원
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile: iOS 13+, Android 8+

## 🚀 배포 상태

**배포 플랫폼**: Cloudflare Pages (Edge Computing)
**현재 상태**: ✅ 활성 운영 중
**자동 빌드**: Git push 시 자동 배포
**마지막 업데이트**: 2024년 12월

### 🔥 최근 주요 업데이트 (v2.2.0)
- **컴팩트 레이아웃 완성**: 활동 영역 높이 70% 축소, 메모리게임/비디오 플레이어 최적화
- **텍스트 기반 사이드바**: 활동 목록을 컴팩트한 텍스트 형태로 전환 (공간 60% 절약)
- **빌더 실시간 미리보기**: 왼쪽 미리보기 영역에서 직접 활동 확인 (탭 전환 불필요)
- **전체 레슨 미리보기**: 빌더에서 레슨 전체를 네비게이션하며 체험 가능
- **반응형 최적화**: 데스크톱/태블릿/모바일에서 최적화된 레이아웃
- **개발자 가이드 완성**: 신규 활동 템플릿 개발을 위한 완벽한 아키텍처 가이드
- **성능 개선**: 레이아웃 렌더링 최적화 및 메모리 사용량 감소

### 배포 URL 구성
- 메인 애플리케이션: `/`
- API 엔드포인트: `/api/*`
- 정적 자원: `/static/*`

## 🔄 추천 개발 로드맵

### Phase 1: 템플릿 확장 (다음 단계)
- [ ] Speech-to-Text 발음 평가 템플릿
- [ ] 게이미피케이션 요소 (퀴즈, 미니게임)
- [ ] 텍스트 입력 및 자동 채점 템플릿
- [ ] 순서 배열 (Sequence Ordering) 템플릿

### Phase 2: 고도화 기능
- [ ] 실시간 협업 기능 (멀티플레이어)
- [ ] AI 기반 개인화 학습 경로
- [ ] 상세 학습 분석 대시보드
- [ ] 모바일 앱 (React Native/Flutter)

### Phase 3: 에코시스템 확장
- [ ] 템플릿 마켓플레이스
- [ ] LTI (Learning Tools Interoperability) 연동
- [ ] 외부 LMS 통합 (Moodle, Canvas)
- [ ] 오픈소스 커뮤니티 구축

## 🔗 관련 링크

- [Hono Framework 문서](https://hono.dev/)
- [Cloudflare Pages 가이드](https://pages.cloudflare.com/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [JSON Schema 표준](https://json-schema.org/)

---

© 2024 Educational Lesson Platform | Plugin Architecture v2.0 | Created with ❤️ for Education