import app.core.chat_gpt_service as text
import app.core.chat_stability_service as image
import app.core.chat_runway_service as video
from app.log_config import logging_check
from app.core.save_video import save_video_to_backend
import logging

logging_check()

def generate_video(content:str, diary_pk: int, token: str):
    logging.info("시작")
    prompt = text.chat_gpt(content)

    logging.info("프롬프트 완료")
    image_base64 = image.stability(prompt)

    logging.info("이미지 완료")
    video_url = video.runway(image_base64, prompt)

    logging.info(f"save_video_to_backend 호출 전 URL: {video_url}")
    if video_url:
        save_video_to_backend(diary_pk, video_url, token)

    # 비동기 처리 return값은 사용되지 않음
    return "비디오 생성 처리 중"
