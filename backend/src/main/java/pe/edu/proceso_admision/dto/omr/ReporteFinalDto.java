package pe.edu.proceso_admision.dto.omr;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ReporteFinalDto {
    private Long id;
    private Long carreraId;
    private String sec;
    private String codigo;
    private String nombreCompleto;
    private BigDecimal puntaje;
    private String merito;
    private String condicion;
}

