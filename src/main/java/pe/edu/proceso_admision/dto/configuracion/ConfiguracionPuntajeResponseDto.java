package pe.edu.proceso_admision.dto.configuracion;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ConfiguracionPuntajeResponseDto {
    private Long id;
    private Long procesoId;
    private BigDecimal puntajeCorrecta;
    private BigDecimal puntajeIncorrecta;
    private BigDecimal puntajeBlanco;
    private LocalDateTime creadoEn;
}

