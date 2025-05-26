from dotenv import load_dotenv
import logging
from app.log_config import logging_check
import requests
import os

logging_check()
load_dotenv()

def stability(prompt:str):
    api_key = os.getenv("STABILITY_API_KEY")
    response = requests.post(
        f"https://api.stability.ai/v2beta/stable-image/generate/sd3",

        headers={
            "authorization": f"Bearer {api_key}",
            "accept": "application/json"
        },
        files={"none": ''},
        data={
            "prompt": {prompt},
            "output_format": "png",
        },
    )

    logging.info("이미지 생성완료")

    if response.status_code == 200:
        logging.info(f"응답 시작 부분: {str(response.content[:30])}")
        logging.info(f"응답 Content-Type: {response.headers.get('Content-Type')}")
        img_length = len(response.content)
        logging.info(f"이미지64 길이:{img_length}")

        response_json = response.json()
        base64_image = response_json["image"]


        return base64_image
    else:
        raise Exception(str(response.json()))
