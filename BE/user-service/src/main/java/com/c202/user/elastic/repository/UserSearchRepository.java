package com.c202.user.elastic.repository;

import com.c202.user.elastic.document.UserDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

@EnableElasticsearchRepositories
public interface UserSearchRepository extends ElasticsearchRepository<UserDocument, Integer> {
}
