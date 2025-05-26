import RedButtonBase from '@/domains/diary/components/create_edit/RedButtonBase';
import ButtonBase from '@/domains/diary/components/details/button/ButtonBase';
import React from 'react';

interface DiaryCreateButtonProps {
  onCreate?: () => void;
  isEditing: boolean;
  onDelete?: () => void;
  isLoading?: boolean; // 로딩 상태 속성 추가
}

const DiaryCreateButton: React.FC<DiaryCreateButtonProps> = ({
  onCreate,
  isEditing = false,
  onDelete,
  isLoading = false, // 기본값 설정
}) => {
  return (
    <div className="w-full flex flex-col gap-3">
      {isEditing ? (
        <>
          <ButtonBase
            onClick={onCreate}
            borderRadius="6px"
            disabled={isLoading} // 로딩 중일 때 버튼 비활성화
            className={isLoading ? "opacity-70 cursor-not-allowed" : ""} // 로딩 상태 스타일
          >
            {isLoading ? "저장 중..." : "수정완료"}
          </ButtonBase>

          {onDelete && (
            <RedButtonBase
              onClick={() => {
                if (!isLoading && window.confirm('정말로 이 일기를 삭제하시겠습니까?')) {
                  onDelete();
                }
              }}
              borderRadius="6px"
              disabled={isLoading} // 로딩 중일 때 버튼 비활성화
              className={isLoading ? "opacity-70 cursor-not-allowed" : ""} // 로딩 상태 스타일
            >
              삭제하기
            </RedButtonBase>
          )}
        </>
      ) : (
        <ButtonBase
          onClick={onCreate}
          borderRadius="6px"
          height="46px"
          disabled={isLoading} // 로딩 중일 때 버튼 비활성화
          className={isLoading ? "opacity-70 cursor-not-allowed" : ""} // 로딩 상태 스타일
        >
          {isLoading ? "저장 중..." : "꿈 일기 등록하기"}
        </ButtonBase>
      )}
    </div>
  );
};

export default DiaryCreateButton;