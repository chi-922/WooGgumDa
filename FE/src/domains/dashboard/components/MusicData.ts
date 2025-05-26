// 이미지 파일
import happy1 from '@/assets/music/happy/Dreamlight.mp3'
import happy2 from '@/assets/music/happy/DreamFragments.mp3'
import happy3 from '@/assets/music/happy/ChasingTheDream.mp3'
import hope1 from '@/assets/music/hope/SoftFuture.mp3'
import hope2 from '@/assets/music/hope/WhereLightStays.mp3'
import hope3 from '@/assets/music/hope/WhispersOfTomorrow.mp3'
import peace1 from '@/assets/music/peace/BetweenMoments.mp3'
import peace2 from '@/assets/music/peace/Midway.mp3'
import peace3 from '@/assets/music/peace/EchoesOfPeace.mp3'


// 이미지 파일 
import happyImg1 from '@/assets/music/happy/happy1.jpg'
import happyImg2 from '@/assets/music/happy/happy2.jpg'
import happyImg3 from '@/assets/music/happy/happy3.jpg'
import hopeImg1 from '@/assets/music/hope/hope1.jpg'
import hopeImg2 from '@/assets/music/hope/hope2.jpg'
import hopeImg3 from '@/assets/music/hope/hope3.jpg'
import peaceImg1 from '@/assets/music/peace/peace1.jpg'
import peaceImg2 from '@/assets/music/peace/peace2.jpg'
import peaceImg3 from '@/assets/music/peace/peace3.jpg'



export interface MusicTrack {
    id: string;
    title: string;
    audio: string;
    image: string;
    duration: string;
}

export interface MusicCategory{
    name: string;
    tracks: MusicTrack[]
}


export const MusicList : MusicCategory[]= [
    {
        name: 'happy',
        tracks: [
            {
                id: "happy1",
                title: "Dreamlight",
                audio: happy1,
                image: happyImg1,
                duration: "3:47"
            },
            {
                id: "happy2",
                title: "Dream Fragments",
                audio: happy2,
                image: happyImg2,
                duration: "2:00"

            },
            {
                id: "happy3 ",
                title: "Chasing the Dream",
                audio: happy3,
                image: happyImg3,
                duration: "4:00"
            },
        ],        
    },
    {
        name: 'hope',
        tracks: [
            {
                id: "hope1",
                title: "Soft Future",
                audio: hope1,
                image: hopeImg1,
                duration: "1:52"
            },
            {
                id: "hope2",
                title: "Where Light Stays",
                audio: hope2,
                image: hopeImg2,
                duration: "2:19"
            },
            {
                id: "hope3",
                title: "Whispers of Tomorrow",
                audio: hope3,
                image: hopeImg3,
                duration: "3:59"
            }
        ]
    },
    {
        name: 'peace',
        tracks: [
            {
                id: "peace1",
                title: "Between Moments",
                audio: peace1,
                image: peaceImg1,
                duration: "4:00"
            },
            {
                id: "peace2",
                title: "Midway",
                audio: peace2,
                image: peaceImg2,
                duration: "4:00"

            },
            {
                id: "peace3",
                title: "Echoes of Peace",
                audio: peace3,
                image: peaceImg3,
                duration: "4:00"
            }
        ] 
    }
]