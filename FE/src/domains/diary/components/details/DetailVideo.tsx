import miroVideo from '@/assets/video/miro-video.mp4';
import ButtonBase from '@/domains/diary/components/details/button/ButtonBase';
interface DiaryDetailProps {
  dream_video?: string | null;
  onVideoRetry?: () => void;
  isVideoGenerating?: boolean;
  isPendingVideo?: boolean;
  isMySpace?: boolean;
}

const DetailVideo: React.FC<DiaryDetailProps> = ({
  dream_video,
  onVideoRetry,
  isVideoGenerating,
  isPendingVideo,
  isMySpace = false,
}) => {
  // const videoSrc = dream_video || miroVideo;

  if (isPendingVideo) {
    return (
      <div className="w-full h-64 bg-gradient-to-t from-indigo-900 to-black rounded-lg flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 3}px`,
                height: `${Math.random() * 3}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random(),
                animation: `twinkle ${3 + Math.random() * 7}s linear infinite`
              }}
            ></div>
          ))}
        </div>
        <div className="text-center z-10">
          <div className="text-white text-lg mb-2">✨ 꿈을 영상으로 만드는 중</div>
          <div className="text-blue-200 text-sm">잠시만 기다려주세요</div>
        </div>
      </div>
    );
  }

  return (
    // 삭제 금지!!!!!!!!!!!! 임시 비디오 연결 코드
    // <div className="w-full h-auto flex flex-col items-center">
    //   <video
    //     src={videoSrc}
    //     controls
    //     className="w-full rounded-lg shadow-md"
    //   />
    //   {!dream_video && (
    //     <ButtonBase
    //       onClick={onVideoRetry}
    //       disabled={isVideoGenerating}
    //       className={`mt-4 ${isVideoGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}>
    //       {isVideoGenerating ? '생성 중...' : '영상 다시 생성'}
    //     </ButtonBase>
    //   )}
    // </div>

    // 임시 비디오가 아니라 생성 안되면 재생성 버튼 띄우는거
    <div className="w-full h-auto flex flex-col items-center">
      {dream_video ? (
        <video
          src={dream_video}
          controls
          className="w-full rounded-lg shadow-md"
        />
      ) : (
        isMySpace && (
          <ButtonBase
            onClick={onVideoRetry}
            disabled={isVideoGenerating}
            className={` ${isVideoGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isVideoGenerating ? '생성 중...' : '영상 다시 생성'}
          </ButtonBase>
        )
      )}
    </div>
  );
};

export default DetailVideo;
