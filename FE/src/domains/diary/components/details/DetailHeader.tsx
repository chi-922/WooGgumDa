import React from 'react';
import '../../styles/DetailHeader.css';

interface DetailHeaderProps {
  title: string;
  created_at: string;
  isPublic: boolean;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
  title,
  created_at,
  isPublic,
}) => {
  return (
    <div className="flex flex-nowrap w-full items-center justify-between">
      <div className="flex flex-col">
        {/* 제목 */}
        <h1 className="text-white text-lg font-semibold">{title}</h1>
        {/* 날짜 */}
        <p className="text-[#FFFFFF]70 text-sm">{created_at}</p>
      </div>

      {/* 공개/비공개 상태 표시 */}
      <div className="text-sm">{isPublic ? '공개' : '비공개'}</div>

    </div>
  );
};

export default DetailHeader;
