package pe.edu.proceso_admision.mapper;

import pe.edu.proceso_admision.dto.proceso_carrera.ProcesoCarreraResponseDto;
import pe.edu.proceso_admision.entity.ProcesoCarrera;

public class ProcesoCarreraMapper {

    private ProcesoCarreraMapper() {
    }

    public static ProcesoCarreraResponseDto toResponse(ProcesoCarrera entity) {
        return ProcesoCarreraResponseDto.builder()
                .id(entity.getId())
                .procesoId(entity.getProceso() != null ? entity.getProceso().getId() : null)
                .carreraId(entity.getCarrera() != null ? entity.getCarrera().getId() : null)
                .vacantes(entity.getVacantes())
                .build();
    }
}

