from langchain_core.prompts import ChatPromptTemplate  # 챗봇 형식의 프롬프트 템플릿을 생성하는 클래스
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser  # 모델의 출력을 단순 문자열로 파싱하는 클래스
from dotenv import load_dotenv

load_dotenv()

# 객체 생성
llm = ChatOpenAI(
    temperature=0.1,  # 창의성 (0.0 ~ 2.0)
    model_name="gpt-4",  # 모델명
)

# 요약 및 번역을 동시에 수행하는 프롬프트 템플릿
prompt = ChatPromptTemplate.from_template(
    """
    다음의 한국어 꿈일기 텍스트를 분석하여 핵심 키워드를 최소 4개 이상 추출하고, 해당 키워드를 영어로만 번역해주세요. 반드시 출력형태는 영어로만 출력해주세요. 이 결과는 후속 text-to-image 모델과 text-to-video 모델의 프롬프트로 사용됩니다.
    
    [작업 지시]
    1. 입력된 꿈일기 텍스트를 주의 깊게 읽고, 텍스트의 주요 이미지를 형성하는 최소 4개 이상의 핵심 영어키워드를 선정합니다.
    2. 선정 기준은 꿈에서 자주 등장하거나 감정, 분위기, 상징 등이 잘 드러나는 단어들입니다.
    3. 불필요한 부가 설명이나 감정 표현은 제외하고, 핵심적인 명사 및 짧은 구문으로만 구성하세요.
    4. 선정된 키워드를 한글로 요약한 후, 같은 키워드를 영어로 번역합니다.
    5. 번역은 자연스러운 표현과 텍스트-투-이미지 모델과 텍스트-투-비디오 모델이 이해하기 쉬운 단어로 선택해주세요.
    6. 텍스트가 짧거나 맥락이 부족하더라도, 문맥에서 유추 가능한 등장인물, 배경, 감정, 동작 등을 상상하여 보완된 키워드를 포함하세요.
    7. 아기 말투, 오타, 줄임말 등 비표준 표현이 포함되어 있다면 자연어로 해석한 뒤 정제하여 처리하세요. 단, 내용이 빠지거나 의미가 바뀌지 않는 선에서 자연스럽게 고쳐주세요.
    8. 꿈 속의 상징이나 분위기를 반영해, 시각적으로 풍부한 장면을 구성할 수 있도록 배경, 감정, 동작 등을 조합한 키워드를 생성하세요.
    9. 최종 키워드는 영상 생성 모델이 직관적으로 이해할 수 있도록 간결하고 명확한 영어 표현으로 구성해주세요.
    10. 키워드는 등장인물 → 배경 → 주요 동작/상황 → 감정/분위기 순서로 나열해주세요.
    11. 감정이 장면의 분위기나 행동에 영향을 준다면, 해당 감정을 반영한 구체적인 묘사로 표현해주세요. (예: 'run' → 'running away in fear')
    12. 입력된 꿈일기 텍스트는 한국어 또는 영어일 수 있으며, 혼용된 경우에도 전체 문맥을 고려하여 자연스럽게 해석하고 동일한 방식으로 키워드를 추출해주세요.
    13. 꿈의 내용이 잔혹하거나 지나치게 공포스럽게 표현된 경우, 감정과 분위기는 유지하되, 폭력적이지 않은 표현으로 순화해주세요. 예를 들어, '피가 난다'는 '상처가 났다', '사람들이 칼로 나를 찔렀다'는 **'사람들에게 위협당했다'**처럼, 텍스트-투-이미지/비디오 모델이 부적절한 장면을 생성하지 않도록, 시각적으로 자극적이지 않은 키워드를 사용해주세요.
    
    
    
    ### 📌 **예시 1** 
    #### 입력 텍스트:  
    "꿈에 최예나가 나왔는데 나랑 친구였어. 예나랑 나랑 사이좋게 계란 까먹으려 하는데 잘 못 까길래 나 계란 짱 잘 까! 하고 잘 까진 거 건네주고 예나꺼 내가 받아서 까줬어."  

    #### 기존 출력 (X - 너무 정적임):  
    `[dream, friend, egg, share]`  

    #### 개선된 출력 (O - 더 동적이고 영상에 적합함):  
    `[cracking an egg, sharing, friendship, smiling]`  

    ---  

    ### 📌 **예시 2**  
    #### 입력 텍스트:  
    "나는 거대한 유령의 성에 갇혀 있었어. 복도를 따라 걸어가는데, 벽에 걸린 초상화가 나를 따라 보는 것 같았어. 갑자기 창문이 열리더니 바람이 거세게 불었고, 촛불이 모두 꺼졌어."  

    #### 기존 출력 (X - 너무 단순함):  
    `[ghost, castle, wind, painting]`  

    #### 개선된 출력 (O - 동적이고 감정 반영됨):  
    `[walking in a haunted castle, eerie wind, moving portraits, flickering candlelight]`  

    ---  

    ### 📌 **예시 3**  
    #### 입력 텍스트:  
    "모르는 사람의 집에 들어갔는데 집이 정말 예뻤어. 이불이 하나 놓여있어서 그걸 가지고 밖에 와서 강을 바라보며 의자에서 이불 덮고 잠을 잤어. 얼마나 잤을까? 주인이 돌아왔더라고. 근데 짐을 몰래 두고 갈까 하다가 들킬 것 같아서 그냥 죄송하다고 했어, 잘못했다고. 근데 그리고 집을 가는데 그 집이 자꾸 눈에 아른거려서 다시 갔어. 고양이마냥 천장으로 들어갔는데 들킬 것 같아 조마조마했지만, 집이 진짜 예뻐서 예쁘다는 생각을 했어. 그 집에는 고양이가 엄청 많더라. 엄청 귀엽고 예쁜 고양이들이 많이 있더라. 고양이들이 모르는 사람이 들어와서 그런지 나를 쳐다보더라. 그렇게 고양이와 집을 구경하고 나왔어"  

    #### 기존 출력 (X - 정적임):  
    `[house, blanket, cat, river]`  

    #### 개선된 출력 (O - 더 영상에 적합함):  
    `[sneaking into a beautiful house, warm blanket, sleeping by the river, feeling anxious, crawling like a cat, curious cats staring, exploring the house]`  

    ---  
    
    ### 📌 **예시 4**  
    #### 입력 텍스트:  
    "기싱이 나 따라와또 무서워또 "  

    #### 기존 출력 (X - 정적임):  
    `[ghost, being followed, fear]`  

    #### 개선된 출력 (O - 더 영상에 적합함):  
    `[ghost, being followed in the dark, fearful expression, dark alley, eerie atmosphere]`
    --- 
        
    ### 📌 **예시 5*  
    #### 입력 텍스트:  
    "계속 떨어지고 있었어. 멈추지 않고 끝없이. 뭔가 불안하고 무서웠어."  

    #### 기존 출력 (X - 정적임):  
    `[falling, fear]`  

    #### 개선된 출력 (O - 더 영상에 적합함):  
    `["endless free fall", "helpless feeling", "dark void", "rising anxiety"]`
    --- 
    
    ### 📌 **예시 6*  
    #### 입력 텍스트:  
    "괴물이 나타났어 사람들은 그 괴물이 안보여 근데 그 괴물이 나를 들어올렸어 근데 사람들한테는 그 괴물이 안보이잖아 그래서 사람들 눈에는 나는 날라다니는 사람이었어 다들 신기하고 이상하게 나를 쳐다봤지."  

    #### 기존 출력 (X - 정적임):  
    `[monster, floating, people staring, invisible]`  

    #### 개선된 출력 (O - 더 영상에 적합함):  
    `["invisible monster lifting me", "floating helplessly", "confused crowd staring", "mysterious atmosphere"]`
    --- 
    
    ### 📌 **예시 7*  
    #### 입력 텍스트:  
    "나는 낯선 골목길을 걷고 있었어. 갑자기 사람들이 나타나서 나를 둘러싸더니 칼로 나를 찔렀어. 몸이 아프고 피가 났고, 난 쓰러졌는데도 계속 사람들이 나를 쳐다봤어. 너무 무섭고 숨이 막혔어."  

    #### 기존 출력 (X - 정적임):  
    `["knife attack", "bleeding", "pain", "people staring"]`  

    #### 개선된 출력 (O - 더 영상에 적합함):  
    `["threatening crowd", "surrounded in a dark alley", "feeling helpless", "intense fear", "collapsing from exhaustion", "people watching in silence"]`
    --- 
    
    ### 📌 **예시 9*  
    #### 입력 텍스트:  
    "나는 어느 날 갑자기 하늘을 날 수 있게 되었어. 처음엔 무서웠지만 점점 높이 떠오르면서 도시와 바다를 내려다봤고, 태양 가까이까지 날아가는 기분이었어. 나는 앞으로도 계속 날 수 있을 것만 같았어"
    
    #### 기존 출력 (X - 정적임):  
    `[tunnel, light, running, field]`  

    #### 개선된 출력 (O - 더 영상에 적합함):  
    `["dark tunnel", "distant ray of light", "running towards light", "reaching bright field", "feeling of relief"]`
    --- 
    
        
    ### 📌 **예시 8*  
    #### 입력 텍스트:  
    "잔잔한 호숫가에 앉아 있는데, 물 위에 연꽃이 피어 있었어. 바람이 살랑이고, 나는 그곳에서 깊은 평온함을 느꼈어."
    
    #### 기존 출력 (X - 정적임):  
    `[lake, lotus, wind, tranquility]`  

    #### 개선된 출력 (O - 더 영상에 적합함):  
    `["sitting by calm lake", "blooming lotus on water", "gentle breeze", "deep sense of tranquility"]`
    --- 
    
        
    ### 📌 **예시 8*  
    #### 입력 텍스트:  
    "친구와 말다툼을 했어. 나는 화가 나서 소리를 질렀고, 친구는 등을 돌리고 떠나버렸어. 그 순간 너무 화가 나서 주먹을 꽉 쥐었어"
    
    #### 기존 출력 (X - 정적임):  
    `[argument, anger, shouting, friend leaving]`  

    #### 개선된 출력 (O - 더 영상에 적합함):  
    `["heated argument with friend", "shouting in anger", "friend turning away", "clenching fists in frustration"]`
    --- 
    
        
    ### 📌 **예시 8*  
    #### 입력 텍스트:  
    "오랜만에 가족들과 함께 저녁 식사를 했어. 모두 웃으며 맛있는 음식을 나누었고, 나는 그 순간이 너무 행복했어."
    
    #### 기존 출력 (X - 정적임):  
    `[family, dinner, laughter, happiness]`

    #### 개선된 출력 (O - 더 영상에 적합함):  
    `["family gathering for dinner", "sharing delicious food", "laughter around the table", "warm feeling of happiness"]`
    --- 

    ### 입력 텍스트:  
    {text}  

    ### 출력 형식:  
    English keywords: [keyword 1, english keyword 2, ..., english keyword N]
    """
)

# 출력을 문자열로 파싱
parser = StrOutputParser()

# 체인 구성
chain = prompt | llm | parser

