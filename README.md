

# 🎨 Notion Color Preview

✍️ 이 프로젝트는 Notion에서 디자인 토큰의 색상을 시각적으로 보여주기 위한 "색상 미리보기 서버"입니다.

✅ 이 서버는 HEX 값과 Alpha 값을 받아 정사각형(40*40px) SVG 이미지로 렌더링합니다.
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

```/* ✍️ lets()는 여러 변수에 값을 할당하고, 이를 조합해 최종 결과를 계산하는 구조입니다. */
lets(

  /* 🎨 hex: HEX 색상 코드에서 '#'을 제거하고 소문자로 통일합니다. */
  hex, replaceAll(lower(prop("hexValueRoot")), "#", ""),

  /* 💧 alpha: 투명도(0~100)를 가져옵니다. (없으면 빈 값) */
  alpha, prop("alphaValueRoot"),

  /* 🧪 alphaPath: 
     alpha 값이 비어 있거나 100 이상이면 생략 → 완전 불투명  
     그 외엔 `/숫자` 형태로 경로에 추가 (예: `/40`) */
  alphaPath, if(
    or(empty(alpha), alpha >= 100),
    "",
    "/" + format(round(alpha))
  ),

  /* 🔗 최종 URL 구성: 배포된 SVG 서버 주소 + HEX + (선택적) alphaPath
     → 이미지 속성에 붙여 넣으면 색상 미리보기 자동 생성 */
  "https://notion-color-preview.vercel.app/" + hex + alphaPath
)
