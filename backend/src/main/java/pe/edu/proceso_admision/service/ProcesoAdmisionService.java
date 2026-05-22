package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.dto.proceso.ProcesoAdmisionRequestDto;
import pe.edu.proceso_admision.dto.proceso.ProcesoAdmisionResponseDto;
import pe.edu.proceso_admision.entity.ProcesoAdmision;
import pe.edu.proceso_admision.exception.ResourceNotFoundException;
import pe.edu.proceso_admision.mapper.ProcesoAdmisionMapper;
import pe.edu.proceso_admision.repository.ProcesoAdmisionRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcesoAdmisionService {

    private final ProcesoAdmisionRepository procesoAdmisionRepository;

    @Transactional(readOnly = true)
    public List<ProcesoAdmisionResponseDto> listar() {
        return procesoAdmisionRepository.findAll().stream().map(ProcesoAdmisionMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProcesoAdmisionResponseDto buscarPorId(Long id) {
        return ProcesoAdmisionMapper.toResponse(obtenerEntidad(id));
    }

    @Transactional
    public ProcesoAdmisionResponseDto crear(ProcesoAdmisionRequestDto request) {
        ProcesoAdmision proceso = ProcesoAdmision.builder()
                .nombre(request.getNombre())
                .modalidad(request.getModalidad())
                .periodo(request.getPeriodo())
                .descripcion(request.getDescripcion())
                .estado(request.getEstado() != null ? request.getEstado() : "PENDIENTE")
                .creadoEn(LocalDateTime.now())
                .build();
        return ProcesoAdmisionMapper.toResponse(procesoAdmisionRepository.save(proceso));
    }

    @Transactional
    public ProcesoAdmisionResponseDto actualizar(Long id, ProcesoAdmisionRequestDto request) {
        ProcesoAdmision proceso = obtenerEntidad(id);
        proceso.setNombre(request.getNombre());
        proceso.setModalidad(request.getModalidad());
        proceso.setPeriodo(request.getPeriodo());
        proceso.setDescripcion(request.getDescripcion());
        if (request.getEstado() != null) {
            proceso.setEstado(request.getEstado());
        }
        return ProcesoAdmisionMapper.toResponse(procesoAdmisionRepository.save(proceso));
    }

    private ProcesoAdmision obtenerEntidad(Long id) {
        return procesoAdmisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proceso de admisión no encontrado con id: " + id));
    }
}

