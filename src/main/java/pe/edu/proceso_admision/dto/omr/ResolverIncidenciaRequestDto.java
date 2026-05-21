package pe.edu.proceso_admision.dto.omr;

import lombok.Data;

@Data
public class ResolverIncidenciaRequestDto {
    private String motivo;
    private String decision;
    private String valorCorregido;
}

