# 교육용 레슨 플랫폼 · 플러그인 템플릿 스타터 (Fixed)

이 버전은 JSON 로딩과 검증을 강화했습니다.

## 개선 사항
- 안전한 JSON 파서(safeParseJson): UTF-8 BOM, //, /* */ 주석, 트레일링 콤마 허용
- 스키마 수준 유효성 검사(validateLesson) + 친절한 오류 메시지
- 상태/로그 UI, 오류 배너 출력
- 활동 mount/unmount 예외 처리 및 메시지 표시

## 실행
- `index.html`을 열고 좌측 **샘플 불러오기**를 클릭하거나, **파일 선택**으로 레슨 JSON을 불러오세요.
- 로컬 파일(`file://`)로 여는 경우 샘플 JSON 페치가 차단될 수 있습니다. 그때는 **내장 샘플**이 자동 적용됩니다.
- 권장: 간단 서버로 열기
  ```bash
  python -m http.server 8080
  ```

## 샘플 레슨 구조(필수 필드)
```jsonc
{
  "lessonId": "U15-L03",
  "flow": [
    { "activityId": "intro", "template": "video@1.0.0", "params": { "src": "..." } }
  ]
}
```
