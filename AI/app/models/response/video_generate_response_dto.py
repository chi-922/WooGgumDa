from pydantic import BaseModel, Field

class VideoGenerateResponseDto(BaseModel):
    message: str = Field(default="일기 생성 요청을 성공적으로 받았습니다.", title="응답 메시지", description="응답 메시지")
    diary_pk: int = Field(..., title="일기 ID", description="생성 요청한 일기의 ID")