package pe.edu.proceso_admision.dto.omr;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AjusteResultadoRequestDto {
    private Integer correctas;
    private Integer incorrectas;
    private Integer blancas;
    private BigDecimal puntaje;
    private String estado;
    private String observacion;
    private String motivo;
}

