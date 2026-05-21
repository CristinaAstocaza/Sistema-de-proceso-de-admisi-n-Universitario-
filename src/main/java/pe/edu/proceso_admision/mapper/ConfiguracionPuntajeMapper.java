package pe.edu.proceso_admision.mapper;

import pe.edu.proceso_admision.dto.configuracion.ConfiguracionPuntajeResponseDto;
import pe.edu.proceso_admision.entity.ConfiguracionPuntaje;

public class ConfiguracionPuntajeMapper {

    private ConfiguracionPuntajeMapper() {
    }

    public static ConfiguracionPuntajeResponseDto toResponse(ConfiguracionPuntaje entity) {
        return ConfiguracionPuntajeResponseDto.builder()
                .id(entity.getId())
                .procesoId(entity.getProceso() != null ? entity.getProceso().getId() : null)
                .puntajeCorrecta(entity.getPuntajeCorrecta())
                .puntajeIncorrecta(entity.getPuntajeIncorrecta())
                .puntajeBlanco(entity.getPuntajeBlanco())
                .creadoEn(entity.getCreadoEn())
                .build();
    }
}

