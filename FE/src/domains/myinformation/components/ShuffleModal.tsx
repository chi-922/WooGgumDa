import React, { useState } from 'react'
import frame from "@/assets/images/smallFrame.svg"
import '../styles/MyInformationContent.css';
import { useDispatch } from 'react-redux';
import { closeShuffleModal, getNormalIcon } from '@/stores/modal/shuffleSlice';
import api from '@/apis/apiClient';
import { getRandomIcon } from '@/hooks/ProfileIcons';
import { changeIcon } from '@/stores/auth/authSlice';

// 인터페이스 정의
interface UserData {
  birthDate: string;
  iconSeq: number;
  introduction: string | null;
  nickname: string;
  userSeq: number;
  username: string;
}

interface ShuffleModalProps {
  userData: UserData | null;
  onUpdateSuccess?: () => void;
}

const ShuffleModal: React.FC<ShuffleModalProps> = ({ userData, onUpdateSuccess }) => {
    const glowingTextStyle: React.CSSProperties = {
        textShadow: '0 0 5px #9decf9, 0 0 10px #9decf9, 0 0 15px #67e8f9',
    };
    
    const dispatch = useDispatch();
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    
    // 아이콘 변경 및 API 호출하는 함수
    const updateIconToServer = async (iconSeq: number): Promise<void> => {
        if (!userData) return;

        setIsUpdating(true);

        try {
            // 서버에 직접 아이콘 변경 요청
            const response = await api.put('/users/me', {
                iconSeq: iconSeq,
                // 다른 필드는 기존 값 유지
                nickname: userData.nickname,
                birthDate: userData.birthDate.replace(/-/g, ''),
            });

            // API 호출이 성공하면 부모 컴포넌트에 알림
            if (response.data && response.data.status === 200) {
                // 부모에게 업데이트 성공을 알림 -> 즉각적인 데이터 갱신 트리거
                if (onUpdateSuccess) {
                    onUpdateSuccess();
                }
            }
        } catch (error) {
            console.error('아이콘 업데이트 실패:', error);
        } finally {
            setIsUpdating(false);
            dispatch(changeIcon(iconSeq));
            // 모달 닫기
            dispatch(closeShuffleModal());
            // 특별 아이콘 상태 초기화
            dispatch(getNormalIcon());
        }
    };
    
    const handleChange = (): void => {
        // 랜덤 아이콘 정보 가져오기
        const randomIcon = getRandomIcon();
        
        // 서버에 아이콘 변경 요청
        updateIconToServer(randomIcon.id);
    };
    
    return (
        <div className="absolute z-50 inset-0">
            {/* 검은색 배경 추가 */}
            <div className="absolute inset-0 bg-black opacity-80 z-40"></div>
            
            <img src={frame} alt="" className='relative z-50 transform top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2'/>
            <div className="absolute z-50 transform -translate-x-1/2 left-1/2 -translate-y-1/2 top-50/100 flex flex-col gap-10">
                <h1 
                className="dung-font text-3xl text-white "
                style={glowingTextStyle}
                >정말로 아이콘을 변경하실건가요?</h1>
                <div className="flex gap-5 dung-font items-center justify-center">
                    <div className="box-button w-[40%]">
                        <button
                        onClick={handleChange}
                        disabled={isUpdating}
                        className="infor-button w-[100%]">
                        {isUpdating ? '업데이트 중...' : '변경'}
                        </button>
                    </div>
                    <div className="box-button w-[40%]">
                        <button
                        onClick={() => dispatch(closeShuffleModal())}
                        className="infor-button w-[100%]">
                        닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShuffleModal;