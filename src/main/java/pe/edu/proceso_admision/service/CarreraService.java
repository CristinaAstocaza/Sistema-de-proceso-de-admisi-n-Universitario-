package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.dto.carrera.CarreraRequestDto;
import pe.edu.proceso_admision.dto.carrera.CarreraResponseDto;
import pe.edu.proceso_admision.entity.Carrera;
import pe.edu.proceso_admision.entity.Facultad;
import pe.edu.proceso_admision.exception.ResourceNotFoundException;
import pe.edu.proceso_admision.mapper.CarreraMapper;
import pe.edu.proceso_admision.repository.CarreraRepository;
import pe.edu.proceso_admision.repository.FacultadRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarreraService {

    private final CarreraRepository carreraRepository;
    private final FacultadRepository facultadRepository;

    @Transactional(readOnly = true)
    public List<CarreraResponseDto> listar() {
        return carreraRepository.findAll().stream().map(CarreraMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CarreraResponseDto buscarPorId(Long id) {
        return CarreraMapper.toResponse(obtenerEntidad(id));
    }

    @Transactional
    public CarreraResponseDto crear(CarreraRequestDto request) {
        Facultad facultad = obtenerFacultad(request.getFacultadId());
        Carrera carrera = Carrera.builder()
                .facultad(facultad)
                .nombre(request.getNombre())
                .activo(request.getActivo() != null ? request.getActivo() : Boolean.TRUE)
                .build();
        return CarreraMapper.toResponse(carreraRepository.save(carrera));
    }

    @Transactional
    public CarreraResponseDto actualizar(Long id, CarreraRequestDto request) {
        Carrera carrera = obtenerEntidad(id);
        carrera.setFacultad(obtenerFacultad(request.getFacultadId()));
        carrera.setNombre(request.getNombre());
        if (request.getActivo() != null) {
            carrera.setActivo(request.getActivo());
        }
        return CarreraMapper.toResponse(carreraRepository.save(carrera));
    }

    @Transactional
    public void desactivar(Long id) {
        Carrera carrera = obtenerEntidad(id);
        carrera.setActivo(Boolean.FALSE);
        carreraRepository.save(carrera);
    }

    private Carrera obtenerEntidad(Long id) {
        return carreraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carrera no encontrada con id: " + id));
    }

    private Facultad obtenerFacultad(Long id) {
        return facultadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facultad no encontrada con id: " + id));
    }
}

