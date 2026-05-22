package pe.edu.proceso_admision.mapper;

import pe.edu.proceso_admision.dto.postulante.PostulanteResponseDto;
import pe.edu.proceso_admision.entity.Postulante;

public class PostulanteMapper {

    private PostulanteMapper() {
    }

    public static PostulanteResponseDto toResponse(Postulante entity) {
        return PostulanteResponseDto.builder()
                .codigo(entity.getCodigo())
                .carreraId(entity.getCarrera() != null ? entity.getCarrera().getId() : null)
                .nombreCompleto(entity.getNombreCompleto())
                .dni(entity.getDni())
                .activo(entity.getActivo())
                .build();
    }
}

