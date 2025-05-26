from pydantic import BaseModel, Field

class GenerateVideoRequestDto(BaseModel):
    diary_pk: int = Field(..., title="일기 ID")
    content: str  = Field(..., title="채팅 내용", description="사용자가 입력한 채팅 내용")