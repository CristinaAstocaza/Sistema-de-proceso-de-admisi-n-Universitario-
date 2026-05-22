package pe.edu.proceso_admision.dto.proceso_carrera;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProcesoCarreraRequestDto {

    @NotNull(message = "carreraId es obligatorio")
    private Long carreraId;

    @NotNull(message = "vacantes es obligatorio")
    private Integer vacantes;
}

