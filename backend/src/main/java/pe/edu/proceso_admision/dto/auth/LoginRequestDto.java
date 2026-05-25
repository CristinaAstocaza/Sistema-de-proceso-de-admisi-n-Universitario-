package pe.edu.proceso_admision.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequestDto {
    private String username;
    private String password;
}

