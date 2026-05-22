package pe.edu.proceso_admision.dto.omr;

import lombok.Data;

import java.util.List;

@Data
public class CargaOmrRequestDto {
    private List<OmrIdentifiCargaDto> identificaciones;
    private List<OmrRespuestCargaDto> respuestas;
    private List<OmrClaveCargaDto> claves;
}

