package com.c202.user.elastic.service;

import com.c202.user.elastic.document.UserDocument;
import com.c202.user.elastic.repository.UserSearchRepository;
import com.c202.user.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserIndexService {

    private final UserSearchRepository userSearchRepository;

    public void indexUser(User user) {
        UserDocument document = convertToDocument(user);
        userSearchRepository.save(document);
    }

    public void deleteUserIndex(Integer userSeq) {
        userSearchRepository.deleteById(userSeq);
    }

    private UserDocument convertToDocument(User user) {
        return UserDocument.builder()
                .userSeq(user.getUserSeq())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .birthDate(user.getBirthDate())
                .introduction(user.getIntroduction())
                .iconSeq(user.getIconSeq())
                .isDeleted(user.getIsDeleted())
                .build();
    }
}