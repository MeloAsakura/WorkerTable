package Model;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NonNull;

import java.util.List;

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


