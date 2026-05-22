package pe.edu.proceso_admision.dto.omr;

import lombok.Data;

import java.util.List;

@Data
public class CargaOmrIdentifiRequestDto {
    private List<OmrIdentifiCargaDto> identificaciones;
}

