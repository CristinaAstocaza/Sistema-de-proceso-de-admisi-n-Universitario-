package pe.edu.proceso_admision.dto.omr;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditoriaResponseDto {
    private LocalDateTime fecha;
    private String accion;
    private String proceso;
    private String codigo;
    private String descripcion;
    private String motivo;
}

