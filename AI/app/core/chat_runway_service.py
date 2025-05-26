import time
from runwayml import RunwayML
import logging
from app.log_config import logging_check

logging_check()

def runway(image_base64:str, prompt:str):

    client = RunwayML()

    # Create a new image-to-video task using the "gen3a_turbo" model
    task = client.image_to_video.create(
      model='gen3a_turbo',
      # Point this at your own image file
      prompt_image=f"data:image/png;base64,{image_base64}",
      prompt_text=f'{prompt}',
      duration=5
    )
    task_id = task.id

    # Poll the task until it's complete
    time.sleep(10)  # Wait for a second before polling
    task = client.tasks.retrieve(task_id)

    if task.status == 'FAILED':
        task_expect_url = "https://dnznrvs05pmza.cloudfront.net/4e89ed2d-13ba-4e12-9b4c-05bbdae46641.mp4?_JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzQ3ZDdhOWI2YWE1MmY3NyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc0MzI5MjgwMH0.ddvpDnzMFvUSgTsuvrgBEo-RLJMLH5zWSKOyC-PKETo"
        logging.info(task.status)
        logging.info(task)
        return task_expect_url

    while task.status not in ['SUCCEEDED', 'FAILED']:
      time.sleep(10)  # Wait for ten seconds before polling
      task = client.tasks.retrieve(task_id)

    if task.status != 'SUCCEEDED':
        task_expect_url = "https://dnznrvs05pmza.cloudfront.net/4e89ed2d-13ba-4e12-9b4c-05bbdae46641.mp4?_JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiYzQ3ZDdhOWI2YWE1MmY3NyIsImJ1Y2tldCI6InJ1bndheS10YXNrLWFydGlmYWN0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc0MzI5MjgwMH0.ddvpDnzMFvUSgTsuvrgBEo-RLJMLH5zWSKOyC-PKETo"
        logging.info(task.status)
        logging.info(task)
        return task_expect_url

    logging.info(task)
    logging.info(task.output[0])

    return task.output[0]