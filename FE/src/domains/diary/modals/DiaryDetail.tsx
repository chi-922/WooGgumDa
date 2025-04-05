// 일기 조회 컴포넌트

import React, { useState, useEffect } from 'react';
import DetailHeader from '@/domains/diary/components/details/DetailHeader';
import DetailVideo from '@/domains/diary/components/details/DetailVideo';
import DetailContent from '@/domains/diary/components/details/DetailContent';
// import DetailTags from '@/domains/diary/components/details/DetailTags';
import DetailLike from '@/domains/diary/components/details/DetailLike';
import ModalBase from '../components/modalBase';

import '@/domains/search/styles/DiarySearch.css';
import { diaryApi } from '@/domains/diary/api/diaryApi';
import DiaryTags from '@/domains/diary/components/create_edit/DiaryTags';
import UpdateButton from '@/domains/diary/components/details/button/UpdateButton';
import DeleteButton from '@/domains/diary/components/details/button/DeleteButton';
import { Tag } from '@/domains/diary/api/tagApi';
import { dreamApi } from '@/domains/diary/api/dreamApi';
import DreamMeaningView from '@/domains/diary/components/details/DreamMeaningView';
import DestinyButton from '@/domains/diary/components/details/button/DestinyButton';

interface DiaryDetailProps {
  initialDiary: {
    diarySeq: number;
    title: string;
    content: string;
    tags: Tag[];
    createdAt: string;
    isPublic: string;
    videoUrl?: string | null;
    dreamDate?: string;
    emotionName: string;
    likeCount?: number;
    hasLiked?: boolean;
  };
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isMySpace?: boolean;
}

