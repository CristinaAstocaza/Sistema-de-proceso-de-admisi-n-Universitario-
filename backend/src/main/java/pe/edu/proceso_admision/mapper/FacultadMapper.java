package pe.edu.proceso_admision.mapper;

import pe.edu.proceso_admision.dto.facultad.FacultadResponseDto;
import pe.edu.proceso_admision.entity.Facultad;

public class FacultadMapper {

    private FacultadMapper() {
    }

    public static FacultadResponseDto toResponse(Facultad entity) {
        return FacultadResponseDto.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .activo(entity.getActivo())
                .build();
    }
}

