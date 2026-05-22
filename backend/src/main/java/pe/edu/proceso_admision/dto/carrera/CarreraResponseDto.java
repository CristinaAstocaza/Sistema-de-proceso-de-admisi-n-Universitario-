package pe.edu.proceso_admision.dto.carrera;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CarreraResponseDto {
    private Long id;
    private Long facultadId;
    private String nombre;
    private Boolean activo;
}

