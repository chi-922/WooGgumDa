import React from 'react';
import { getIconById } from '@/hooks/ProfileIcons';
import ButtonBase from '@/domains/diary/components/details/button/ButtonBase';
import RedButtonBase from '@/domains/diary/components/create_edit/RedButtonBase';

// 사용자 데이터 타입 정의
interface User {
  userSeq?: number;
  subscribedSeq?: number;
  username?: string;
  nickname: string;
  iconSeq: number;
  birthDate?: string;
  introduction?: string | null;
  isSubscribed?: boolean;
}

interface UserListProps {
  data: User[];
  onSubscribe: (userSeq: number) => void;
  onUnsubscribe: (subscribedSeq: number) => void;
  onVisit: (userSeq: number) => void;
}

const UserList: React.FC<UserListProps> = ({
  data,
  onSubscribe,
  onUnsubscribe,
  onVisit,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-white text-center py-4">검색 결과가 없습니다.</div>
    );
  }

  return (
    <div className="flex flex-col gap-5 mt-4">
      {data.map((user) => {
        // userSeq나 subscribedSeq 중 하나를 키로 사용
        const key = user.subscribedSeq || user.userSeq || Math.random();
        // subscribedSeq가 있으면 이미 구독 중인 사용자(친구)
        const isSubscribed = !!user.subscribedSeq || user.isSubscribed;
        // 방문할 사용자 ID (친구인 경우 subscribedSeq, 검색 결과인 경우 userSeq)
        const visitId = user.userSeq || user.subscribedSeq;

        return (
          <div
            key={key}
            className="border border-white/90 border-dashed rounded-lg flex px-15 py-5 gap-5 justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center overflow-hidden">
                <img
                  src={getIconById(user.iconSeq)}
                  className="w-full h-full object-contain"
                  alt={`${user.nickname}의 프로필 아이콘`}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/default-icon.png'; // Fallback image
                  }}
                />
              </div>
              <p className="text-white text-[17px]">{user.nickname}</p>
              {user.username && (
                <span className="text-white/70 text-sm">({user.username})</span>
              )}
            </div>

            <div className="flex gap-3 text-white outline:none">
              {isSubscribed ? (
                // 이미 구독 중인 경우 - 구독취소 버튼

                <RedButtonBase
                  onClick={() =>
                    user.subscribedSeq && onUnsubscribe(user.subscribedSeq)
                  }
                  width="107px"
                  height="36px"
                  borderRadius="8px">
                  구독취소
                </RedButtonBase>
              ) : (
                // 구독 중이 아닌 경우 - 구독하기 버튼
                <ButtonBase
                  onClick={() => user.userSeq && onSubscribe(user.userSeq)}
                  width="107px"
                  height="36px"
                  borderRadius="8px">
                  구독하기
                </ButtonBase>
              )}

              <ButtonBase
                onClick={() => visitId && onVisit(visitId)}
                width="107px"
                height="36px"
                borderRadius="8px">
                놀러가기
              </ButtonBase>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
