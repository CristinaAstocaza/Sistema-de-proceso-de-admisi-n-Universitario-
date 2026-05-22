package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.dto.facultad.FacultadRequestDto;
import pe.edu.proceso_admision.dto.facultad.FacultadResponseDto;
import pe.edu.proceso_admision.entity.Facultad;
import pe.edu.proceso_admision.exception.ResourceNotFoundException;
import pe.edu.proceso_admision.mapper.FacultadMapper;
import pe.edu.proceso_admision.repository.FacultadRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacultadService {

    private final FacultadRepository facultadRepository;

    @Transactional(readOnly = true)
    public List<FacultadResponseDto> listar() {
        return facultadRepository.findAll().stream().map(FacultadMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public FacultadResponseDto buscarPorId(Long id) {
        return FacultadMapper.toResponse(obtenerEntidad(id));
    }

    @Transactional
    public FacultadResponseDto crear(FacultadRequestDto request) {
        Facultad facultad = Facultad.builder()
                .nombre(request.getNombre())
                .activo(request.getActivo() != null ? request.getActivo() : Boolean.TRUE)
                .build();
        return FacultadMapper.toResponse(facultadRepository.save(facultad));
    }

    @Transactional
    public FacultadResponseDto actualizar(Long id, FacultadRequestDto request) {
        Facultad facultad = obtenerEntidad(id);
        facultad.setNombre(request.getNombre());
        if (request.getActivo() != null) {
            facultad.setActivo(request.getActivo());
        }
        return FacultadMapper.toResponse(facultadRepository.save(facultad));
    }

    @Transactional
    public void desactivar(Long id) {
        Facultad facultad = obtenerEntidad(id);
        facultad.setActivo(Boolean.FALSE);
        facultadRepository.save(facultad);
    }

    private Facultad obtenerEntidad(Long id) {
        return facultadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facultad no encontrada con id: " + id));
    }
}

