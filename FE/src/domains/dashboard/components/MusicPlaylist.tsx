import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectDominantEmotion } from '../store/dashboardSelector';
import { selectMusicVolume } from '@/stores/music/musicSelectors';
import {
  startPlaylistMusic,
  setAsBackgroundMusic,
  changeVolume,
  stopPlaylistMusic,
  stopBackgroundMusic,
} from '@/stores/music/musicThunks';
import { MusicList } from './MusicData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBackward,
  faPlay,
  faStop,
  faForward,
  faMusic,
  faVolumeUp,
  faVolumeDown,
  faVolumeMute,
} from '@fortawesome/free-solid-svg-icons';
import 'font-awesome/css/font-awesome.min.css';
import { toast } from 'react-toastify';

interface Song {
  name: string;
  category: string;
  img: string;
  audio: string;
  duration: string;
}

// 전체 음악 목록
const flattenedMusicList: Song[] = MusicList.flatMap((category) =>
  category.tracks.map((track) => ({
    name: track.title,
    category: category.name,
    img: track.image,
    audio: track.audio,
    duration: track.duration,
  }))
);

// 감정에 따른 음악 카테고리 매핑
const emotionToCategoryMap: { [key: string]: string } = {
  행복: 'happy',
  희망: 'happy',
  평화: 'hope',
  슬픔: 'hope',
  불안: 'peace',
  분노: 'peace',
  공포: 'peace',
};

