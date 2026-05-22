package pe.edu.proceso_admision.dto.omr;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExportacionResponseDto {
    private String tipo;
    private String mensaje;
}