const DiaryDetail: React.FC<DiaryDetailProps> = ({
  initialDiary, // 일기 초기값
  onClose,
  onEdit,
  onDelete,
  isMySpace = false,
}) => {
  // --------------- 상태관리 ----------------- //
  const [currentDiary, setCurrentDiary] = useState(initialDiary);
  const [dreamMeaning, setDreamMeaning] = useState<{
    resultContent: string;
    isGood: string;
  } | null>(null);
  const [loadingDreamMeaning, setLoadingDreamMeaning] = useState(false);
  // ------------------------------------------ //

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    // "20250324 165553" -> "2025.03.24 16:55"
    if (!dateString || dateString.length < 14) return dateString;

    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(9, 11);
    const minute = dateString.substring(11, 13);

    return `${year}.${month}.${day} ${hour}:${minute}`;
  };

  // 일기 상세 페이지 닫기
  const handleClose = () => {
    onClose();
  };

  // ---------- 좋아요 ---------- //
  const handleLikeChange = async () => {
    try {
      const response = await diaryApi.toggleLike(currentDiary.diarySeq);

      const isLiked = response.data.message.includes('추가'); // 응답에 '추가' 단어가 있는지
      const newLikeCount = isLiked
        ? (currentDiary.likeCount || 0) + 1
        : (currentDiary.likeCount || 0) - 1;

      // 현재 일기 중 좋아요 관련 부분만 업데이트
      setCurrentDiary({
        ...currentDiary,
        hasLiked: isLiked,
        likeCount: newLikeCount,
      });
    } catch (error) {
      console.error('좋아요 실패 ⚠️♥️♥️', error);
    }
  };

  // --------- 꿈해몽 ---------- //

  useEffect(() => {
    const fetchDreamMeaning = async () => {
      if (!initialDiary.diarySeq) return;

      console.log('다이어리 시퀀스', initialDiary.diarySeq);
      setLoadingDreamMeaning(true);
      try {
        const response = await dreamApi.getDreamMeaningById(
          initialDiary.diarySeq
        );
        console.log('꿈해몽 데이터 로드됨:', response.data);

        if (response.data && response.data.data) {
          setDreamMeaning({
            resultContent: response.data.data.resultContent,
            isGood: response.data.data.isGood,
          });
        }
      } catch (error) {
        console.error('꿈해몽 데이터 로드 중 오류 발생:', error);
        setDreamMeaning({
          resultContent: '꿈해몽 데이터를 불러오는데 실패했습니다.',
          isGood: 'N',
        });
      } finally {
        setLoadingDreamMeaning(false);
      }
    };

    fetchDreamMeaning();
  }, [initialDiary.diarySeq]);

  return (
    <>
      {/* 모달 바깥 부분 */}
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[4px] z-[9999]">
        <div
          className="inset-0 absolute"
          onClick={handleClose}></div>
        {/* ------------------------------------------ 일기 조회 UI ------------------------------------------ */}

        {/* 모달컨테이너 */}
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 transform w-[70%] h-[80%] p-1 z-50">
          <ModalBase>
            {/* 삭제버튼 */}
            {/* <div className="absolute top-3 right-3">
              {isMySpace && (
                <DeleteButton
                  onDelete={onDelete}
                  isMySpace={isMySpace}
                />
              )}
            </div> */}
            {/* -------------- 닫기버튼 -------------- */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 flex items-center justify-center cursor-pointer"
              aria-label="닫기">
              <span className="text-white text-lg font-semibold leading-none">
                ×
              </span>
            </button>
            {/* ------------------------------------------ 2분할 레이아웃 컨테이너 ------------------------------------------ */}
            <div className="flex w-full h-full">
              {/* 왼쪽영역 */}
              <div className="w-1/2 h-full py-7 px-3 pl-7 overflow-y-scroll custom-scrollbar overflow-hidden">
                <div className="pr-3 flex flex-col  w-full h-full">
                  <div className="mt-2 ml-2 mb-12">
                    {/* 일기제목, 작성날짜, 공개여부 */}
                    <DetailHeader
                      title={currentDiary.title}
                      created_at={formatDate(currentDiary.createdAt)}
                      isPublic={currentDiary.isPublic === 'Y'}
                    />
                  </div>
                  <div className="w-[90%] mb-14 mx-auto flex justify-center items-center h-64">
                    {/* 영상 */}
                    <DetailVideo dream_video={currentDiary.videoUrl || null} />
                  </div>
                  {/* 태그 */}
                  <div>
                    <DiaryTags
                      initialTags={currentDiary.tags || []}
                      isEditing={false}
                      emotionName={currentDiary.emotionName}
                    />
                  </div>
                  {/* 좋아요 */}
                  <div className="h-10 flex items-center justify-end mr-2">
                    <DetailLike
                      likes={currentDiary.likeCount ?? 0}
                      likes_boolean={currentDiary.hasLiked ?? false}
                      diarySeq={currentDiary.diarySeq}
                      isMyDiary={isMySpace}
                      onLikeToggle={handleLikeChange}
                    />
                  </div>
                  {/* <div className="">
                    <DetailButtons
                      onClose={handleClose}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isMySpace={isMySpace}
                    />
                  </div> */}
                </div>
              </div>

              {/* 오른쪽 영역 - 4개의 개별 div로 구성 */}
              <div className="w-1/2 h-full py-7 px-7 overflow-y-auto custom-scrollbar">
                {/* 1. 꿈일기내용 */}
                <div className="whitespace-normal break-words mb-6 mt-6 h-40 overflow-y-auto">
                  <DetailContent content={currentDiary.content} />
                </div>

                {/* 2. 수정하기 버튼 */}
                {isMySpace && (
                  <div className="mb-6 text-right">
                    <UpdateButton
                      onEdit={onEdit}
                      isMySpace={isMySpace}
                    />
                  </div>
                )}

                {/* 3. 꿈해몽 섹션 */}
                <div className="p-4 rounded mb-6 h-40 overflow-y-auto">
                  <h3 className="text-white font-bold mb-2">꿈 해몽 🪄</h3>
                  {loadingDreamMeaning ? (
                    <p className="text-white">꿈해몽 데이터를 불러오는 중...</p>
                  ) : dreamMeaning ? (
                    <DreamMeaningView
                      resultContent={dreamMeaning.resultContent}
                      isGood={dreamMeaning.isGood}
                    />
                  ) : (
                    <p className="text-white">꿈해몽 데이터가 없습니다.</p>
                  )}
                </div>

                {/* 4. 운세보러가기 버튼 */}
                <div className="text-right">
                  {dreamMeaning && (
                    <DestinyButton isGood={dreamMeaning.isGood} />
                  )}
                </div>
              </div>
            </div>
          </ModalBase>
        </div>
      </div>
    </>
  );
};

export default DiaryDetail;
