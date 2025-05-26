package com.c202.user.elastic.service;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import com.c202.user.elastic.document.UserDocument;
import com.c202.user.elastic.model.request.UserSearchRequestDto;
import com.c202.user.elastic.model.response.UserSearchResponseDto;
import com.c202.user.elastic.repository.UserSearchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserSearchService {

    private final ElasticsearchOperations elasticsearchOperations;
    private final UserSearchRepository userSearchRepository;

    public Page<UserSearchResponseDto> searchUsers(UserSearchRequestDto requestDto) {
        // 쿼리 빌더 생성
        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();

        // 삭제되지 않은 사용자
        boolQueryBuilder.must(Query.of(q -> q
                .term(t -> t
                        .field("isDeleted")
                        .value("N")
                )
        ));

        // 키워드 검색 조건 설정
        if (requestDto.getKeyword() != null && !requestDto.getKeyword().isEmpty()) {
            BoolQuery.Builder keywordQueryBuilder = new BoolQuery.Builder();

            if (requestDto.isSearchNickname()) {
                // 1. 기본 match 쿼리 (단일 토큰 검색)
                keywordQueryBuilder.should(Query.of(q -> q
                        .match(m -> m
                                .field("nickname")
                                .query(requestDto.getKeyword())
                        )
                ));

                // 2. 정확한 구문 검색을 위한 match_phrase
                keywordQueryBuilder.should(Query.of(q -> q
                        .matchPhrase(mp -> mp
                                .field("nickname")
                                .query(requestDto.getKeyword())
                        )
                ));

                // 3. 부분 문자열 검색을 위한 n-gram 검색
                keywordQueryBuilder.should(Query.of(q -> q
                        .wildcard(w -> w
                                .field("nickname")
                                .wildcard("*" + requestDto.getKeyword() + "*")
                        )
                ));

                // 4. 각 글자별 AND 검색 (모든 글자가 포함된 경우)
                if (requestDto.getKeyword().length() > 1) {
                    BoolQuery.Builder charQueryBuilder = new BoolQuery.Builder();

                    for (int i = 0; i < requestDto.getKeyword().length(); i++) {
                        String singleChar = String.valueOf(requestDto.getKeyword().charAt(i));
                        charQueryBuilder.should(Query.of(q -> q
                                .match(m -> m
                                        .field("nickname")
                                        .query(singleChar)
                                )
                        ));
                    }

                    // 모든 글자가 포함되어야 함
                    charQueryBuilder.minimumShouldMatch("" + requestDto.getKeyword().length());

                    keywordQueryBuilder.should(Query.of(q -> q.bool(charQueryBuilder.build())));
                }

                // 5. 연속된 부분 문자열 검색
                if (requestDto.getKeyword().length() > 1) {
                    for (int i = 0; i < requestDto.getKeyword().length() - 1; i++) {
                        String subString = requestDto.getKeyword().substring(i, i + 2);
                        keywordQueryBuilder.should(Query.of(q -> q
                                .match(m -> m
                                        .field("nickname")
                                        .query(subString)
                                )
                        ));
                    }
                }
            }

            if (requestDto.isSearchUsername()) {
                // 1. 기본 match 쿼리
                keywordQueryBuilder.should(Query.of(q -> q
                        .match(m -> m
                                .field("username")
                                .query(requestDto.getKeyword())
                        )
                ));

                // 2. 정확한 구문 검색
                keywordQueryBuilder.should(Query.of(q -> q
                        .matchPhrase(mp -> mp
                                .field("username")
                                .query(requestDto.getKeyword())
                        )
                ));

                // 3. 부분 문자열 검색
                keywordQueryBuilder.should(Query.of(q -> q
                        .wildcard(w -> w
                                .field("username")
                                .wildcard("*" + requestDto.getKeyword() + "*")
                        )
                ));

                // 4. 각 글자별 AND 검색
                if (requestDto.getKeyword().length() > 1) {
                    BoolQuery.Builder charQueryBuilder = new BoolQuery.Builder();

                    for (int i = 0; i < requestDto.getKeyword().length(); i++) {
                        String singleChar = String.valueOf(requestDto.getKeyword().charAt(i));
                        charQueryBuilder.should(Query.of(q -> q
                                .match(m -> m
                                        .field("username")
                                        .query(singleChar)
                                )
                        ));
                    }

                    charQueryBuilder.minimumShouldMatch("" + requestDto.getKeyword().length());

                    keywordQueryBuilder.should(Query.of(q -> q.bool(charQueryBuilder.build())));
                }

                // 5. 연속된 부분 문자열 검색
                if (requestDto.getKeyword().length() > 1) {
                    for (int i = 0; i < requestDto.getKeyword().length() - 1; i++) {
                        String subString = requestDto.getKeyword().substring(i, i + 2);
                        keywordQueryBuilder.should(Query.of(q -> q
                                .match(m -> m
                                        .field("username")
                                        .query(subString)
                                )
                        ));
                    }
                }
            }

            boolQueryBuilder.must(Query.of(q -> q.bool(keywordQueryBuilder.build())));
        }

        Integer page = requestDto.getPage() != null ? requestDto.getPage() - 1 : 0;
        Integer size = requestDto.getSize() != null ? requestDto.getSize() : 20;

        if (page < 0) {
            page = 0;
        }

        PageRequest pageRequest = PageRequest.of(page, size);

        NativeQuery searchQuery = NativeQuery.builder()
                .withQuery(q -> q.bool(boolQueryBuilder.build()))
                .withPageable(pageRequest)
                .build();

        // 검색 실행
        SearchHits<UserDocument> searchHits = elasticsearchOperations.search(
                searchQuery, UserDocument.class);

        // 결과 변환
        List<UserSearchResponseDto> content = searchHits.getSearchHits().stream()
                .map(hit -> UserSearchResponseDto.fromDocument(hit.getContent()))
                .toList();

        // 페이지 정보 생성
        return new PageImpl<>(content, pageRequest, searchHits.getTotalHits());
    }
}