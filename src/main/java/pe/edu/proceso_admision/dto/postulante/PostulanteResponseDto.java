package pe.edu.proceso_admision.dto.postulante;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PostulanteResponseDto {
    private String codigo;
    private Long carreraId;
    private String nombreCompleto;
    private String dni;
    private Boolean activo;
}