const MusicPlaylist: React.FC = () => {
  const dispatch = useDispatch();
  const dominantEmotion = useSelector(selectDominantEmotion);
  const volume = useSelector(selectMusicVolume);

  // dominantEmotion이 바뀌면 categoryToShow를 업데이트 (초기 값은 null)
  const [categoryToShow, setCategoryToShow] = useState<string | null>(null);
  // categoryToShow가 업데이트되면 displayMusicList를 초기화
  const [displayMusicList, setDisplayMusicList] = useState<Song[]>([]);

  // index는 감정 변경 시 초기화될 수 있음
  const [index, setIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('0:00');
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [localVolume, setLocalVolume] = useState<number>(volume);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const playerRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const playlistContainerRef = useRef<HTMLDivElement>(null);
  const firstRenderRef = useRef(true);
  // 이 플래그는 Redux를 통한 재생인지 로컬 audio 요소를 통한 재생인지 추적
  const usingReduxAudio = useRef(false);

  // dominantEmotion 변경 시 categoryToShow 업데이트
  useEffect(() => {
    if (dominantEmotion) {
      const newCategory = emotionToCategoryMap[dominantEmotion];
      setCategoryToShow(newCategory);
    }
  }, [dominantEmotion]);

  // categoryToShow 변경 시 displayMusicList를 초기화
  useEffect(() => {
    if (categoryToShow) {
      const filtered = flattenedMusicList.filter(
        (song) => song.category.toLowerCase() === categoryToShow
      );
      // 만약 필터링 결과가 없다면 전체 목록을 사용하거나, 원하는 방식으로 처리
      setDisplayMusicList(filtered.length > 0 ? filtered : flattenedMusicList);

      // 감정이 바뀌면 index도 초기화
      setIndex(0);
    }
  }, [categoryToShow]);

  // 컴포넌트 마운트 시 배경음악 중지, 언마운트 시 플레이리스트 음악 정지
  useEffect(() => {
    dispatch(stopBackgroundMusic() as any);
    
    return () => {
      if (usingReduxAudio.current) {
        dispatch(stopPlaylistMusic() as any);
      }
    };
  }, [dispatch]);

  // 볼륨 변경 시 playerRef.volume 업데이트
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = volume;
    }
  }, [volume]);

  // 이벤트 등록: timeupdate, ended, timeline click
  useEffect(() => {
    if (!playerRef.current || !timelineRef.current || !playheadRef.current)
      return;

    const player = playerRef.current;
    const timeline = timelineRef.current;
    
    const timeUpdateHandler = () => {
      if (!usingReduxAudio.current) {
        timeUpdate();
      }
    };
    
    const nextSongHandler = () => {
      if (!usingReduxAudio.current) {
        nextSong();
      }
    };
    
    // 타임라인 클릭 이벤트 핸들러를 수정
    const changeTimeHandler = (e: MouseEvent) => changeCurrentTime(e);
    
    player.addEventListener('timeupdate', timeUpdateHandler);
    player.addEventListener('ended', nextSongHandler);
    timeline.addEventListener('click', changeTimeHandler);

    return () => {
      player.removeEventListener('timeupdate', timeUpdateHandler);
      player.removeEventListener('ended', nextSongHandler);
      timeline.removeEventListener('click', changeTimeHandler);
    };
  }, [index, displayMusicList]);

  // index 변경 시 player 업데이트 및 목록 내 해당 항목 스크롤
  useEffect(() => {
    // 첫 렌더링은 무시
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    updatePlayer();

    if (playlistContainerRef.current) {
      const selectedElement = playlistContainerRef.current.querySelector(
        `[data-index="${index}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [index]);

  const updatePlayer = (): void => {
    if (!playerRef.current) return;
    if (displayMusicList.length === 0) return;

    // redux를 통해 재생하고 있었다면 중지
    if (usingReduxAudio.current) {
      dispatch(stopPlaylistMusic() as any);
    }

    if (isPlaying) {
      if (usingReduxAudio.current) {
        // Redux 오디오 인스턴스 사용
        dispatch(startPlaylistMusic(displayMusicList[index].audio) as any);
      } else {
        // 로컬 오디오 태그 사용
        playerRef.current.load();
        // load 후 약간의 지연 후 자동 재생
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.play()
              .catch(error => {
                console.error("재생 오류:", error);
                setIsPlaying(false);
              });
          }
        }, 100);
      }
    }
  };

  // 현재 곡을 배경음악으로 설정
  const setCurrentAsBackground = (): void => {
    if (displayMusicList.length === 0) return;
    const currentSong = displayMusicList[index];
    dispatch(setAsBackgroundMusic(currentSong.audio) as any);
    toast.success(`${currentSong.name}이(가) 배경음악으로 설정되었습니다.`, {
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'dark',
    });
  };

  // 볼륨 변경 핸들러
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    dispatch(changeVolume(newVolume) as any);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formattedSeconds =
      secs >= 10 ? secs.toString() : '0' + secs.toString();
    return `${minutes}:${formattedSeconds}`;
  };

  const timeUpdate = (): void => {
    if (!playerRef.current || !playheadRef.current || !timelineRef.current)
      return;

    const duration = playerRef.current.duration;
    // 음악이 로드되기 전에 duration이 NaN인 경우를 처리
    if (isNaN(duration)) return;
    
    const playPercent = 100 * (playerRef.current.currentTime / duration);
    playheadRef.current.style.width = `${playPercent}%`;

    setCurrentTime(formatTime(playerRef.current.currentTime));
  };

  const changeCurrentTime = (e: MouseEvent): void => {
    if (!playerRef.current || !playheadRef.current || !timelineRef.current)
      return;

    const duration = playerRef.current.duration;
    if (isNaN(duration)) return; // duration이 유효하지 않은 경우 처리
    
    // 재생 중이었는지 상태 저장
    const wasPlaying = !playerRef.current.paused;
    
    // 재생 중이었다면 일시 정지
    if (wasPlaying) {
      playerRef.current.pause();
    }
    
    // 타임라인의 정확한 위치와 너비 계산
    const timelineRect = timelineRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - timelineRect.left;
    const timelineWidth = timelineRect.width;
    
    // 클릭한 위치의 비율 계산 (0~1 사이의 값)
    const ratio = Math.max(0, Math.min(1, clickPosition / timelineWidth));
    
    // 비율에 따른 새로운 시간 계산
    const newTime = duration * ratio;
    
    // 플레이헤드 UI 업데이트
    playheadRef.current.style.width = `${ratio * 100}%`;
    
    // 실제 재생 위치 업데이트
    playerRef.current.currentTime = newTime;
    
    // 현재 시간 표시 업데이트
    setCurrentTime(formatTime(newTime));
    
    // 재생 중이었다면 짧은 지연 후에 다시 재생 시작
    if (wasPlaying) {
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.play()
            .catch(error => {
              console.error("재생 위치 이동 후 재생 오류:", error);
              setIsPlaying(false);
            });
        }
      }, 50); // 짧은 지연으로 오디오 겹침 방지
    }
  };

  const nextSong = (): void => {
    if (displayMusicList.length === 0) return;
    
    // Redux를 통한 재생인 경우 중지
    if (usingReduxAudio.current) {
      dispatch(stopPlaylistMusic() as any);
    }
    
    setIndex((prevIndex) => (prevIndex + 1) % displayMusicList.length);
  };

  const prevSong = (): void => {
    if (displayMusicList.length === 0) return;
    
    // Redux를 통한 재생인 경우 중지
    if (usingReduxAudio.current) {
      dispatch(stopPlaylistMusic() as any);
    }
    
    setIndex(
      (prevIndex) =>
        (prevIndex + displayMusicList.length - 1) % displayMusicList.length
    );
  };

  const playOrPause = (): void => {
    if (!playerRef.current || displayMusicList.length === 0) return;

    setIsPlaying(!isPlaying);

    if (!isPlaying) {
      // 재생 시작
      playerRef.current.load();
      playerRef.current.play()
        .catch(error => {
          console.error("재생 오류:", error);
          setIsPlaying(false);
        });
    } else {
      // 일시 정지
      playerRef.current.pause();
      
      // Redux를 통한 재생인 경우 중지
      if (usingReduxAudio.current) {
        dispatch(stopPlaylistMusic() as any);
      }
    }
  };

  const clickAudio = (key: number): void => {
    if (displayMusicList.length === 0) return;

    // 이미 Redux 오디오가 재생 중이면 중지
    if (usingReduxAudio.current) {
      dispatch(stopPlaylistMusic() as any);
    }
    
    setIndex(key);
    setIsPlaying(true);

    if (playerRef.current) {
      playerRef.current.load();
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.play()
            .catch(error => {
              console.error("재생 오류:", error);
              setIsPlaying(false);
            });
        }
      }, 100);
    }
  };

  const toggleVolumeSlider = (): void => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  const getVolumeIcon = ():
    | typeof faVolumeUp
    | typeof faVolumeDown
    | typeof faVolumeMute => {
    if (localVolume === 0) return faVolumeMute;
    if (localVolume < 0.5) return faVolumeDown;
    return faVolumeUp;
  };

  // guard: displayMusicList가 아직 준비되지 않았으면 로딩 처리
  if (!dominantEmotion || dominantEmotion === 'null') {
    return (
      <div className="absolute w-[110%] top-[1100%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-17">
        <div className="flex flex-col justify-center items-center max-w-[370px] py-0 px-[5px] mt-[0px] ml-[4vw] rounded-[20px] text-white font-light shadow-[0px_0px_70px_0px_#274684] bg-[#071739] overflow-hidden">
          <div className="flex items-center justify-center w-full h-[160px] text-white p-5 text-center">
            꿈이 더 많이 쌓이면,
            <br />
            그 감정에 꼭 맞는 노래를 들려줄 수 있어요.
            <br />
            <br />
            다음 이야기를 기다릴게요. 🌙
          </div>
        </div>
      </div>
    );
  } else if (displayMusicList.length === 0) {
    return <div>로딩중...</div>;
  }

  const currentSong = displayMusicList[index];
  const svgUrl =
    "data:image/svg+xml,%3Csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 56 56' style='enable-background:new 0 0 56 56;' xml:space='preserve'%3E%3Cpath style='fill:%23071739;' d='M47.799,8.201c-10.935-10.935-28.663-10.935-39.598,0c-10.935,10.935-10.935,28.663,0,39.598 c10.935,10.935,28.663,10.935,39.598,0C58.734,36.864,58.734,19.136,47.799,8.201z M32.95,32.95c-2.734,2.734-7.166,2.734-9.899,0 c-2.734-2.734-2.734-7.166,0-9.899s7.166-2.734,9.899,0S35.683,30.216,32.95,32.95z'/%3E%3Cpath style='fill:%23E7ECED;' d='M35.778,20.222c-4.296-4.296-11.261-4.296-15.556,0c-4.296,4.296-4.296,11.261,0,15.556 c4.296,4.296,11.261,4.296,15.556,0C40.074,31.482,40.074,24.518,35.778,20.222z M30.121,30.121c-1.172,1.172-3.071,1.172-4.243,0 s-1.172-3.071,0-4.243s3.071-1.172,4.243,0S31.293,28.95,30.121,30.121z'/%3E%3Cg%3E%3Cpath style='fill:%23709fdc;' d='M35.778,35.778c-0.76,0.76-1.607,1.378-2.504,1.87l8.157,14.92c2.284-1.25,4.434-2.835,6.368-4.769 c1.934-1.934,3.519-4.084,4.769-6.368l-14.92-8.157C37.157,34.172,36.538,35.018,35.778,35.778z'/%3E%3Cpath style='fill:%23709fdc;' d='M20.222,20.222c0.76-0.76,1.607-1.378,2.504-1.87l-8.157-14.92c-2.284,1.25-4.434,2.835-6.368,4.769 s-3.519,4.084-4.769,6.368l14.92,8.157C18.843,21.828,19.462,20.982,20.222,20.222z'/%3E%3C/g%3E%3C/svg%3E";

  return (
    <div className="absolute w-[110%] top-[1100%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="flex flex-col items-center max-w-[360px] h-130 py-0 px-[5px] mt-[15vh] ml-[3vw] rounded-[20px] text-white font-light shadow-[0px_0px_70px_0px_#274684] bg-[#071739] ">
        <div className="flex flex-col items-center w-[98%] h-[77%] pt-3 rounded-[20px] text-[#071739] bg-white">
          <div className="flex flex-col items-center">
          <audio 
            ref={playerRef}
            onLoadedMetadata={() => {
              if (playerRef.current) {
                setCurrentTime("0:00");
                if (playheadRef.current) {
                  playheadRef.current.style.width = "0%";
                }
                playerRef.current.volume = 0.2;
                setLocalVolume(0.2); 
              }
            }}
          >
            <source
              src={currentSong.audio}
              type="audio/ogg"
            />
            Your browser does not support the audio element.
          </audio>

          <div className="mx-auto w-[270px] flex flex-col items-center">
            <button
              onClick={setCurrentAsBackground}
              className="mb-[5px] text-[12px] flex items-center justify-center px-[17px] py-[8px] rounded-[20px] bg-[#709fdc] text-white transition-[0.2s] cursor-pointer hover:bg-[#4d7fd8]">
              <FontAwesomeIcon
                icon={faMusic}
                className="mr-[4px] text-[13px]"
              />
              배경음악으로 설정
            </button>

            <div className="w-[95%] h-[75%] overflow-hidden rounded-[20px] shadow-[0px_10px_20px_0px_rgba(39,70,132,0.7)] mt-2">
              <img
                src={currentSong.img}
                alt={currentSong.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>


          <span className="mt-[3px] text-[17px] font-bold">{currentSong.name}</span>
          <span className="text-[#709fdc]">{currentSong.category}</span>

          <div className="flex justify-between  w-[230px]">
            <div>{currentTime}</div>
            <div>{currentSong.duration}</div>
          </div>

          <div
            ref={timelineRef}
            className="relative mx-auto w-[230px] h-[5px] bg-[#709fdc] rounded-[5px] cursor-pointer hover:[&_.hover-playhead]:opacity-100">
            <div
              ref={playheadRef}
              className="relative z-[2] w-0 h-[5px] rounded-[5px] bg-[#071739]"></div>
          </div>

          <div className="mt-[1.5vh] flex items-center justify-center">
            <button
              onClick={prevSong}
              className="text-[#071739] rounded-full mr-[5px] ml-[1.8vw] text-[19px] text-center transition-[0.2s] cursor-pointer border-none bg-[transparent] focus:outline-none w-[35px] h-[35px] hover:transform hover:scale-[1.2]">
              <FontAwesomeIcon icon={faBackward} />
            </button>

            <button
              onClick={playOrPause}
              className="text-[#071739] rounded-full mx-[10px] text-[18px] text-center transition-[0.2s] cursor-pointer border border-[#e2e2e2] bg-[transparent] focus:outline-none w-[36px] h-[36px] hover:left-0 hover:shadow-[0px_0px_15px_0px_rgba(39,70,132,0.7)]">
              {isPlaying ? (
                <FontAwesomeIcon icon={faStop} />
              ) : (
                <FontAwesomeIcon icon={faPlay} />
              )}
            </button>

            <button
              onClick={nextSong}
              className="text-[#071739] rounded-full mx-[5px] text-[19px] text-center transition-[0.2s] cursor-pointer border-none bg-[transparent] focus:outline-none w-[35px] h-[35px] hover:transform hover:scale-[1.2]">
              <FontAwesomeIcon icon={faForward} />
            </button>

            <button
              onClick={toggleVolumeSlider}
              className="text-[#071739] rounded-full mr-[1px] text-[19px] text-center transition-[0.2s] cursor-pointer border-none bg-[transparent] focus:outline-none w-[30px] h-[30px] hover:transform hover:scale-[1.1]">
              <FontAwesomeIcon icon={getVolumeIcon()} />
            </button>

            {showVolumeSlider && (
              <div className="flex items-center w-[5vw] ml-[0.2vw]">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={localVolume}
                  onChange={handleVolumeChange}
                  className="w-full h-[4px] bg-[#709fdc] rounded-[5px] appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[10px] [&::-webkit-slider-thumb]:h-[10px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#071739] [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            )}
          </div>
          </div>
        </div>

        <div
          ref={playlistContainerRef}
          className="flex flex-col p-[8px] h-[160px] overflow-y-scroll [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:bg-white [&::-webkit-scrollbar-thumb]:rounded-[5px] [&::-webkit-scrollbar-track]:bg-[#071739]">
          {displayMusicList.map((music, key) => (
            <div
              key={key}
              data-index={key}
              className={`
                flex items-center mb-[8px] rounded-[10px] border border-transparent transition-[0.3s] cursor-pointer
                hover:bg-[#274684] hover:border-[#274684] hover:relative
                ${index === key && isPlaying ? `bg-[#274684] shadow-[0px_0px_15px_0px_#274684] relative after:content-[''] after:block after:absolute after:left-[15px] after:w-[55px] after:h-[57px] after:rounded-[10px] after:text-[16px] after:animate-[play_2s_linear_infinite] after:bg-[url("${svgUrl}")]` : index === key ? 'bg-[#274684] shadow-[0px_0px_15px_0px_#274684]' : ''}
              `}>
              <div
                className="flex flex-1 items-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  clickAudio(key);
                }}>
                <img
                  className={`w-[78px] rounded-[10px] ${index === key && !isPlaying ? 'opacity-[70%]' : ''}`}
                  src={music.img}
                  alt={music.name}
                />
                <div className="ml-[15px] flex flex-col min-w-[187px]">
                  <span className="text-[17px] mt-[8px]">{music.name}</span>
                  <span className="mt-[3px] font-[300] text-[#709fdc]">
                    {music.category}
                  </span>
                </div>
                <span className="min-w-[40px] ml-[7px] mr-[9px] font-[500]">
                  {music.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicPlaylist;
