from pydantic import BaseModel, Field

class SaveVideoRequestDto(BaseModel):
    video_url: str = Field(..., title="비디오 URL")