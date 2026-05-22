package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.dto.configuracion.ConfiguracionPuntajeRequestDto;
import pe.edu.proceso_admision.dto.configuracion.ConfiguracionPuntajeResponseDto;
import pe.edu.proceso_admision.entity.ConfiguracionPuntaje;
import pe.edu.proceso_admision.entity.ProcesoAdmision;
import pe.edu.proceso_admision.mapper.ConfiguracionPuntajeMapper;
import pe.edu.proceso_admision.repository.ConfiguracionPuntajeRepository;
import pe.edu.proceso_admision.repository.ProcesoAdmisionRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConfiguracionPuntajeService {

    private final ConfiguracionPuntajeRepository configuracionPuntajeRepository;
    private final ProcesoAdmisionRepository procesoAdmisionRepository;

    @Transactional(readOnly = true)
    public List<ConfiguracionPuntajeResponseDto> listarPorProceso(Long procesoId) {
        return configuracionPuntajeRepository.findByProcesoId(procesoId).stream()
                .map(ConfiguracionPuntajeMapper::toResponse)
                .toList();
    }

    @Transactional
    public ConfiguracionPuntajeResponseDto crear(Long procesoId, ConfiguracionPuntajeRequestDto request) {
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId)
                .orElseThrow(() -> new pe.edu.proceso_admision.exception.ResourceNotFoundException("Proceso no encontrado con id: " + procesoId));

        ConfiguracionPuntaje entity = ConfiguracionPuntaje.builder()
                .proceso(proceso)
                .puntajeCorrecta(request.getPuntajeCorrecta())
                .puntajeIncorrecta(request.getPuntajeIncorrecta())
                .puntajeBlanco(request.getPuntajeBlanco())
                .creadoEn(LocalDateTime.now())
                .build();
        return ConfiguracionPuntajeMapper.toResponse(configuracionPuntajeRepository.save(entity));
    }
}

