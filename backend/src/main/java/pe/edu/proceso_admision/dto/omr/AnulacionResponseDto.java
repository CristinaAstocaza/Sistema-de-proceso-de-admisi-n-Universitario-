package pe.edu.proceso_admision.dto.omr;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AnulacionResponseDto {
    private Long id;
    private Long procesoId;
    private String codigo;
    private String litocodigo;
    private String motivo;
    private String estado;
    private LocalDateTime creadoEn;
}

