package com.c202.lucky.dreamMeaning;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.c202.exception.types.NotFoundException;
import com.c202.exception.types.UnauthorizedException;
import com.c202.lucky.dreamMeaning.entity.DreamMeaning;
import com.c202.lucky.dreamMeaning.model.DreamMeaningDto;
import com.c202.lucky.dreamMeaning.model.DreamMeaningRequestDto;
import com.c202.lucky.dreamMeaning.repository.DreamMeaningRepository;
import com.c202.lucky.dreamMeaning.service.DreamMeaningServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.model.ChatModel;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class DreamMeaningServiceImplTest {

    @Mock
    private ChatModel chatModel;

    @Mock
    private DreamMeaningRepository dreamMeaningRepository;

    @InjectMocks
    private DreamMeaningServiceImpl dreamMeaningService;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd HHmmss");

    private final Integer userSeq = 1;
    private final Integer diarySeq = 10;

    private DreamMeaningRequestDto requestDto;

    @BeforeEach
    void setup() {
        // DTO 초기화: setter 없이 생성자를 사용
        requestDto = new DreamMeaningRequestDto("꿈에 대한 궁금증");
    }

    @Test
    void testCreateDreamMeaning_success() {
        String generatedContent = "이것은 GPT가 생성한 해몽 내용입니다.";
        String sentiment = "좋음";  // isGood = "Y"

        when(chatModel.call(contains("해몽을"))).thenReturn(generatedContent);
        when(chatModel.call(contains("좋습니까"))).thenReturn(sentiment);
        when(dreamMeaningRepository.findByDiarySeq(diarySeq)).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> dreamMeaningService.createDreamMeaning(userSeq, diarySeq, requestDto));

        ArgumentCaptor<DreamMeaning> captor = ArgumentCaptor.forClass(DreamMeaning.class);
        verify(dreamMeaningRepository, times(1)).save(captor.capture());
        DreamMeaning saved = captor.getValue();

        assertEquals(userSeq, saved.getUserSeq());
        assertEquals(requestDto.getInputContent(), saved.getInputContent());
        assertEquals(generatedContent, saved.getResultContent());
        assertEquals("Y", saved.getIsGood());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void testCreateDreamMeaning_aiCallFails_thenUsesDefault() {
        when(chatModel.call(anyString())).thenThrow(new RuntimeException("AI ERROR"));
        when(dreamMeaningRepository.findByDiarySeq(diarySeq)).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> dreamMeaningService.createDreamMeaning(userSeq, diarySeq, requestDto));

        ArgumentCaptor<DreamMeaning> captor = ArgumentCaptor.forClass(DreamMeaning.class);
        verify(dreamMeaningRepository).save(captor.capture());
        DreamMeaning saved = captor.getValue();

        assertEquals("Y", saved.getIsGood());
        assertTrue(saved.getResultContent().contains("방향을 잃었거나") || saved.getResultContent().contains("긍정적인 메시지"));
    }
    @Test
    void testGetAllDreamMeanings_success() {
        DreamMeaning dm1 = DreamMeaning.builder()
                .diarySeq(1)
                .userSeq(userSeq)
                .inputContent("입력내용1")
                .resultContent("결과내용1")
                .isGood("Y")
                .createdAt(LocalDateTime.now().format(FORMATTER))
                .build();
        DreamMeaning dm2 = DreamMeaning.builder()
                .diarySeq(2)
                .userSeq(userSeq)
                .inputContent("입력내용2")
                .resultContent("결과내용2")
                .isGood("N")
                .createdAt(LocalDateTime.now().format(FORMATTER))
                .build();
        when(dreamMeaningRepository.findByUserSeq(userSeq)).thenReturn(List.of(dm1, dm2));

        List<DreamMeaningDto> result = dreamMeaningService.getAllDreamMeanings(userSeq);

        assertEquals(2, result.size());
        assertEquals("입력내용1", result.get(0).getInputContent());
        assertEquals("결과내용2", result.get(1).getResultContent());
    }

    @Test
    void testGetDreamMeaning_success() {
        DreamMeaning dm = DreamMeaning.builder()
                .diarySeq(diarySeq)
                .userSeq(userSeq)
                .inputContent("입력내용")
                .resultContent("결과내용")
                .isGood("Y")
                .createdAt(LocalDateTime.now().format(FORMATTER))
                .build();
        when(dreamMeaningRepository.findByDiarySeq(diarySeq)).thenReturn(Optional.of(dm));

        DreamMeaningDto result = dreamMeaningService.getDreamMeaning(userSeq, diarySeq);

        assertNotNull(result);
        assertEquals("입력내용", result.getInputContent());
        assertEquals("결과내용", result.getResultContent());
    }

    @Test
    void testGetDreamMeaning_unauthorized() {
        DreamMeaning dm = DreamMeaning.builder()
                .diarySeq(diarySeq)
                .userSeq(userSeq + 1)
                .inputContent("입력내용")
                .resultContent("결과내용")
                .isGood("Y")
                .createdAt(LocalDateTime.now().format(FORMATTER))
                .build();
        when(dreamMeaningRepository.findByDiarySeq(diarySeq)).thenReturn(Optional.of(dm));

        assertThrows(UnauthorizedException.class, () -> dreamMeaningService.getDreamMeaning(userSeq, diarySeq));
    }


    @Test
    void testDeleteDreamMeaning_unauthorized() {
        DreamMeaning dm = DreamMeaning.builder()
                .diarySeq(diarySeq)
                .userSeq(userSeq + 1)
                .inputContent("입력내용")
                .resultContent("결과내용")
                .isGood("Y")
                .createdAt(LocalDateTime.now().format(FORMATTER))
                .build();
        when(dreamMeaningRepository.findByDiarySeq(diarySeq)).thenReturn(Optional.of(dm));

        assertThrows(UnauthorizedException.class, () -> dreamMeaningService.deleteDreamMeaning(userSeq, diarySeq));
        verify(dreamMeaningRepository, never()).delete(any());
    }

    @Test
    void testDeleteDreamMeaning_notFound() {
        when(dreamMeaningRepository.findByDiarySeq(diarySeq)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> dreamMeaningService.deleteDreamMeaning(userSeq, diarySeq));
        verify(dreamMeaningRepository, never()).delete(any());
    }
}
