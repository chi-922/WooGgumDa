import api from "@/apis/apiClient";


export interface UserIntroductionResponse {
    "userSeq": number,
    "username": string,
    "nickname": string,
    "birthDate": string,
    "introduction": string,
    "iconSeq": number
}

export const putGuestbookIntroduction = async(data:{introduction:string}): Promise<UserIntroductionResponse[]|null> => {
    try{
        const response = await api.put('/users/me/intro', data)
        return response.data
    }catch(error){
        return null
    }
}