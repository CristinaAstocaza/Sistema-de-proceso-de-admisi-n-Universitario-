package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.dto.omr.IncidenciaResponseDto;
import pe.edu.proceso_admision.dto.omr.ResolverIncidenciaRequestDto;
import pe.edu.proceso_admision.entity.Incidencia;
import pe.edu.proceso_admision.entity.ProcesoAdmision;
import pe.edu.proceso_admision.entity.ResultadoProcesado;
import pe.edu.proceso_admision.exception.ResourceNotFoundException;
import pe.edu.proceso_admision.mapper.OmrMapper;
import pe.edu.proceso_admision.repository.IncidenciaRepository;
import pe.edu.proceso_admision.repository.ProcesoAdmisionRepository;
import pe.edu.proceso_admision.repository.ResultadoProcesadoRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;
    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final ResultadoProcesadoRepository resultadoProcesadoRepository;
    private final AuditoriaService auditoriaService;

    @Transactional
    public Incidencia crear(Long procesoId, String litocodigo, String codigo, String tipo, String descripcion) {
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId)
                .orElseThrow(() -> new ResourceNotFoundException("Proceso no encontrado con id: " + procesoId));

        Incidencia incidencia = Incidencia.builder()
                .proceso(proceso)
                .litocodigo(litocodigo)
                .codigo(codigo)
                .tipo(tipo)
                .descripcion(descripcion)
                .estado("PENDIENTE")
                .creadoEn(LocalDateTime.now())
                .build();
        return incidenciaRepository.save(incidencia);
    }

    @Transactional(readOnly = true)
    public List<IncidenciaResponseDto> listarPorProceso(Long procesoId) {
        return incidenciaRepository.findByProcesoId(procesoId).stream().map(OmrMapper::toIncidenciaDto).toList();
    }

    @Transactional
    public void eliminarPorProceso(Long procesoId) {
        incidenciaRepository.deleteByProcesoId(procesoId);
    }

    @Transactional
    public IncidenciaResponseDto resolver(Long incidenciaId, ResolverIncidenciaRequestDto request) {
        Incidencia incidencia = incidenciaRepository.findById(incidenciaId)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia no encontrada con id: " + incidenciaId));

        String decisionFinal = request.getDecision();
        if (request.getValorCorregido() != null && !request.getValorCorregido().isBlank()) {
            decisionFinal = (decisionFinal != null ? decisionFinal + " | " : "") + "valorCorregido=" + request.getValorCorregido();
        }
        if (request.getMotivo() != null && !request.getMotivo().isBlank()) {
            decisionFinal = (decisionFinal != null ? decisionFinal + " | " : "") + "motivo=" + request.getMotivo();
        }

        incidencia.setDecisionAdmin(decisionFinal);
        incidencia.setEstado("RESUELTO");

        if (incidencia.getCodigo() != null && !incidencia.getCodigo().isBlank()) {
            ResultadoProcesado resultado = resultadoProcesadoRepository
                    .findTopByProcesoIdAndCodigo(incidencia.getProceso().getId(), incidencia.getCodigo())
                    .orElse(null);
            if (resultado != null && "ANULADO".equalsIgnoreCase(resultado.getEstado())) {
                resultado.setEstado("VALIDO");
                resultado.setObservacion("Incidencia resuelta");
                resultadoProcesadoRepository.save(resultado);
            }
        }

        auditoriaService.registrar(null,
                "RESOLVER_INCIDENCIA",
                "incidencias",
                "Incidencia id=" + incidenciaId + " resuelta. " + (decisionFinal != null ? decisionFinal : ""));

        return OmrMapper.toIncidenciaDto(incidenciaRepository.save(incidencia));
    }
}

