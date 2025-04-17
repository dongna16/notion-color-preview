

# 🎨 Notion color preview

![image](https://github.com/user-attachments/assets/ed4ac92e-f56a-46fb-9012-e81803d786e8)


✍️ 이 프로젝트는 Notion에서 디자인 토큰의 색상을 시각적으로 보여주기 위한 "색상 미리보기 서버"입니다.

✅ 이 서버는 HEX 값과 Alpha 값을 받아 정사각형(48*48px) SVG 이미지로 렌더링합니다.
사용자는 Notion Formula 수식을 통해 이 이미지를 자동으로 생성하여,
색상 토큰 시스템에 시각적 미리보기를 적용할 수 있습니다.

---

## 🛠️ 사용 방법

HEX 값과 투명도(alpha)를 조합하여 URL을 만들면, 해당 색상이 SVG 이미지로 렌더링됩니다.

### 📦 예시

| 입력 | 설명 |
|------|------|
| `/ff9900` → | 주황색, 불투명 (`fill-opacity: 1`) |
| `/ff9900/40` → | 주황색, 40% 투명도 (`fill-opacity: 0.4`) |
| `/e2f0f814` → | 연하늘색 + 알파값 포함 (8% 투명도) |


## 🧠 Notion 수식 예제

✅ 아래 수식은 사용자가 입력한 HEX + ALPHA 값을 기반으로,
자동으로 색상 미리보기 이미지의 URL을 생성합니다.

```/* Notion 색상 미리보기 수식
 * 목적: HEX 색상 코드와 투명도를 입력받아 SVG 미리보기 URL을 자동 생성
 * 
 * 입력값:
 * - _Hex 색상: 6자리 HEX 코드 (#포함 가능)
 * - _투명도율: 0~100 사이의 숫자 (선택사항)
 *
 * 처리 과정:
 * 1. 입력값 유효성 검사
 * 2. HEX 코드 정규화 (# 제거, 소문자 변환)
 * 3. 투명도 계산 및 URL 경로 생성
 * 4. 최종 SVG URL 조합
 */
lets(
  /* 데이터베이스에서 입력값 가져오기 */
  hexInput, prop("_Hex 색상"),
  alphaInput, prop("_투명도율"),
  
  /* HEX 코드 정규화 처리
   * - # 기호 제거
   * - 대문자를 소문자로 통일
   */
  hex, replaceAll(lower(hexInput), "#", ""),
  
  /* 투명도 URL 경로 생성
   * - 빈 값이거나 100% 이상인 경우: 경로 생략
   * - 0~99% 사이 값: "/숫자" 형식으로 추가
   * - 음수는 0으로, 100 이상은 생략 처리
   */
  alphaPath, if(
    or(
      empty(alphaInput), 
      alphaInput >= 100
    ),
    "",
    "/" + format(min(max(round(alphaInput), 0), 99))
  ),

  /* 최종 URL 생성
   * - 입력값이 없는 경우: 빈 문자열 반환
   * - 입력값이 있는 경우: SVG URL 생성
   * - .svg 확장자 추가로 명시적 파일 형식 지정
   */
  if(
    empty(hexInput),
    "",
    "https://notioncolorpreview.vercel.app/" + 
    hex + alphaPath + ".svg"
  )
)
