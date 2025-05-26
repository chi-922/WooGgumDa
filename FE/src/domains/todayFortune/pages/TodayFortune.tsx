import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../style/TodayFortune.css';
import card from '@/assets/images/fortune_card.svg';
import space_bg from '@/assets/images/space_bg.svg';
import StarField from '@/domains/mainpage/components/universe/StarField';
import { Canvas } from '@react-three/fiber';
import api from '@/apis/apiClient';

const TodayFortune = () => {
  const nav = useNavigate();
  const [isAnimated, setIsAnimated] = useState(false);
  const [initialAnimationComplete, setInitialAnimationComplete] =
    useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [fortuneContent, setFortuneContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onClickHome = () => {
    const whereShouldIgo = localStorage.getItem('FromDiary');
    if (whereShouldIgo === 'goUniverse') {
      nav('/');
      localStorage.removeItem('FromDiary');
    } else {
      nav('/spaceship');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchFortune = async () => {
      if (isLoading) return;
      setIsLoading(true);

      try {
        const checkResponse = await api.get('/daily-fortune');

        if (isMounted) {
          if (
            checkResponse?.data?.data &&
            checkResponse.data.data !==
              '오늘의 운세가 아직 생성되지 않았습니다.'
          ) {
            setFortuneContent(checkResponse.data.data);
          } else {
            // console.log("Creating new fortune...");
            try {
              const createResponse = await api.post('/daily-fortune');
              await new Promise((resolve) => setTimeout(resolve, 500));

              if (isMounted) {
                try {
                  const finalResponse = await api.get('/daily-fortune');

                  if (isMounted && finalResponse?.data?.data) {
                    setFortuneContent(finalResponse.data.data);
                  } else {
                    setFortuneContent('운세 내용을 찾을 수 없습니다.');
                  }
                } catch (finalError) {
                  setFortuneContent('운세를 가져오는데 실패하였습니다.');
                }
              }
            } catch (createError) {
              setFortuneContent('새 운세를 생성하는데 실패하였습니다.');
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          setFortuneContent('오늘의 운세를 가져오는데 실패하였습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFortune();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const animationTimer1 = setTimeout(() => {
      setIsAnimated(true);
      const animationTimer2 = setTimeout(() => {
        setInitialAnimationComplete(true);
        setIsGlowing(true);
        const animationTimer3 = setTimeout(() => {
          setIsGlowing(false);
        }, 1000);
        return () => clearTimeout(animationTimer3);
      }, 1000);
      return () => clearTimeout(animationTimer2);
    }, 100);

    return () => clearTimeout(animationTimer1);
  }, []);
  useEffect(() => {
    const handleContextLost = (e) => {
      e.preventDefault();
    };
    const handleContextRestored = () => {
      // console.log("WebGL context restored");
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener(
          'webglcontextrestored',
          handleContextRestored
        );
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen relative">
      <Canvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'black',
        }}
        camera={{ position: [0, 0, 5] }}
        onContextLost={(e) => {
          e.preventDefault();
        }}>
        <StarField />
      </Canvas>

      <div className="absolute top-3 right-4 text-2xl text-white">
        <button
          onClick={onClickHome}
          className="cursor-pointer hover:text-gray-200">
          ✕
        </button>
      </div>

      {/* 카드 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className={`card-container 
          ${isAnimated ? 'animated' : ''} 
          ${initialAnimationComplete ? 'animation-complete' : ''} 
          ${isGlowing ? 'temp-glow' : ''}
          `}>
          <img
            src={card}
            alt="fortune card"
            className="w-70"
          />
          {isAnimated && (
            <div className="maru-font text-[17px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center p-4 fortune-text">
              {isLoading ? <p></p> : <p>{fortuneContent}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayFortune;
