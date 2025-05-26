// 메인 우주 컴포넌트

import { diaryApi } from '@/domains/diary/api/diaryApi';
import DiaryComponent from '@/domains/diary/modals/DiaryComponent';
import DiaryDetail from '@/domains/diary/modals/DiaryDetail';
import DiaryPreview from '@/domains/mainpage/components/DiaryPreview';
import BlackHole from '@/domains/mainpage/components/universe/BlackHoles';
import DiaryStar from '@/domains/mainpage/components/universe/DiaryStar';
import StarField from '@/domains/mainpage/components/universe/StarField';
import Ufo from '@/domains/mainpage/components/universe/Ufo';
import {
  removeDiary,
  setCurrentDiary,
  updateDiary,
  hideDiaryModal,
  setDiaries,
} from '@/stores/diary/diarySlice';
import { RootState } from '@/stores/store';
import { Line, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as THREE from 'three';
import { selectVisitUser } from '../../stores/userSelectors';
import { selectUser } from '@/stores/auth/authSelectors';
import api from '@/apis/apiClient';
import { toast } from 'react-toastify';

// props의 타입 정의
interface UniverseProps {
  isMySpace?: boolean;
  userSeq?: number; // 다른 사람 Seq
}

const Universe: React.FC<UniverseProps> = ({ isMySpace = true, userSeq }) => {
  // 리덕스 설정
  const dispatch = useDispatch();
  const { diaries, showDiaryModal, selectedDiarySeq } = useSelector(
    (state: RootState) => state.diary
  );
  const visitUser = useSelector(selectVisitUser);
  const loginUser = useSelector(selectUser);

  // ------------------- 상태관리 ------------------- //
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [wasJustUpdated, setWasJustUpdated] = useState(false); // 일기 수정 여부 추적

  // 별 관련 상태
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]); // 일기 목록
  const [newStarId, setNewStarId] = useState<number | null>(null); // 새로 생성된 별 - 최근 생성된 별을 찾아서 표시해줘야 하기 때문에 필요
  const [highlightStarId, setHighlightStarId] = useState<number | null>(null); // 반짝임 효과만을 위한 상태 설정

  // 별 미리보기 및 클릭 시 사용할 상태
  const [hoveredEntry, setHoveredEntry] = useState<any | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [currentDiaryDetail, setCurrentDiaryDetail] = useState<any | null>(
    null
  );

  // 우주 데이터 관련 상태 추가
  const [universeData, setUniverseData] = useState<any | null>(null);
  const [connections, setConnections] = useState<{ [key: string]: number[] }>(
    {}
  ); // 일기 연결 정보

  const [showDetail, setShowDetail] = useState<boolean>(false);

  // -------------------------- 우주관련 -------------------------- //
  // 카메라 컨트롤 참조
  const controlsRef = useRef<any>(null);

  // 카메라 초기 위치 (나중에 복원하기 위해 사용)
  const initialCameraPosition = useRef({
    position: [0, 0, -30],
    target: [0, 0, 0],
  });

  // 카메라를 원래 위치로 부드럽게 복원하는 함수
  const animateCameraReturn = (initialPosition: {
    position: number[];
    target: number[];
  }) => {
    // 현재 카메라 위치와 타겟
    const currentCamera = {
      position: controlsRef.current.object.position.clone(),
      target: controlsRef.current.target.clone(),
    };

    // 목표 위치와 타겟
    const targetCamera = {
      position: new THREE.Vector3(
        initialPosition.position[0],
        initialPosition.position[1],
        initialPosition.position[2]
      ),
      target: new THREE.Vector3(
        initialPosition.target[0],
        initialPosition.target[1],
        initialPosition.target[2]
      ),
    };

    // 애니메이션 시작 시간
    const startTime = Date.now();
    // 애니메이션 지속 시간 (밀리초)
    const duration = 2000;

    // 애니메이션 프레임 함수
    const animateFrame = () => {
      const elapsedTime = Date.now() - startTime;
      // 경과 비율 (0~1)
      const ratio = Math.min(elapsedTime / duration, 1);

      // 이징 함수 (smooth transition)
      const easedRatio = 1 - Math.pow(1 - ratio, 3);

      // 위치 보간
      controlsRef.current.object.position.lerpVectors(
        currentCamera.position,
        targetCamera.position,
        easedRatio
      );

      // 타겟 보간
      controlsRef.current.target.lerpVectors(
        currentCamera.target,
        targetCamera.target,
        easedRatio
      );

      // 컨트롤 업데이트
      controlsRef.current.update();

      // 애니메이션이 끝나지 않았으면 계속 진행
      if (ratio < 1) {
        requestAnimationFrame(animateFrame);
      }
    };

    // 애니메이션 시작
    requestAnimationFrame(animateFrame);
  };

  // ------------------------- 일기 조회 ----------------------------//

  // Redux 상태에 따라 일기 모달 표시
  useEffect(() => {
    if (showDiaryModal && selectedDiarySeq) {
      loadDiaryDetail(selectedDiarySeq);
    }
  }, [showDiaryModal, selectedDiarySeq]);

  // 일기 상세 정보 로드 함수 추가 (이 함수를 컴포넌트 내부에 추가)
  const loadDiaryDetail = async (diarySeq: number) => {
    try {
      const response = await diaryApi.getDiaryById(diarySeq);

      if (response && response.data && response.data.data) {
        // 리덕스에 현재 선택된 일기 저장
        dispatch(setCurrentDiary(response.data.data));

        setCurrentDiaryDetail(response.data.data);
        setShowDetail(true);
      }
    } catch (error) {
      // 에러 응답 확인
      const err = error as any;

      if (err.response && err.response.status === 400) {
        // 400 에러일 경우 특정 메시지 처리
        if (
          err.response.data &&
          err.response.data.message === '해당 일기를 찾을 수 없습니다.'
        ) {
          toast.error('해당 일기를 찾을 수 없습니다.', {
            // position: 'bottom-right',
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'dark',
          });
        } else {
          toast.error(
            '일기 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            {
              // position: 'bottom-right',
              autoClose: 3000,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: 'dark',
            }
          );
        }
      } else if (err.response && err.response.status === 401) {
        // 401 권한 오류 처리
        toast.error(
          '로그인이 필요하거나 세션이 만료되었습니다. 다시 로그인해주세요.',
          {
            // position: 'bottom-right',
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'dark',
          }
        );
      } else {
        // 기타 오류
        toast.error(
          '일기를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          {
            // position: 'bottom-right',
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'dark',
          }
        );
      }
    }
  };

  // ------------------- 일기 생성 (내 우주만) ------------------------ //
  // 화면을 더블클릭하면 일기가 생성됨
  const handleDoubleClick = () => {
    if (!isMySpace) return;

    setShowForm(true);
    setIsEditing(false);
  };

  // 일기 별 생성 -> DiaryComponent로 전달
  const handleDiaryCreated = async (responseData: any) => {
    // const newDiary = responseData.data;

    // 다이어리 시퀀스 기억하기
    const newDiarySeq = responseData.data.diarySeq;
    // 백에서 일기 생성하고 별자리 재배치 되었을 테니까 우주 정보 데이터 조회를 해서 거기서 기억한 다이어리 시퀀스 찾아내기
    const response = await api.get(`/diaries/universe/${loginUser?.userSeq}`);

    let newDiary: any;
    if (response) {
      newDiary = response.data.data.diaries.find(
        (diary: { diarySeq: number }) => diary.diarySeq === newDiarySeq
      );
      // 근데 일기 생성하고 바로 일기 재배치 한 저 위에 우주 정보 데이터를 diaryEntries에 바꿔치기를 해버릴까...?
      setDiaryEntries(response.data.data.diaries);
      // 그러면 리덕스에 엤는 diaries를 똑같이 바꿔치기 해버려야해. => dispatch(setDiaries(우주 데이터 중 일기))
      dispatch(setDiaries(response.data.data.diaries));
      setConnections(response.data.data.connections);
    }

    // 새 별 id 설정 (노란색 효과를 위해) - 10분 동안 유지
    setNewStarId(newDiary.diarySeq);

    // 하이라이트 효과 적용 (반짝임)
    setHighlightStarId(newDiary.diarySeq);

    // 현재 카메라 위치 저장 (나중에 원래 위치로 돌아가기 위해)
    if (controlsRef.current) {
      initialCameraPosition.current = {
        position: [...controlsRef.current.object.position.toArray()],
        target: [...controlsRef.current.target.toArray()],
      };
    }

    // 카메라를 새로운 별 위치로 이동
    if (controlsRef.current) {
      controlsRef.current.target.set(newDiary.x, newDiary.y, newDiary.z);
      controlsRef.current.update();
    }

    // 5초 후 하이라이트 효과 제거 및 카메라 원위치
    setTimeout(() => {
      setHighlightStarId(null); // 반짝이는 효과만 제거

      // 카메라를 초기 위치로 부드럽게 복원
      if (controlsRef.current) {
        animateCameraReturn(initialCameraPosition.current);
      }
    }, 5000);

    // 10분 후 노란색 효과 제거
    setTimeout(() => {
      setNewStarId(null); // 노란색 효과 제거
    }, 600000); // 10분

    setShowForm(false); // 모달 닫기
  };

  // ----------------------- 일기 수정 ---------------------------- //
  const handleDiaryUpdated = async (responseData: any) => {
    const updatedDiarySeq = responseData.data.diarySeq;
    const updatedVideoUrl = responseData.data.videoUrl;
    const updateTags = responseData.data.tags;
    // 백에서 일기 생성하고 별자리 재배치 되었을 테니까 우주 정보 데이터 조회를 해서 거기서 기억한 다이어리 시퀀스 찾아내기
    const response = await api.get(`/diaries/universe/${loginUser?.userSeq}`);
    let updatedDiary: any;
    if (response) {
      updatedDiary = response.data.data.diaries.find(
        (diary: { diarySeq: number }) => diary.diarySeq === updatedDiarySeq
      );
      setDiaryEntries(response.data.data.diaries);
      dispatch(setDiaries(response.data.data.diaries));
      setConnections(response.data.data.connections);
    }
    updatedDiary = {
      ...updatedDiary,
      videoUrl: updatedVideoUrl,
      tags: updateTags,
    };

    // 리덕스 스토어 업데이트
    dispatch(updateDiary(updatedDiary));

    // 현재 선택된 일기 정보 업데이트
    setCurrentDiaryDetail(updatedDiary);

    setDiaryEntries((prev) =>
      prev.map((entry) =>
        entry.diarySeq === updatedDiary.diarySeq ? updatedDiary : entry
      )
    );

    // 폼 닫기
    setShowForm(false);

    // 수정된 일기 조회 띄우기
    setShowDetail(true);

    // 하이라이트 효과 적용 (반짝임)
    setHighlightStarId(updatedDiary.diarySeq);

    // 닫고나서 수정 위치 카메라 돌리기
    // 현재 카메라 위치 저장 (나중에 원래 위치로 돌아가기 위해)
    if (controlsRef.current) {
      initialCameraPosition.current = {
        position: [...controlsRef.current.object.position.toArray()],
        target: [...controlsRef.current.target.toArray()],
      };
    }
    // 카메라를 새로운 별 위치로 이동
    if (controlsRef.current) {
      controlsRef.current.target.set(
        responseData.data.x,
        responseData.data.y,
        responseData.data.z
      );
      controlsRef.current.update();
    }
    setWasJustUpdated(true);
  };

  useEffect(() => {
    if (wasJustUpdated) {
      if (!showDetail) {
        setTimeout(() => {
          setHighlightStarId(null); // 반짝이는 효과만 제거
          if (controlsRef.current) {
            animateCameraReturn(initialCameraPosition.current);
          }
          setWasJustUpdated(false);
          setCurrentDiaryDetail(null);
        }, 5000);
      }
    }
  }, [showDetail, wasJustUpdated]);

  // ----------------------- 일기 삭제 ---------------------------- //
  const handleDeleteDiary = async () => {
    if (!currentDiaryDetail || !currentDiaryDetail.diarySeq) return;

    try {
      await diaryApi.deleteDiary(currentDiaryDetail.diarySeq);

      // 백에서 일기 생성하고 별자리 재배치 되었을 테니까 우주 정보 데이터 조회를 해서 거기서 기억한 다이어리 시퀀스 찾아내기
      const response = await api.get(`/diaries/universe/${loginUser?.userSeq}`);

      if (response) {
        // 근데 일기 생성하고 바로 일기 재배치 한 저 위에 우주 정보 데이터를 diaryEntries에 바꿔치기를 해버릴까...?
        setDiaryEntries(response.data.data.diaries);
        // 그러면 리덕스에 엤는 diaries를 똑같이 바꿔치기 해버려야해. => dispatch(setDiaries(우주 데이터 중 일기))
        dispatch(setDiaries(response.data.data.diaries));
        setConnections(response.data.data.connections);
      }

      // 성공 시 로컬 상태 업데이트
      // setDiaryEntries((prevEntries) =>
      //   prevEntries.filter(
      //     (entry) => entry.diarySeq !== currentDiaryDetail.diarySeq
      //   )
      // );

      // 리덕스 스토어에서도 제거
      // dispatch(removeDiary(currentDiaryDetail.diarySeq));

      // 조회 모달 닫기
      setShowDetail(false);
      setCurrentDiaryDetail(null);

      // 수정/작성 모달도 닫기
      setShowForm(false);

      // 성공 메시지 표시
      toast.error('일기가 삭제되었습니다.', {
        // position: 'bottom-right',
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });
    } catch (error) {
      toast.error('일기 삭제에 실패했습니다. 다시 시도해주세요.', {
        // position: 'bottom-right',
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'dark',
      });
    }
  };

  // 일기 조회 모달 닫기
  const handleCloseDetail = () => {
    setShowDetail(false);
    setCurrentDiaryDetail(null);
    dispatch(hideDiaryModal());
    localStorage.removeItem('selectedDiarySeq');
  };

  useEffect(() => {
    const checkSelectedDiary = async () => {
      try {
        const selectedDiarySeq = localStorage.getItem('selectedDiarySeq');

        if (selectedDiarySeq && diaryEntries.length > 0) {
          // 일기 ID를 숫자로 변환
          const diarySeq = parseInt(selectedDiarySeq);

          // 선택된 일기가 현재 목록에 있는지 확인
          const matchingEntry = diaryEntries.find(
            (entry) => entry.diarySeq === diarySeq
          );

          if (matchingEntry) {
            // 해당 일기 상세 정보 로드
            await loadDiaryDetail(diarySeq);

            // 카메라를 해당 별 위치로 이동
            if (controlsRef.current) {
              controlsRef.current.target.set(
                matchingEntry.x,
                matchingEntry.y,
                matchingEntry.z
              );
              controlsRef.current.update();
            }

            // LocalStorage에서 삭제 (일회성 사용)
            localStorage.removeItem('selectedDiarySeq');
          }
        }
      } catch (error) {}
    };

    if (diaryEntries.length > 0) {
      checkSelectedDiary();
    }
  }, [diaryEntries]);

  // ------------------- 일기 목록 조회 (전체 별들) ------------------------ //
  // 컴포넌트 마운트 시 초기 일기 데이터 로드
  useEffect(() => {
    // api에서 일기 데이터 가져오기
    const fetchDiaries = async () => {
      try {
        const response = await (async () => {
          if (isMySpace) {
            return await diaryApi.getDiaries();
          } else if (userSeq) {
            return await diaryApi.getUserDiaries(userSeq);
          }
          return null;
        })();

        if (!response) return;

        // api응답에서 일기 데이터 설정
        if (response && response.data && response.data.data) {
          setDiaryEntries(response.data.data);
        }
      } catch (error) {}
    };

    // userSeq에 맞게 데이터 로드
    if (isMySpace || userSeq) {
      fetchDiaries();
    }
  }, [isMySpace, userSeq]);

  // 우주 데이터 로드 추가
  useEffect(() => {
    const fetchUniverseData = async () => {
      if (!visitUser || !visitUser.userSeq) return;

      try {
        const response = await diaryApi.getUniverseData(visitUser.userSeq);
        if (response && response.data) {
          setUniverseData(response.data.data);
          if (response.data.data.connections) {
            setConnections(response.data.data.connections);
          }
        }
      } catch (error) {}
    };

    fetchUniverseData();
  }, [visitUser]); // <- visitUser가 바뀌었을 때만 실행되게

  // 리덕스 스토어의 일기 데이터가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    if (diaries && diaries.length > 0) {
      // 기존 일기를 유지하면서 리덕스의 새 일기만 추가하는 방식으로 변경
      setDiaryEntries((prevEntries) => {
        const existingIds = new Set(prevEntries.map((entry) => entry.diarySeq));
        const newEntries = diaries.filter(
          (diary) => !existingIds.has(diary.diarySeq)
        );
        return [...prevEntries, ...newEntries];
      });
    }
  }, [diaries]);

  // ----------------------- 일기 연결 별자리 생성 ----------------------- //
  // API에서 받아온 연결 정보를 기반으로 별들 간 연결 생성
  const generateConnectionsFromApi = () => {
    if (
      !connections ||
      Object.keys(connections).length === 0 ||
      diaryEntries.length === 0
    ) {
      return [];
    }

    const connectionLines: { from: any; to: any }[] = [];

    // 모든 연결 정보를 순회
    Object.entries(connections).forEach(([sourceId, targetIds]) => {
      const sourceIdNum = parseInt(sourceId);
      const sourceDiary = diaryEntries.find(
        (entry) => entry.diarySeq === sourceIdNum
      );

      if (sourceDiary) {
        // 이 일기와 연결된 모든 대상 일기 순회
        targetIds.forEach((targetId) => {
          const targetDiary = diaryEntries.find(
            (entry) => entry.diarySeq === targetId
          );

          if (targetDiary) {
            // 양방향 중복 연결 방지 (이미 A->B가 있으면 B->A는 추가하지 않음)
            const alreadyConnected = connectionLines.some(
              (conn) =>
                (conn.from.diarySeq === sourceIdNum &&
                  conn.to.diarySeq === targetId) ||
                (conn.from.diarySeq === targetId &&
                  conn.to.diarySeq === sourceIdNum)
            );

            if (!alreadyConnected) {
              connectionLines.push({
                from: sourceDiary,
                to: targetDiary,
              });
            }
          }
        });
      }
    });

    return connectionLines;
  };

  useEffect(() => {
    if (diaryEntries.length > 0) {
      generateConnectionsFromApi();
    }
  }, [diaryEntries]);

  return (
    <div
      className="universe-container"
      onDoubleClick={handleDoubleClick}>
      {/* -------------------------------3D 우주 공간--------------------------- */}
      <div
        className="space-scene-container"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100vh',
          zIndex: 0, // 배경처럼 설정
        }}>
        <Canvas
          // 구 내부에서 별들을 바라보는 느낌
          camera={{ position: [0, 0, -30], fov: 90, far: 5000 }}
          style={{
            background: 'black',
            width: '100vw',
            height: '100vh',
          }}>
          {/* 별 배경 */}
          <StarField />
          {/* 3D블랙홀 */}
          <BlackHole />
          {/* 3D UFO */}
          <Ufo />

          {/* 일기 별들 추가 */}
          <group>
            {diaryEntries.map((entry) => (
              <DiaryStar
                key={entry.diarySeq}
                entry={entry}
                onClick={(entry, position) => {
                  setSelectedEntry(entry);
                  setSelectedPosition(position);

                  loadDiaryDetail(entry.diarySeq);
                }}
                // 호버 했을 때는 일기 미리보기
                onHover={(entry, position) => {
                  setHoveredEntry(entry);
                  setHoveredPosition(position);
                }}
                isNew={entry.diarySeq === newStarId}
                isHighlight={entry.diarySeq === highlightStarId}
              />
            ))}
          </group>

          {/* 카메라 컨트롤 */}
          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            autoRotate={false}
            rotateSpeed={0.5}
            minDistance={5}
            maxDistance={420}
            target={[0, 0, 0]} // 항상 구의 중심을 바라보도록
            zoomSpeed={3} // 스크롤 속도 증가
          />

          {/* ---------------- 일기를 별자리처럼 연결 ---------------- */}
          <group>
            {generateConnectionsFromApi().map((connection, index) => (
              <Line
                key={index}
                points={[
                  [connection.from.x, connection.from.y, connection.from.z],
                  [connection.to.x, connection.to.y, connection.to.z],
                ]}
                color="rgb(220, 230, 255)" // 연한 푸른 빛 흰색
                lineWidth={1.2} // 선 두께
                dashed // 점선 효과 추가
                dashSize={1} // 점선 크기
                dashScale={-10} // 점선 간격 조정
                dashOffset={0} // 점선 시작 위치
              />
            ))}
          </group>
        </Canvas>
      </div>

      {/* -------------------- 일기별 호버 시 미리보기 뜸 -------------------- */}
      {hoveredEntry && hoveredPosition && (
        <div
          className="absolute z-50"
          style={{
            left: `${hoveredPosition.x}px`,
            top: `${hoveredPosition.y - 150}px`, // 별 위에 표시
          }}>
          <DiaryPreview
            title={hoveredEntry.title}
            content={hoveredEntry.content}
            tags={hoveredEntry.tags || []}
            emotion={hoveredEntry.emotionName || hoveredEntry.mainEmotion}
          />
        </div>
      )}

      {/* -----------------------일기 조회 모달 열림------------------------- */}
      {showDetail && currentDiaryDetail && (
        <DiaryDetail
          initialDiary={currentDiaryDetail}
          isMySpace={isMySpace}
          onClose={handleCloseDetail}
          onEdit={() => {
            if (isMySpace) {
              setIsEditing(true);
              // 수정할 일기 데이터 설정
              setSelectedEntry(currentDiaryDetail);
              // 일기 조회 모달 닫기
              setShowDetail(false);
              // 작성/수정 폼 모달 열기
              setShowForm(true);
            }
          }}
        />
      )}

      {/* -----------------------일기 작성 모달 열림------------------------- */}
      {showForm && (
        <DiaryComponent
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          isEditing={isEditing}
          diaryData={isEditing ? selectedEntry : undefined}
          onDiaryCreated={handleDiaryCreated}
          onDiaryUpdated={handleDiaryUpdated}
          onDeleteDiary={handleDeleteDiary}
        />
      )}
    </div>
  );
};

export default Universe;
