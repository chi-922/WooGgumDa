import React, { useEffect, useRef, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import { IoMdMail, IoMdMailOpen } from 'react-icons/io';
import { useAppDispatch } from '@/hooks/hooks';
import { useSelector } from 'react-redux';
import {
  fetchAlarms,
  readAlarm,
  deleteAllAlarms,
  readAllAlarms,
  deleteAlarm,
} from './stores/alarmThunks';
import {
  selectAlarms,
  selectLoading,
  selectHasMore,
} from './stores/alarmSelectors';
import { Alarm } from './stores/alarmTypes';
import './themes/alarm.css';
import { BsTrash3Fill } from 'react-icons/bs';
import { resetPage, resetAlarms } from './stores/alarmSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { showDiaryModal } from '@/stores/diary/diarySlice';
import { showGuestbookModal } from '@/stores/guestbook/guestbookSlice';
import { selectUser } from '@/stores/auth/authSelectors';
import { setAlarmFalse } from '@/stores/auth/authSlice';

interface AlarmProps {
  isOpen: boolean;
  onClose: () => void;
}

const AlarmList: React.FC<AlarmProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const alarms = useSelector(selectAlarms);
  const loading = useSelector(selectLoading);
  const hasMore = useSelector(selectHasMore);
  const params = useParams();
  const loginUser = useSelector(selectUser);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastAlarmRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          dispatch(fetchAlarms());
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, dispatch]
  );

  useEffect(() => {
    dispatch(fetchAlarms());
  }, [dispatch]);

  // 알림 하나 클릭
  const handleAlarmClick = (alarm: Alarm) => {
    if (alarm.isRead === 'N') {
      dispatch(readAlarm(alarm.alarmSeq));
    }
    // 알림 타입에 따라 다른 모달 표시
    if (alarm.type === 'GUESTBOOK_CREATED') {
      if (params.username !== loginUser?.username) {
        navigate(`/${loginUser?.username}`);
        dispatch(showGuestbookModal());
      } else {
        // 방명록 모달 표시
        dispatch(showGuestbookModal());
      }
    } else if (alarm.diarySeq) {
      // 일기 상세 모달을 띄우기 위해 diarySeq를 localStorage에 저장하고 Redux 상태 업데이트
      localStorage.setItem('selectedDiarySeq', alarm.diarySeq.toString());
      navigate(`/${loginUser?.username}`);
      dispatch(showDiaryModal(alarm.diarySeq));
    }

    onClose();
    dispatch(resetPage());
    dispatch(resetAlarms());
  };

  // 알림 하나 읽기
  const handleReadAlarm = (alarm: Alarm) => {
    dispatch(readAlarm(alarm.alarmSeq));
  };

  // 알림 하나 삭제
  const handleDeleteAlarm = (alarm: Alarm) => {
    dispatch(deleteAlarm(alarm.alarmSeq));
  };

  // 알림 전체 삭제
  const handleDeleteAllAlarms = () => {
    dispatch(deleteAllAlarms());
    // localStorage.setItem('alarmExistence', 'N');
    dispatch(setAlarmFalse());
  };

  // 알림 전체 읽음
  const handleReadAllAlarms = () => {
    dispatch(readAllAlarms());
    dispatch(setAlarmFalse());
  };

  return (
    <div className="absolute inset-0">
      {/* 모달 배경 */}
      <div className="absolute w-[30%] h-80 rounded-lg py-6 px-6 top-[60px] left-7/12 bg-[#6E6E6E]/90 z-25 flex flex-col items-center">
        {/* 닫기버튼 */}
        <div
          className="absolute z-40 top-[2%] right-[1%] cursor-pointer"
          onClick={onClose}>
          <IoClose className="text-white text-3xl" />
        </div>
        <div className="w-full h-full flex flex-col gap-3 overflow-hidden">
          <div className="pb-2 px-4 sticky top-0 flex justify-between items-center h-[50px]">
            <p className="text-white font-semibold text-[24px]">알림</p>
            <div className="flex gap-4">
              <button
                onClick={handleReadAllAlarms}
                className="mt-2 w-[80px] h-[25px] bg-white/50 text-white rounded-[6px] text-sm cursor-pointer hover:bg-white/70 transition-colors">
                전체 읽음
              </button>
              <button
                onClick={handleDeleteAllAlarms}
                className="mt-2 w-[80px] h-[25px] bg-white/50 text-white rounded-[6px] text-sm cursor-pointer hover:bg-white/70 transition-colors">
                전체 삭제
              </button>
            </div>
          </div>
          <div
            id="need-scrool"
            className="overflow-y-auto">
            {alarms.map((alarm, index) => (
              <div
                key={alarm.alarmSeq}
                ref={index === alarms.length - 1 ? lastAlarmRef : null}
                className={`p-4 text-white border-b border-gray-300 flex items-center justify-between ${alarm.isRead === 'N' ? 'font-bold' : 'text-white/50'}`}>
                <div
                  onClick={() => handleAlarmClick(alarm)}
                  className="relative group overflow-hidden w-[75%] text-lg cursor-pointer">
                  <span className="block truncate group-hover:hidden">
                    {alarm.content}
                  </span>
                  <span className="whitespace-nowrap hidden group-hover:block animate-marquee">
                    {alarm.content}
                  </span>
                </div>
                {/* 아이콘 부분 */}
                <div className="flex justify-center items-center gap-4">
                  {alarm.isRead === 'N' ? (
                    <IoMdMail
                      onClick={() => handleReadAlarm(alarm)}
                      className="w-5 h-5 cursor-pointer"
                    />
                  ) : (
                    <IoMdMailOpen className="w-5 h-5 cursor-pointer" />
                  )}
                  <BsTrash3Fill
                    onClick={() => handleDeleteAlarm(alarm)}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlarmList;
