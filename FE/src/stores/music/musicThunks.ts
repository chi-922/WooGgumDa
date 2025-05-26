import {
  setAudioLoaded,
  setVolume,
  toggleMusic,
  setCustomBackgroundTrack,
  setPlaylistPlaying,
  resetBackgroundMusic
} from '@/stores/music/musicSlice';
import { AppDispatch, RootState } from '@/stores/store';

// 배경음악용 오디오 인스턴스
const backgroundAudioInstance = new Audio();
// 플레이리스트용 오디오 인스턴스
const playlistAudioInstance = new Audio();

// 음악 설정을 로컬 스토리지에 저장하는 함수
const saveMusicSettings = (isPlaying: boolean, volume: number, customBackgroundTrack: string | null): void => {
  try {
    localStorage.setItem(
      'musicSettings',
      JSON.stringify({ isPlaying, volume, customBackgroundTrack })
    );
  } catch (error) {
    
  }
};

export const initializeAudio =
  (audioSrc?: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      // 기존 오디오 정지
      backgroundAudioInstance.pause();

      const state = getState().music;

     // 사용자 정의 배경음악이 있으면 사용, 없으면 기본 배경음악 또는 인자로 받은 소스 사용
     const actualSrc = audioSrc || state.customBackgroundTrack || state.defaultBackgroundTrack;

     // 새 오디오 소스 설정
     backgroundAudioInstance.src = actualSrc;
     backgroundAudioInstance.loop = true; // 반복 재생 설정

     // 저장된 볼륨 설정 적용
     backgroundAudioInstance.volume = state.volume;

     // 오디오 데이터 로드 시작
     backgroundAudioInstance.load();

     // 로드 상태 업데이트
     dispatch(setAudioLoaded(true));

     // canplaythrough 이벤트: 오디오 충분히 로드되어 끊김 없이 재생 가능할 때
     backgroundAudioInstance.addEventListener('canplaythrough', () => {
       

       // 상태가 '재생 중'이면서 플레이리스트가 재생 중이 아니면 자동으로 재생 시작
       if (state.isPlaying && !state.isPlaylistPlaying) {
         try {
           // 자동 재생 시도
           const playPromise = backgroundAudioInstance.play();

           // play()는 Promise를 반환하며, 자동 재생 정책으로 실패할 수 있음
           if (playPromise !== undefined) {
             playPromise.catch((error) => {
               
               // 설정 저장 시 현재 상태 반영
               saveMusicSettings(false, state.volume, state.customBackgroundTrack);
             });
           }
         } catch (error) {
           
         }
       }
     });

     // 오류 발생 시 처리
     backgroundAudioInstance.addEventListener('error', () => {
       
       dispatch(setAudioLoaded(false));
     });

      return true;
    } catch (error) {
      
      dispatch(setAudioLoaded(false));
      return false;
    }
  };

// --------------------------음악 재생/일시정지 토글 함수--------------------------//

export const togglePlayback =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    // 리덕스 상태 토글 (재생 <-> 일시정지)
    dispatch(toggleMusic());

    // 토글 후의 상태 가져오기
    const state = getState().music;
    const willBePlaying = state.isPlaying;

    try {
      if (willBePlaying) {
        // 재생 명령
        const playPromise = backgroundAudioInstance.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            
            // 실패 시 상태 다시 업데이트
            // dispatch(setIsPlaying(false));
            saveMusicSettings(false, state.volume ,state.customBackgroundTrack);
          });
        }
      } else {
        // 일시정지 명령
        backgroundAudioInstance.pause();
      }

      // 변경된 설정 저장
      saveMusicSettings(willBePlaying, state.volume ,state.customBackgroundTrack);
    } catch (error) {
      

      // 실제 오디오 상태와 리덕스 상태 동기화
      const actuallyPlaying = !backgroundAudioInstance.paused;
      saveMusicSettings(actuallyPlaying, state.volume ,state.customBackgroundTrack);
    }
  };

// --------------------- 볼륨 변경 함수 --------------------------- //
export const changeVolume =
  (volume: number) => (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      // 오디오 볼륨 설정
      backgroundAudioInstance.volume = volume;
      playlistAudioInstance.volume = volume;

      // 리덕스 상태 업데이트
      dispatch(setVolume(volume));

      // 변경된 설정 저장
      const state = getState().music;
      saveMusicSettings(state.isPlaying, volume, state.customBackgroundTrack);
    } catch (error) {
      
    }
  };

// --------------------- 플레이리스트 재생 시작 함수  --------------------------- //
export const startPlaylistMusic =
(playlistSrc: string) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {

    // 플레이리스트 음악 설정 및 재생
    playlistAudioInstance.src = playlistSrc;
    playlistAudioInstance.volume = getState().music.volume;
    
    // 플레이리스트 로드
    playlistAudioInstance.load();
    
    // 플레이리스트 재생 상태 설정
    dispatch(setPlaylistPlaying(true));
    
    // 플레이리스트 재생
    const playPromise = playlistAudioInstance.play();
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {

        dispatch(setPlaylistPlaying(false));
      });
    }
    
    return true;
  } catch (error) {

    return false;
  }
};

// --------------------- 플레이리스트 재생 종료 함수 --------------------------- //
export const stopPlaylistMusic =
() => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // 플레이리스트 음악 정지
    playlistAudioInstance.pause();
    
    // 플레이리스트 재생 상태 해제
    dispatch(setPlaylistPlaying(false));
    
    return true;
  } catch (error) {
    // console.error('플레이리스트 재생 종료 중 오류 발생:', error);
    return false;
  }
};

// --------------------- 배경음악 정지 함수 --------------------------- //
export const stopBackgroundMusic =
() => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // 플레이리스트 음악 정지
    backgroundAudioInstance.pause();
    
    
    return true;
  } catch (error) {
    return false;
  }
};


// --------------------- 현재 플레이리스트 음악을 배경음악으로 설정하는 함수 --------------------------- //
export const setAsBackgroundMusic =
(trackSrc: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // 사용자 정의 배경음악 경로 설정
    dispatch(setCustomBackgroundTrack(trackSrc));
    
    // 설정 저장
    const state = getState().music;
    saveMusicSettings(state.isPlaying, state.volume, trackSrc);
    
    // 현재 배경음악 업데이트 (플레이리스트 음악이 재생 중이 아닐 경우에만)
    // if (!state.isPlaylistPlaying) {
    //   dispatch(initializeAudio(trackSrc));
    // }
    
    return true;
  } catch (error) {
   
    return false;
  }
};


// --------------------- 로그인 시 배경음악 초기화 함수 --------------------------- //
export const resetMusicOnLogin =
() => (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    // 사용자 정의 배경음악 초기화
    dispatch(resetBackgroundMusic());
    
    // 설정 저장 (기본값으로)
    const state = getState().music;
    saveMusicSettings(state.isPlaying, state.volume, null);
    
    // 기본 배경음악으로 초기화
    dispatch(initializeAudio(state.defaultBackgroundTrack));
    
    return true;
  } catch (error) {
    
    return false;
  }
};