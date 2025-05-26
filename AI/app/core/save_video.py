import os
import logging
import requests
from app.log_config import logging_check

logging_check()
API_BASE_URL = os.environ.get("API_BASE_URL")

def save_video_to_backend(diary_pk:int, video_url:str, token:str):
    logging.info("백엔드 전송 시작")
    logging.info(f"save_video_to_backend가 받은 URL: {video_url}")
    try:
        payload = {"videoUrl": video_url}
        headers = {
            "Authorization":  token,
            "Content-Type": "application/json"
        }

        # 요청 전에 정보 로깅
        logging.info(f"토큰 앞부분: {token[:10]}..." if token else "토큰 없음")
        logging.info(f"요청 URL: {API_BASE_URL}/diaries/{diary_pk}/video")
        logging.info(f"요청 헤더: {headers}")
        logging.info(f"요청 페이로드: {payload}")
        logging.info(f"사용된 diary_pk: {diary_pk}")

        response = requests.post(f'{API_BASE_URL}/diaries/{diary_pk}/video', json=payload, headers=headers)
        logging.info(f"요청 보내는 중")


        if response.status_code == 200:
            logging.info(f"비디오 저장 성공: {video_url}")
            return True
        else:
            logging.error(f"비디오 저장 실패: 상태 코드 {response.status_code}, 응답: {response.text}, 응답 헤더: {response.headers}")
            return False

    except requests.RequestException as e:
            logging.error(f"비디오 저장 중 오류:{str(e)}")
            return False