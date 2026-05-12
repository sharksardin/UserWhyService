from pydantic import BaseModel, Field

# 프론트엔드에서 받을 요청 데이터
class ProductRequest(BaseModel):
    product_name: str = Field(
        ..., 
        description="분석할 화장품/상품명", 
        json_schema_extra={"example": "비건 달팽이 크림"} # V2 문법으로 수정 완료!
    )
    target_market: str = Field(
        default="auto", 
        description="타겟 시장 (기본값: 자동 추천)"
    )

# AI가 분석한 세부 내용
class AnalysisDetail(BaseModel):
    marketability: int
    competition: int
    description: str

# 주요 타겟 고객층
class TargetAudience(BaseModel):
    gender: str
    age_top: str

# 프론트엔드로 돌려줄 최종 응답 데이터
class AnalysisResponse(BaseModel):
    recommended_market: str
    total_score: int
    status_label: str
    analysis: AnalysisDetail
    target_audience: TargetAudience
