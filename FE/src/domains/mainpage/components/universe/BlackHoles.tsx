import React, { useState, useEffect, useRef } from 'react';
import { useGLTF, useCursor, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppDispatch } from '@/hooks/hooks';
import { visitOtherUserpage } from '@/domains/mainpage/stores/userThunks';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectVisitUser } from '@/domains/mainpage/stores/userSelectors';
import test2 from "@/assets/images/blackhole_hangle.svg"

export default function BlackHole() {
  const { scene } = useGLTF('/universe/blackholes/scene.gltf');
  const [modelReady, setModelReady] = useState(false);
  const [hovered, setHovered] = useState(false);
  const blackHoleRef = useRef();
  const imageRef = useRef();

  // useCursor 훅을 사용하여 hovered 상태에 따라 커서를 변경합니다.
  useCursor(hovered, 'pointer', 'auto');

  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const visitUser = useSelector(selectVisitUser);

  // 모델이 로드되었는지 확인
  useEffect(() => {
    if (scene) {
      // scene을 복제하여 사용하면 참조 문제를 방지할 수 있습니다
      const clonedScene = scene.clone();
      setModelReady(true);
    }
  }, [scene]);

  // 블랙홀 회전 애니메이션 - scene 객체만 제자리에서 회전하도록 수정
  const sceneRef = useRef();

  useFrame((state, delta) => {
    if (sceneRef.current) {
      // scene 객체만 회전시켜 제자리 회전 구현
      sceneRef.current.rotation.y += delta * 0.5;
    }
  });

  const handleClick = async (e) => {
    if (!modelReady) return; // 모델이 로드되지 않았으면 무시

    e.stopPropagation();
    try {
      const result = await dispatch(visitOtherUserpage()).unwrap();

      if (result?.username) {
        nav(`/${result.username}`);
        window.location.reload();
      }
    } catch (error) {
      // 에러 처리
    }
  };

  // 모델이 로드되지 않았으면 아무것도 렌더링하지 않음
  if (!modelReady) return null;

  return (
    <group ref={blackHoleRef}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
        position={[-150, 250, 150]}
        scale={[20, 20, 20]}
        rotation={[Math.PI / 1.2, Math.PI / 3.3, Math.PI / 1.4]}>
        <primitive
          ref={sceneRef}
          object={scene}
        />
      </mesh>

      {/* 호버 시 이미지 표시 - 고정된 위치에서 자체 회전 */}
      {hovered && (
        <group 
          ref={imageRef} 
          position={[-175, 170, 160]} // 블랙홀 위의 고정된 위치
          scale={[-1, 1, 1]} // 다시 좌우 반전 적용
        >
          <Html
            center
            distanceFactor={15}
            transform
            sprite
          >
            <div style={{ 
              width: '1500px', 
              height: '1500px', 
              backgroundColor: 'transparent',
              pointerEvents: 'none',
              transform: 'scaleX(-1)', // div 자체에도 좌우 반전 적용
            }}>
              <img 
                src={test2}
                alt="Blackhole Info" 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  objectFit: 'contain',
                  transform: 'scaleX(-1)', // 이미지에도 좌우 반전 적용
                }} 
              />
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}