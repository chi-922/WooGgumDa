import logging

def logging_check():
    # 기본 로깅 설정
    logging.basicConfig(
        level=logging.INFO,  # INFO 레벨 이상의 메시지만 기록
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',  # 로그 메시지 형식
    )
    # 테스트 로그 메시지
    logging.info("로깅 설정이 성공적으로 완료되었습니다")