# 🎨 Notion Color Preview

Notion에서 사용할 수 있는 HEX + ALPHA 기반 색상 미리보기 SVG 생성기입니다.

## 📦 사용 방법

- `/ff9900` → 불투명 주황색
- `/3366ff/50` → 50% 투명한 파랑색
- `/e2f0f8/8` → 8% 투명한 연하늘색

## 🚀 배포 방법

1. 이 코드를 GitHub 새 저장소로 업로드
2. Vercel에서 "Add Project" → 이 저장소 선택 → Deploy
3. 완료 후 URL: `https://your-project.vercel.app/`

## ✅ Notion에서 사용 예시 수식

```notion
lets(
  hex, replaceAll(lower(prop("hexValueRoot")), "#", ""),
  alpha, prop("alphaValueRoot"),
  alphaPath, if(
    or(empty(alpha), alpha >= 100),
    "",
    "/" + format(round(alpha))
  ),
  "https://your-project.vercel.app/" + hex + alphaPath
)
