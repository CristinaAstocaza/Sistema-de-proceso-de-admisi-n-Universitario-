package pe.edu.proceso_admision.dto.proceso_carrera;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProcesoCarreraResponseDto {
    private Long id;
    private Long procesoId;
    private Long carreraId;
    private Integer vacantes;
}

