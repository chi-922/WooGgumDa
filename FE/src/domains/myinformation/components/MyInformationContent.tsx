import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MyInformationContent.css';
import LeftProfileSection from './LeftProfileSection';
import RightProfileSection from './RightProfileSection';
import { IoClose } from 'react-icons/io5';
import exampleProfile from '@/assets/images/exampleProfile.svg';
import information_bg from '@/assets/images/information_bg.svg';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '@/stores/auth/authSelectors';
import api from '@/apis/apiClient';
import { UseSelector } from 'react-redux';
import { closeModal } from '@/stores/modal/modalSlice';
import WithDrawModal from './WithDrawModal';
import ShuffleModal from './ShuffleModal'; // ShuffleModal 컴포넌트 import

const MyInformationContent: React.FC = () => {
  const glowingTextStyle: React.CSSProperties = {
    textShadow: '0 0 5px #9decf9, 0 0 10px #9decf9, 0 0 15px #67e8f9',
  };

  const user = useSelector(selectUser);
  const { isOpen } = useSelector(state => state.modal);
  const { isShuffle } = useSelector(state => state.shuffle); // shuffle 상태 추가
  const dispatch = useDispatch();

  const [userdata, setUserData] = useState(null);

  const refreshUserData = useCallback(async () => {
    try {
      const response = await api.get('/users/me');
      const data = response.data;

      setUserData(data.data);
    } catch (error) {

    }
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const nav = useNavigate();
  const onClickHome = () => {
    nav('/');
  };

  //   const [showPassword, setShowPassword] = useState(false);

  const userData = userdata;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-50 z-20"></div>
      <img
        src={information_bg}
        alt=""
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-300 animate-pulse"
      />
      <div className="absolute z-31 top-1/5 left-1/2 transform -translate-x-1/2 -translate-y-1/5">
        <h1
          className="text-white text-[28px]  press-font"
          style={glowingTextStyle}>
          Update Profile
        </h1>
      </div>
      {/* LeftProfileSection과 RightProfileSection이 들어갈 자리 */}
      <div className="flex absolute z-32 top-19/32 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-250 h-100 items-center">
        <LeftProfileSection
          userData={userData}
          onUpdateSuccess={refreshUserData}
        />
        <RightProfileSection userData={userData} />

        {/*오른쪽 영역끝 */}
      </div>
      {isOpen && (
        <WithDrawModal/>
      )}
      
      {/* ShuffleModal 조건부 렌더링 추가 */}
      {isShuffle && (
        <ShuffleModal 
          userData={userData} 
          onUpdateSuccess={refreshUserData} 
        />
      )}

    </div>
  );
};

export default MyInformationContent;