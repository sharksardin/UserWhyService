import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from schemas import ProductRequest, AnalysisResponse # 스키마 임포트 변경

from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

app = FastAPI(title="UserWhy AI Market Analyzer")

# 프론트엔드 연동을 위한 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API 설정
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("Warning: GEMINI_API_KEY environment variable is not set.")

# 유저와이 맞춤형 System Prompt
SYSTEM_PROMPT = """
너는 한국 뷰티 브랜드의 글로벌 진출을 돕는 '유저와이(UserWhy)'의 시니어 B2B 시장 분석가야.
사용자가 상품명을 입력하면, 전 세계 시장 트렌드를 분석하여 가장 진출하기 좋은 국가 1곳을 추천하고 평가해줘.

[필수 규칙]
1. 반드시 아래의 JSON 형식으로만 응답할 것. (마크다운이나 부연 설명 절대 금지)
2. total_score는 0~100 사이의 정수.
3. status_label은 total_score 기준 (80이상: "GO", 50~79: "CAUTION", 50미만: "STOP").
4. description은 2문장 이내로, 수요와 경쟁강도를 포함하여 냉철하게 작성할 것.
5. [예외 처리] 입력된 상품명이 'asd', 'ㅋㅋㅋ' 같은 무의미한 문자열이거나 화장품/상품과 전혀 무관한 단어일 경우, total_score를 0으로, status_label을 "STOP"으로 설정하고, description에 "유효하지 않은 상품명입니다. 정확한 상품명을 입력해주세요."라고 작성할 것.

[출력 JSON 포맷]
{
  "recommended_market": "미국",
  "total_score": 85,
  "status_label": "GO",
  "analysis": {
    "marketability": 80,
    "competition": 60,
    "description": "최근 틱톡을 중심으로 K-비건 뷰티에 대한 수요가 폭발적입니다. 다만 기존 로컬 브랜드와의 경쟁이 심화되고 있어 차별화된 마케팅이 필요합니다."
  },
  "target_audience": {
    "gender": "여성 85%",
    "age_top": "1020세대"
  }
}
"""

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_product(request: ProductRequest):
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key가 설정되지 않았습니다.")
    
    if not request.product_name.strip():
        raise HTTPException(status_code=400, detail="상품명이 비어있습니다.")
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"{SYSTEM_PROMPT}\n\n분석할 상품명: {request.product_name}"
        
        response = model.generate_content(prompt)
        
        # JSON 응답 파싱
        content = response.text.strip()
        
        # 마크다운 코드 블록 제거
        if content.startswith("```json"):
            content = content.replace("```json", "", 1).rsplit("```", 1)[0]
        elif content.startswith("```"):
            content = content.replace("```", "", 1).rsplit("```", 1)[0]
            
        result = json.loads(content.strip())
        return AnalysisResponse(**result)
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI 응답을 JSON으로 파싱하는 데 실패했습니다.")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI 분석 중 오류가 발생했습니다: {str(e)}")

@app.get("/")
async def root():
    return {"message": "UserWhy Backend API is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
