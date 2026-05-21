package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.dto.postulante.PostulanteRequestDto;
import pe.edu.proceso_admision.dto.postulante.PostulanteResponseDto;
import pe.edu.proceso_admision.entity.Carrera;
import pe.edu.proceso_admision.entity.Postulante;
import pe.edu.proceso_admision.exception.ResourceNotFoundException;
import pe.edu.proceso_admision.mapper.PostulanteMapper;
import pe.edu.proceso_admision.repository.CarreraRepository;
import pe.edu.proceso_admision.repository.PostulanteRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostulanteService {

    private final PostulanteRepository postulanteRepository;
    private final CarreraRepository carreraRepository;

    @Transactional(readOnly = true)
    public List<PostulanteResponseDto> listar() {
        return postulanteRepository.findAll().stream().map(PostulanteMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PostulanteResponseDto buscarPorId(String codigo) {
        return PostulanteMapper.toResponse(obtenerEntidad(codigo));
    }

    @Transactional
    public PostulanteResponseDto crear(PostulanteRequestDto request) {
        Postulante postulante = Postulante.builder()
                .codigo(request.getCodigo())
                .carrera(obtenerCarrera(request.getCarreraId()))
                .nombreCompleto(request.getNombreCompleto())
                .dni(request.getDni())
                .activo(request.getActivo() != null ? request.getActivo() : Boolean.TRUE)
                .build();
        return PostulanteMapper.toResponse(postulanteRepository.save(postulante));
    }

    @Transactional
    public PostulanteResponseDto actualizar(String codigo, PostulanteRequestDto request) {
        Postulante postulante = obtenerEntidad(codigo);
        postulante.setCarrera(obtenerCarrera(request.getCarreraId()));
        postulante.setNombreCompleto(request.getNombreCompleto());
        postulante.setDni(request.getDni());
        if (request.getActivo() != null) {
            postulante.setActivo(request.getActivo());
        }
        return PostulanteMapper.toResponse(postulanteRepository.save(postulante));
    }

    @Transactional
    public void desactivar(String codigo) {
        Postulante postulante = obtenerEntidad(codigo);
        postulante.setActivo(Boolean.FALSE);
        postulanteRepository.save(postulante);
    }

    private Postulante obtenerEntidad(String codigo) {
        return postulanteRepository.findById(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Postulante no encontrado con código: " + codigo));
    }

    private Carrera obtenerCarrera(Long id) {
        return carreraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carrera no encontrada con id: " + id));
    }
}

