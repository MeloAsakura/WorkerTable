package org.example.worktable.model;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NonNull;

@NonNull
@Getter
@EqualsAndHashCode
@Builder

public class User {
    private Long id;
    private String FirtsName;
    private String Lastname;
    private String email;
    private String password;

}


