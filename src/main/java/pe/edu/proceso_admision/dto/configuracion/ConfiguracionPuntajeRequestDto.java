package pe.edu.proceso_admision.dto.configuracion;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ConfiguracionPuntajeRequestDto {

    @NotNull(message = "puntajeCorrecta es obligatorio")
    private BigDecimal puntajeCorrecta;

    @NotNull(message = "puntajeIncorrecta es obligatorio")
    private BigDecimal puntajeIncorrecta;

    @NotNull(message = "puntajeBlanco es obligatorio")
    private BigDecimal puntajeBlanco;
}

