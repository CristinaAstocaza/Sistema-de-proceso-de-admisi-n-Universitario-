package pe.edu.proceso_admision.dto.omr;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ResultadoProcesadoDto {
    private Long id;
    private String litocodigo;
    private String codigo;
    private Integer correctas;
    private Integer incorrectas;
    private Integer blancas;
    private BigDecimal puntaje;
    private String estado;
    private String observacion;
}

