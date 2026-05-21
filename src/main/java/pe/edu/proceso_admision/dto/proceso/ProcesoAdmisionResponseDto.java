package pe.edu.proceso_admision.dto.proceso;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProcesoAdmisionResponseDto {
    private Long id;
    private String nombre;
    private String modalidad;
    private String periodo;
    private String descripcion;
    private String estado;
    private LocalDateTime creadoEn;
}

