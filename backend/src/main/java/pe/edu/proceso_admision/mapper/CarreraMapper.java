package pe.edu.proceso_admision.mapper;

import pe.edu.proceso_admision.dto.carrera.CarreraResponseDto;
import pe.edu.proceso_admision.entity.Carrera;

public class CarreraMapper {

    private CarreraMapper() {
    }

    public static CarreraResponseDto toResponse(Carrera entity) {
        return CarreraResponseDto.builder()
                .id(entity.getId())
                .facultadId(entity.getFacultad() != null ? entity.getFacultad().getId() : null)
                .nombre(entity.getNombre())
                .activo(entity.getActivo())
                .build();
    }
}

