from app.log_config import logging_check
import logging
import requests

logging_check()

def test_logic_1(content:str, diary_pk: int, token: str):
    logging.info("시작")
    logging.info(f"내용:{content}")
    video_url = "https://dnznrvs05pmza.cloudfront.net/4e89ed2d-13ba-4e12-9b4c-05bbdae46641.mp4?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzQ3ZDdhOWI2YWE1MmY3NyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc0MzI5MjgwMH0.ddvpDnzMFvUSgTsuvrgBEo-RLJMLH5zWSKOyC-PKETo"
    # 비동기 처리 return값은 사용되지 않음
    if video_url:
        logging.info(f"URL 있어요!: {video_url}")
        test_logic_2(diary_pk, video_url, token)

    return "비디오 생성 처리 중"


def test_logic_2(diary_pk:int, video_url:str, token:str):
    logging.info("백엔드 전송 시작")
    logging.info(f"test_logic_2가 받은 URL: {video_url}")
    try:
        payload = {"videoUrl": video_url}
        headers = {
            "Authorization": token,
            "Content-Type": "application/json"
        }

        # 요청 전에 정보 로깅
        logging.info(f"토큰 앞부분: {token[:10]}..." if token else "토큰 없음")
        logging.info(f"요청 URL: https://j12c202.p.ssafy.io/api/diaries/{diary_pk}/video")
        logging.info(f"요청 헤더: {headers}")
        logging.info(f"요청 페이로드: {payload}")
        logging.info(f"사용된 diary_pk: {diary_pk}")

        response = requests.post(f'https://j12c202.p.ssafy.io/api/diaries/{diary_pk}/video', json=payload,
                                 headers=headers)
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