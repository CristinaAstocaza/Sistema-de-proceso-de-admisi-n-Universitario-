package pe.edu.proceso_admision.dto.omr;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class IncidenciaResponseDto {
    private Long id;
    private String litocodigo;
    private String codigo;
    private String tipo;
    private String descripcion;
    private String estado;
    private String decisionAdmin;
    private LocalDateTime creadoEn;
}

