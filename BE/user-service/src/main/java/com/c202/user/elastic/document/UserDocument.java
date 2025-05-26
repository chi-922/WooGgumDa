package com.c202.user.elastic.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Setting;

@Document(indexName = "user")
@Setting(settingPath = "/elasticsearch/user-settings.json")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDocument {

    @Id
    @Field(type = FieldType.Integer)
    private Integer userSeq;

    @Field(type = FieldType.Text, analyzer = "korean", searchAnalyzer = "korean_search")
    private String username;

    @Field(type = FieldType.Text, analyzer = "korean", searchAnalyzer = "korean_search")
    private String nickname;

    @Field(type = FieldType.Keyword)
    private String isDeleted;

    @Field(type = FieldType.Keyword)
    private String birthDate;

    @Field(type = FieldType.Integer)
    private Integer iconSeq;

    @Field(type = FieldType.Text, analyzer = "korean")
    private String introduction;
}