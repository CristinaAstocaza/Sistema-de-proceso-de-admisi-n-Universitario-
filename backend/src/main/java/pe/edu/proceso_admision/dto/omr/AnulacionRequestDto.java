package pe.edu.proceso_admision.dto.omr;

import lombok.Data;

@Data
public class AnulacionRequestDto {
    private Long procesoId;
    private String codigo;
    private String litocodigo;
    private String motivo;
    private Long anuladoPor;
}

