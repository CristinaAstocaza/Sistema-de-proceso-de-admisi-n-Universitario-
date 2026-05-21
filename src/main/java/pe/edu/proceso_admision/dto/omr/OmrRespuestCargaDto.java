package pe.edu.proceso_admision.dto.omr;

import lombok.Data;

@Data
public class OmrRespuestCargaDto {
    private String litocodigo;
    private String tema;
    private Boolean anulado;
    private String respuestas;
}

