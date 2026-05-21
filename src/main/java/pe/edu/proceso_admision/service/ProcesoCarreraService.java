package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.dto.proceso_carrera.ProcesoCarreraRequestDto;
import pe.edu.proceso_admision.dto.proceso_carrera.ProcesoCarreraResponseDto;
import pe.edu.proceso_admision.entity.Carrera;
import pe.edu.proceso_admision.entity.ProcesoAdmision;
import pe.edu.proceso_admision.entity.ProcesoCarrera;
import pe.edu.proceso_admision.exception.ResourceNotFoundException;
import pe.edu.proceso_admision.mapper.ProcesoCarreraMapper;
import pe.edu.proceso_admision.repository.CarreraRepository;
import pe.edu.proceso_admision.repository.ProcesoAdmisionRepository;
import pe.edu.proceso_admision.repository.ProcesoCarreraRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcesoCarreraService {

    private final ProcesoCarreraRepository procesoCarreraRepository;
    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final CarreraRepository carreraRepository;

    @Transactional(readOnly = true)
    public List<ProcesoCarreraResponseDto> listarPorProceso(Long procesoId) {
        return procesoCarreraRepository.findByProcesoId(procesoId).stream()
                .map(ProcesoCarreraMapper::toResponse)
                .toList();
    }

    @Transactional
    public ProcesoCarreraResponseDto crear(Long procesoId, ProcesoCarreraRequestDto request) {
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId)
                .orElseThrow(() -> new ResourceNotFoundException("Proceso no encontrado con id: " + procesoId));
        Carrera carrera = carreraRepository.findById(request.getCarreraId())
                .orElseThrow(() -> new ResourceNotFoundException("Carrera no encontrada con id: " + request.getCarreraId()));

        ProcesoCarrera entity = ProcesoCarrera.builder()
                .proceso(proceso)
                .carrera(carrera)
                .vacantes(request.getVacantes())
                .build();
        return ProcesoCarreraMapper.toResponse(procesoCarreraRepository.save(entity));
    }
}

