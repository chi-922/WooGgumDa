import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/LuckyNumber.css';
import { Canvas } from '@react-three/fiber';
import StarField from '@/domains/mainpage/components/universe/StarField';
import LuckyDrawButton from '@/domains/luckyNumber/components/LuckyDrawButton';

// Redux 상태에서 필요한 데이터 불러오기 위해 import
import { useSelector } from 'react-redux';
import { selectUser } from '@/stores/auth/authSelectors';
import api from '@/apis/apiClient';

const LuckyNumber = () => {
  const [visibleStars, setVisibleStars] = useState<number[]>([]);
  const [visibleLines, setVisibleLines] = useState<number[][]>([]);
  const [showText, setShowText] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [visibleNumbers, setVisibleNumbers] = useState<number[]>([]);
  const [showButton, setShowButton] = useState(false); // 초기값을 false로 설정하여 API 응답 전까지 버튼이 보이지 않게 함
  const [animationStage, setAnimationStage] = useState(0);
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false); // API 데이터 로딩 상태 추적

  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchLuckyNumbers = async () => {
      try {
        const response = await api.get('/lucky-numbers');
        // 응답 데이터에서 번호 배열 가져오기
        // response.data.data가 있는지 먼저 확인
        let numbers;
        numbers = response.data?.data ?? response.data;
        if (!Array.isArray(numbers)) {
          numbers = [];
        }
        setLuckyNumbers(numbers);

        // 번호가 있으면 바로 별자리 화면을 보여줌
        if (numbers && numbers.length > 0) {
          setShowButton(false); // 번호가 있으면 버튼 숨기기
          setShowText(true);
          setTypingText('오늘의 행운의 번호는'); // 타이핑 애니메이션 없이 바로 텍스트 설정

          // 가져온 번호를 표시할 별들에 맞게 설정
          if (numbers.length <= stars.length) {
            // API에서 받은 lucky number로 stars 배열 업데이트
            const updatedStars = [...stars];
            numbers.forEach((num, index) => {
              if (index < updatedStars.length) {
                updatedStars[index].id = num;
              }
            });
            setStars(updatedStars);

            // 별과 연결선 즉시 표시
            const allStarIds = updatedStars.map((star) => star.id);
            setVisibleStars(allStarIds);

            // 모든 연결선 표시
            const allConnections = connections.map((conn) => conn);
            setVisibleLines(allConnections);

            // 모든 번호 즉시 표시
            setVisibleNumbers(allStarIds);

            // 애니메이션 단계 4로 바로 설정
            setAnimationStage(4);
          }
        } else {
          setShowButton(true); // 번호가 없으면 버튼 표시
        }

        // 데이터 로딩 완료 표시
        setDataLoaded(true);
      } catch (error) {
        // 에러 발생 시에도 버튼 표시
        setShowButton(true);
        setDataLoaded(true);
      }
    };

    fetchLuckyNumbers();
  }, []);

  const nav = useNavigate();
  const onClickHome = () => {
    const whereShouldIgo = localStorage.getItem('FromDiary');
    if (whereShouldIgo === 'goUniverse') {
      nav('/');
      localStorage.removeItem('FromDiary');
    } else {
      nav('/spaceship');
    }
  };

  // 별자리 위치 옮기고 싶으면 여기 고치면 됩니다.!!
  // x 좌표는 커질수록 오른쪽으로
  // y 좌표는 커질수록 아래로 이동합니다.!
  // 고칠 때 참고 부탁드립니다.!
  // size는 별 자체 크기, glowSize는 주변 빛 효과 크기
  const [stars, setStars] = useState([
    { id: 16, x: 20, y: 56, size: 1.5, glowSize: 3.2 }, //  더 큰 별
    { id: 32, x: 33, y: 35, size: 0.9, glowSize: 2.0 }, //  작은 별
    { id: 27, x: 36, y: 68, size: 1.8, glowSize: 3.6 }, //  가장 큰 별
    { id: 3, x: 59, y: 44, size: 1.2, glowSize: 2.6 }, //  기본 크기
    { id: 15, x: 72, y: 22, size: 1.0, glowSize: 2.2 }, //  중간 크기
    { id: 9, x: 99, y: 20, size: 1.4, glowSize: 3.0 }, //  큰 별
  ]);

  const connections = [
    [0, 1],
    [1, 3],
    [3, 4],
    [4, 5],
    [3, 2],
    [2, 0],
  ];

  const handleDrawClick = async () => {
    setShowButton(false); // 버튼 클릭 즉시 버튼 숨기기
    setShowText(true);
    setTypingText('오늘의 행운의 번호는');

    try {
      // 버튼 클릭 시 새로운 행운의 번호 생성 API 호출
      const response = await api.post('/lucky-numbers');

      // API 응답 구조에 따라 데이터 처리
      let numbersFromResponse;

      // POST 요청 후 GET 요청을 통해 데이터 가져오기
      if (response.data.status === 201 || response.status === 201) {
        const getResponse = await api.get('/lucky-numbers');
        numbersFromResponse = getResponse.data?.data ?? getResponse.data;
      } else {
        // POST 응답에서 직접 데이터 가져오기
        numbersFromResponse = response.data?.data ?? response.data;
      }

      if (!Array.isArray(numbersFromResponse)) {
        numbersFromResponse = [];
      }

      setLuckyNumbers(numbersFromResponse);

      // 응답으로 받은 번호로 stars 배열 업데이트
      if (numbersFromResponse && numbersFromResponse.length > 0) {
        const updatedStars = [...stars];
        numbersFromResponse.forEach((num, index) => {
          if (index < updatedStars.length) {
            updatedStars[index].id = num;
          }
        });

        setStars(updatedStars);

        // 애니메이션 단계를 1로 설정하여 시작
        setAnimationStage(1);
      } else {
      }
    } catch (error) {
      // 에러 발생 시에도 애니메이션은 계속 진행
      setAnimationStage(1);
    }
  };

  // animationStage 변경 추적
  useEffect(() => {}, [animationStage]);

  useEffect(() => {
    if (animationStage === 1) {
      const fullText = '오늘의 행운의 번호는';
      let currentText = '';
      let index = 0;

      const typingInterval = setInterval(() => {
        if (index < fullText.length) {
          currentText += fullText[index];
          setTypingText(currentText);
          index++;
        } else {
          clearInterval(typingInterval);
          setAnimationStage(2);
        }
      }, 100);

      return () => clearInterval(typingInterval);
    }
  }, [animationStage]);

  useEffect(() => {
    if (animationStage === 2) {
      // 초기화
      setVisibleStars([]);
      setVisibleLines([]);

      // 별들을 순차적으로 나타나게 함
      stars.forEach((star, index) => {
        setTimeout(() => {
          // 별 표시
          setVisibleStars((prev) => [...prev, star.id]);

          // 연결선 표시 (별이 2개 이상 표시된 후부터)
          if (index > 0) {
            setTimeout(() => {
              // 현재까지 표시된 별들
              const visibleStarIds = stars
                .filter((_, i) => i <= index)
                .map((s) => s.id);

              // 연결선 업데이트
              connections.forEach((conn) => {
                const star1 = stars[conn[0]];
                const star2 = stars[conn[1]];

                if (
                  visibleStarIds.includes(star1.id) &&
                  visibleStarIds.includes(star2.id)
                ) {
                  setVisibleLines((prev) => {
                    // 이미 있는 연결선이면 추가하지 않음
                    if (
                      prev.some(
                        (line) =>
                          (line[0] === conn[0] && line[1] === conn[1]) ||
                          (line[0] === conn[1] && line[1] === conn[0])
                      )
                    ) {
                      return prev;
                    }
                    return [...prev, conn];
                  });
                }
              });
            }, 100); // 연결선이 별 직후에 나타나도록 지연시간 감소
          }

          // 마지막 별이 표시된 후 다음 단계로
          if (index === stars.length - 1) {
            setTimeout(() => {
              setAnimationStage(3);
            }, 500);
          }
        }, 400 * index); // 별들이 순차적으로 나타나는 간격 조정
      });
    }
  }, [animationStage]);

  useEffect(() => {
    if (animationStage === 3) {
      stars.forEach((s, numIndex) => {
        setTimeout(() => {
          setVisibleNumbers((prev) => [...prev, s.id]);

          // 마지막 숫자가 추가되면 다음 단계로
          if (numIndex === stars.length - 1) {
            setTimeout(() => {
              setAnimationStage(4);
            }, 300);
          }
        }, 300 * numIndex);
      });
    }
  }, [animationStage]);

  // stars 상태 변경 감지
  useEffect(() => {}, [stars]);

  return (
    <div className="w-screen h-screen relative clover-font bg-black">
      <Canvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'black',
          zIndex: 1,
        }}
        camera={{
          position: [0, 0, 5],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}>
        <StarField />
      </Canvas>

      {/* 닫기 버튼 */}
      <div
        className="absolute top-3 right-4 text-2xl text-white"
        style={{ zIndex: 9999 }}>
        <button
          onClick={onClickHome}
          className="cursor-pointer hover:text-gray-200">
          ✕
        </button>
      </div>

      {/* 텍스트 */}
      {showText && (
        <div
          className="lucky-text visible absolute bottom-38 left-0 right-0 mx-auto w-full text-center text-white text-[22px] clover-font tracking-widest"
          style={{ zIndex: 30 }}>
          {typingText}
          {(animationStage === 3 || animationStage === 4) && (
            <span
              className="number-container"
              style={{ fontSize: '22px' }}>
              {stars.map((star, index) => (
                <span
                  key={star.id}
                  className={`number-slot ${visibleNumbers.includes(star.id) ? 'filled' : ''}`}>
                  <span className="number-value">
                    {visibleNumbers.includes(star.id) ? star.id : ''}
                  </span>
                </span>
              ))}
            </span>
          )}
        </div>
      )}

      {/* 별자리 SVG - 위치 고정 */}
      {animationStage >= 2 && (
        <div
          style={{
            position: 'fixed', // fixed로 변경
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 20,
            pointerEvents: 'none',
          }}>
          <svg
            viewBox="-3 -11 130 130"
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '100%' }}>
            {/* 연결선 */}
            {connections.map((conn, index) => {
              const isVisible = visibleLines.some(
                (line) =>
                  (line[0] === conn[0] && line[1] === conn[1]) ||
                  (line[0] === conn[1] && line[1] === conn[0])
              );
              return (
                <line
                  key={`line-${index}`}
                  x1={stars[conn[0]].x}
                  y1={stars[conn[0]].y}
                  x2={stars[conn[1]].x}
                  y2={stars[conn[1]].y}
                  stroke="white"
                  strokeWidth="0.2"
                  className={`constellation-line ${isVisible ? 'visible' : ''}`}
                />
              );
            })}

            {/* 별 */}
            {stars.map((star) => {
              const visible = visibleStars.includes(star.id);
              return (
                <g
                  key={`lucky-star-${star.id}`}
                  className={`lucky-star ${visible ? 'visible' : ''}`}>
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={star.glowSize}
                    fill="rgba(255, 255, 255, 0.3)"
                    className={`lucky-star-glow ${visible ? 'visible' : ''}`}
                  />
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={star.size}
                    fill="white"
                    className={`lucky-star-center ${visible ? 'visible' : ''}`}
                  />
                  <text
                    x={star.x}
                    y={star.y - star.size - 1}
                    fontSize="3"
                    fill="white"
                    textAnchor="middle">
                    {star.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* 버튼 */}
      {showButton && dataLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 30 }}>
          <LuckyDrawButton
            onClick={handleDrawClick}
            visible={true}
          />
        </div>
      )}

      {showButton && dataLoaded && (
        <div
          className="absolute top-40 left-0 right-0 text-center"
          style={{ zIndex: 30 }}>
          <div className="text-lg text-white/95 dung-font">
            하루에 한 번만 뽑을 수 있습니다 🍀
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckyNumber;
