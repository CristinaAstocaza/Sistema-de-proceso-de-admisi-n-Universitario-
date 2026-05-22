package pe.edu.proceso_admision.dto.facultad;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FacultadResponseDto {
    private Long id;
    private String nombre;
    private Boolean activo;
}

