from fastapi.testclient import TestClient
from main import app

# FastAPI의 TestClient를 사용해 가짜 프론트엔드 요청을 만듦
client = TestClient(app)

def test_analyze_empty_product():
    """
    [테스트 1: 예외 처리 검증] 
    사용자가 상품명을 빈칸으로 보냈을 때, 서버가 죽지 않고 400 에러를 잘 방어하는지 테스트
    """
    response = client.post("/api/analyze", json={"product_name": "   ", "target_market": "auto"})
    
    assert response.status_code == 400
    assert response.json()["detail"] == "상품명이 비어있습니다."

def test_analyze_valid_prompt_constraints():
    """
    [테스트 2: 프롬프트 및 AI 응답 스키마 검증]
    AI가 프롬프트 지시사항을 무시하지 않고, 약속된 JSON 규격과 값의 범위를 지키는지 테스트
    """
    response = client.post("/api/analyze", json={"product_name": "비건 달팽이 크림", "target_market": "auto"})
    
    # 1. 정상적으로 200 OK를 뱉는가?
    assert response.status_code == 200
    
    data = response.json()
    
    # 2. 프롬프트 제약 조건 검증 (total_score는 0~100 사이인가?)
    assert "total_score" in data
    assert 0 <= data["total_score"] <= 100
    
    # 3. 프롬프트 제약 조건 검증 (status_label이 3가지 중 하나로 잘 나오는가?)
    assert data["status_label"] in ["GO", "CAUTION", "STOP"]
    
    # 4. 분석 결과가 누락되지 않았는가?
    assert "analysis" in data
    assert "marketability" in data["analysis"]