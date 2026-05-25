package pe.edu.proceso_admision.dto.auth;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponseDto {
    private Long id;
    private String username;
    private String nombreCompleto;
    private String rol;
}

