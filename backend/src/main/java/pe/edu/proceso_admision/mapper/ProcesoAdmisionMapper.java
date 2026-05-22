package pe.edu.proceso_admision.mapper;

import pe.edu.proceso_admision.dto.proceso.ProcesoAdmisionResponseDto;
import pe.edu.proceso_admision.entity.ProcesoAdmision;

public class ProcesoAdmisionMapper {

    private ProcesoAdmisionMapper() {
    }

    public static ProcesoAdmisionResponseDto toResponse(ProcesoAdmision entity) {
        return ProcesoAdmisionResponseDto.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .modalidad(entity.getModalidad())
                .periodo(entity.getPeriodo())
                .descripcion(entity.getDescripcion())
                .estado(entity.getEstado())
                .creadoEn(entity.getCreadoEn())
                .build();
    }
}

