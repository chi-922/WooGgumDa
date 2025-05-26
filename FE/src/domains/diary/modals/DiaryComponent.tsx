import React, { useEffect, useState } from 'react';

import DiaryHeader from '@/domains/diary/components/create_edit/DiaryHeader';
import DiaryInput from '@/domains/diary/components/create_edit/DiaryInput';
import DiaryDisclose from '@/domains/diary/components/create_edit/DiaryDisclose';
import DiaryCreateButton from '@/domains/diary/components/create_edit/DiaryCreateButton';

import StarTag from '@/domains/diary/components/create_edit/StarTag';
import { diaryApi } from '@/domains/diary/api/diaryApi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import {
  addDiary,
  setCurrentDiary,
  updateDiary,
} from '@/stores/diary/diarySlice';
import {
  DiaryCreateUpdateRequest,
  DiaryData,
} from '@/domains/diary/Types/diary.types';
import { videoApi } from '@/domains/diary/api/videoApi';
import ModalBase from '@/domains/diary/components/modalBase';
import DiaryTags from '@/domains/diary/components/create_edit/DiaryTags';
import { dreamApi } from '@/domains/diary/api/dreamApi';
import { toast } from 'react-toastify';
import api from '@/apis/apiClient';

interface DiaryComponentProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEditing?: boolean;
  diaryData?: DiaryData;
  onDiaryCreated?: (responseData: any) => void;
  onDiaryUpdated?: (data: any) => void;
  // isMySpace?: boolean;
  onDeleteDiary?: () => void;
}

