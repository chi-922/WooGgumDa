import React from 'react'
import frame from "@/assets/images/smallFrame.svg"
import '../styles/MyInformationContent.css';
import { useDispatch } from 'react-redux';
import { closeModal } from '@/stores/modal/modalSlice';
import api from '@/apis/apiClient';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '@/stores/auth/authSlice';


const WithDrawModal = () => {
    const glowingTextStyle: React.CSSProperties = {
        textShadow: '0 0 5px #9decf9, 0 0 10px #9decf9, 0 0 15px #67e8f9',
    };
    const nav = useNavigate();

    const handleWithdraw = async() => {
        try{
            const response = await api.delete('/users/me')
        } catch{
            alert("회원탈퇴 실패");
        } finally{
            dispatch(closeModal());
            dispatch(clearAuth());
        }
    }
    
    const dispatch = useDispatch();
    
    return (
        <div className="absolute z-50 inset-0">
            {/* 검은색 배경 추가 */}
            <div className="absolute inset-0 bg-black opacity-80 z-40"></div>
            
            <img src={frame} alt="" className='relative z-50 transform top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2'/>
            <div className="absolute z-50 transform -translate-x-1/2 left-1/2 -translate-y-1/2 top-50/100 flex flex-col gap-10">
                <h1 
                className="dung-font text-3xl text-white "
                style={glowingTextStyle}
                >정말로 탈퇴 하실건가요?</h1>
                <div className="flex gap-5 dung-font items-center justify-center">
                    <div className="box-button w-[40%]">
                        <button
                        onClick={handleWithdraw}
                        className="infor-button w-[100%]">
                        탈퇴
                        </button>
                    </div>
                    <div className="box-button w-[40%]">
                        <button
                        onClick={() => dispatch(closeModal())}
                        className="infor-button w-[100%]">
                        닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WithDrawModal