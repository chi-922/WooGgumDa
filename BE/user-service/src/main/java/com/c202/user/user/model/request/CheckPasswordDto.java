package com.c202.user.user.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CheckPasswordDto {

    @NotNull(message = "비밀번호는 필수입니다.")
    private String password;
}