const DiaryComponent: React.FC<DiaryComponentProps> = ({
  isOpen,
  onClose,
  isEditing = false,
  diaryData,
  onDiaryCreated,
  onDiaryUpdated,
  // isMySpace = true,
  onDeleteDiary,
}) => {
  // 리덕스 관련 설정
  const dispatch = useDispatch();
  const { currentDiary } = useSelector((state: RootState) => state.diary);

  // 상태 관리
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [emotion, setEmotion] = useState<string>(''); // 감정태그
  const [isSaving, setIsSaving] = useState<boolean>(false); // 저장 중 상태 추가

  // 수정모드에서 데이터 불러오기
  useEffect(() => {
    if (isEditing && diaryData) {
      setTitle(diaryData.title);
      setContent(diaryData.content);

      // tags 데이터 변환 - 객체 배열인 경우 문자열 배열로 변환
      const initialTags = diaryData?.tags || [];
      const stringTags = initialTags.map((tag) =>
        typeof tag === 'string' ? tag : tag.name
      );
      setTags(stringTags);

      setIsPublic(diaryData.isPublic === 'Y');
      setEmotion(diaryData.emotionName || diaryData.mainEmotion || '');

      // 리덕스에 현재 편집중인 일기 설정
      dispatch(setCurrentDiary(diaryData));
    }
  }, [isEditing, diaryData, dispatch]);

  // 일기 저장 함수
  const handleSave = async () => {
    // 이미 저장 중이면 중복 실행 방지
    if (isSaving) return;

    // 저장 시작 상태로 변경
    setIsSaving(true);

    // 수정 시 감정 태그가 비어있으면 기존 값 사용
    const finalEmotion =
      isEditing && !emotion && diaryData ? diaryData.mainEmotion : emotion;

    // 백에 넘길 데이터
    const diaryToSave: DiaryCreateUpdateRequest = {
      title,
      content,
      dreamDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      isPublic: isPublic ? 'Y' : 'N',
      mainEmotion: finalEmotion || '', // 빈 문자열 대신 적절한 기본값 설정 필요할 수 있음
      tags: tags,
    };

    try {
      if (isEditing && diaryData?.diarySeq) {
        // 수정모드
        const response = await diaryApi.updateDiary(
          diaryData.diarySeq,
          diaryToSave
        );

        // 리덕스 스토어 업데이트
        dispatch(updateDiary(response.data.data));

        // 내용이 변경된 경우에만 꿈해몽 api 요청
        if (content !== diaryData.content) {
          try {
            await dreamApi.createDreamMeaning(diaryData.diarySeq, content);
          } catch (dreamError) {
            console.error('꿈해몽 생성 중 오류:', dreamError);
            // 꿈해몽 오류는 사용자 경험에 핵심적이지 않을 수 있으므로 토스트 메시지만 표시
            toast.warning('꿈해몽 생성 중 문제가 발생했습니다.', {
              // position: 'bottom-right',
              autoClose: 3000,
            });
          }
        }

        if (onDiaryUpdated) {
          onDiaryUpdated(response.data);
        }

        toast.success('일기가 성공적으로 수정되었습니다.', {
          // position: 'bottom-right',
          autoClose: 2000,
        });

        // 모든 처리가 완료된 후 모달 닫기
        if (onClose) {
          onClose();
        }
      } else {
        // 생성 모드
        const response = await diaryApi.createDiary(diaryToSave);
        const diarySeq = response.data.data.diarySeq;

        // 리덕스 스토어에 추가
        dispatch(addDiary(response.data.data));

        // 영상 생성 및 꿈해몽 API 요청을 동시에 실행하되 모두 완료될 때까지 기다림
        const escapeSpecialCharsForVideo = (text: string) => {
          return text
            .split('')
            .map((char) => {
              if (char === '\\') return '/\\';
              return /[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s]/.test(char)
                ? char
                : `/${char}`;
            })
            .join('');
        };

        const escapedContent = escapeSpecialCharsForVideo(content);

        // Promise.allSettled로 모든 API 요청이 완료되기를 기다림
        // await Promise.allSettled([
        //   videoApi.createVideo({
        //     diary_pk: diarySeq,
        //     content: escapedContent,
        //   }),
        //   dreamApi.createDreamMeaning(diarySeq, content),
        // ]);

        // 성공 시 onDiaryCreated 콜백 호출
        if (onDiaryCreated) {
          onDiaryCreated(response.data);
        }

        toast.success('일기가 성공적으로 저장되었습니다.', {
          // position: 'bottom-right',
          autoClose: 2000,
        });

        // 모든 처리가 완료된 후 모달 닫기
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      const err = error as any;

      // 에러 응답 확인
      if (err.response && err.response.status === 400) {
        toast.info('태그는 한글, 영문, 숫자만 사용 가능합니다.', {
          // position: 'top-right',
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'dark',
        });
      } else {
        toast.error('일기 저장에 실패했습니다. 다시 시도해주세요.', {
          // position: 'top-right',
          autoClose: 3000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'dark',
        });
        console.error('일기 저장 오류:', error);
      }
    } finally {
      // 저장 작업이 완료되면 상태 업데이트
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 backdrop-blur-[4px] bg-black/50"
      onClick={onClose}>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[80%] rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <ModalBase>
          <div className="w-full h-full py-8 px-4 pl-8 overflow-y-scroll custom-scrollbar">
            <div className="pr-3 flex flex-col gap-5">
              <DiaryHeader
                onClose={onClose ? onClose : () => {}}
                isEditing={isEditing}
              />
            </div>

            <div>
              <DiaryInput
                title={title}
                content={content}
                onTitleChange={setTitle}
                onContentChange={setContent}
              />
            </div>

            {/* 별자리를 이어줄 감정태그 */}
            <div className="mt-3">
              <h2 className="text-white text-base font-semibold mb-1">
                감정 태그
              </h2>
              <StarTag
                onSelect={setEmotion}
                initialEmotion={
                  diaryData?.emotionName || diaryData?.mainEmotion || ''
                }
              />
            </div>

            {/* 태그 */}
            <div className="mt-3">
              <DiaryTags
                initialTags={diaryData?.tags || []}
                isEditing={true}
                onTagsChange={setTags}
                emotionName={emotion}
              />
            </div>

            <div>
              <DiaryDisclose
                isPublic={isPublic}
                onToggle={setIsPublic}
              />
            </div>

            <div>
              <DiaryCreateButton
                onCreate={handleSave}
                isEditing={isEditing}
                onDelete={isEditing ? onDeleteDiary : undefined}
                isLoading={isSaving} // 로딩 상태 전달
              />
            </div>
          </div>
        </ModalBase>
      </div>
    </div>
  );
};

export default DiaryComponent;
