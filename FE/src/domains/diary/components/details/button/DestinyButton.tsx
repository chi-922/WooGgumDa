// 꿈해몽 결과에 따라 이동하는 버튼

import ButtonBase from '@/domains/diary/components/details/button/ButtonBase';
import { useNavigate } from 'react-router-dom';
interface DestinyButtonProps {
  isGood: string;
  onClick?: () => void;
}

const DestinyButton: React.FC<DestinyButtonProps> = ({ isGood, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }

    // 결과에 따라 페이지 이동
    if (isGood === 'Y') {
      //이 localstorage도 닫기버튼 눌렀을 때 메인페이지로 가게 할 거라 참고 부탁드립니다.!
      localStorage.setItem('FromDiary', 'goUniverse');
      navigate('/luckynumber');
    } else {
      localStorage.setItem('FromDiary', 'goUniverse');
      navigate('/todayfortune');
    }
  };

  // 버튼 내 텍스트
  const buttonText =
    isGood === 'Y' ? '행운번호 보러가기' : '오늘의 운세 보러가기';

  return (
    <ButtonBase
      onClick={handleClick}
      className="text-[15px]"
      width="200px">
      {buttonText}
    </ButtonBase>
  );
};

export default DestinyButton;
