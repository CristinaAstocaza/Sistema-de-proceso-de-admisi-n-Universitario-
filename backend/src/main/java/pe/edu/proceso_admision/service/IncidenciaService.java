package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.dto.omr.IncidenciaResponseDto;
import pe.edu.proceso_admision.dto.omr.ResolverIncidenciaRequestDto;
import pe.edu.proceso_admision.entity.Incidencia;
import pe.edu.proceso_admision.entity.OmrRespuest;
import pe.edu.proceso_admision.entity.ProcesoAdmision;
import pe.edu.proceso_admision.entity.ResultadoProcesado;
import pe.edu.proceso_admision.exception.ResourceNotFoundException;
import pe.edu.proceso_admision.mapper.OmrMapper;
import pe.edu.proceso_admision.repository.IncidenciaRepository;
import pe.edu.proceso_admision.repository.OmrIdentifiRepository;
import pe.edu.proceso_admision.repository.OmrRespuestRepository;
import pe.edu.proceso_admision.repository.ProcesoAdmisionRepository;
import pe.edu.proceso_admision.repository.ResultadoProcesadoRepository;
import pe.edu.proceso_admision.repository.AnulacionRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;
    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final ResultadoProcesadoRepository resultadoProcesadoRepository;
    private final AnulacionRepository anulacionRepository;
    private final OmrIdentifiRepository omrIdentifiRepository;
    private final OmrRespuestRepository omrRespuestRepository;
    private final AuditoriaService auditoriaService;
    private final ReporteFinalService reporteFinalService;
    private final RecalculoResultadosService recalculoResultadosService;

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

        String decision = request.getDecision() != null ? request.getDecision().trim().toLowerCase() : "";

        if ("reabrir_observacion".equals(decision)) {
            incidencia.setEstado("PENDIENTE");
            incidencia.setDecisionAdmin("accion=reabrir_observacion | motivo="
                    + (request.getMotivo() != null ? request.getMotivo() : "Reapertura manual")
                    + " | fechaResolucion=" + LocalDateTime.now());
            auditoriaService.registrar(null,
                    "REABRIR_INCIDENCIA",
                    "incidencias",
                    "Incidencia id=" + incidenciaId + " reabierta");
            return OmrMapper.toIncidenciaDto(incidenciaRepository.save(incidencia));
        }

        String decisionFinal = request.getDecision();
        if (request.getValorCorregido() != null && !request.getValorCorregido().isBlank()) {
            decisionFinal = (decisionFinal != null ? decisionFinal + " | " : "") + "valorCorregido=" + request.getValorCorregido();
        }
        if (request.getMotivo() != null && !request.getMotivo().isBlank()) {
            decisionFinal = (decisionFinal != null ? decisionFinal + " | " : "") + "motivo=" + request.getMotivo();
        }
        decisionFinal = (decisionFinal != null ? decisionFinal + " | " : "")
                + "fechaResolucion=" + LocalDateTime.now();

        incidencia.setDecisionAdmin(decisionFinal);
        incidencia.setEstado("RESUELTO");

        boolean requiereRehabilitar = "tomar_tema_identifi".equals(decision) || "asignar_tema_manual".equals(decision);

        if (incidencia.getCodigo() != null && !incidencia.getCodigo().isBlank()) {
            ResultadoProcesado resultado = resultadoProcesadoRepository
                    .findTopByProcesoIdAndCodigo(incidencia.getProceso().getId(), incidencia.getCodigo())
                    .orElse(null);

            boolean necesitaRecalculo = resultado == null
                    || "ANULADO".equalsIgnoreCase(resultado.getEstado())
                    || "PENDIENTE".equalsIgnoreCase(resultado.getEstado())
                    || "INCOMPLETO".equalsIgnoreCase(resultado.getEstado());

            if (requiereRehabilitar) {
                String temaCorregido = null;
                String litocodigo = resultado != null ? resultado.getLitocodigo() : incidencia.getLitocodigo();

                if ("tomar_tema_identifi".equals(decision) && litocodigo != null) {
                    temaCorregido = omrIdentifiRepository
                            .findByProcesoIdAndLitocodigo(incidencia.getProceso().getId(), litocodigo)
                            .map(i -> i.getTema() != null ? i.getTema().trim() : null)
                            .orElse(null);
                }
                if ("asignar_tema_manual".equals(decision)) {
                    temaCorregido = request.getValorCorregido() != null ? request.getValorCorregido().trim() : null;
                }

                if (litocodigo != null && temaCorregido != null && !temaCorregido.isBlank()) {
                    final String temaFinal = temaCorregido;
                    omrRespuestRepository
                            .findTopByProcesoIdAndLitocodigoOrderByCreadoEnDesc(incidencia.getProceso().getId(), litocodigo)
                            .ifPresentOrElse(resp -> {
                                        resp.setTema(temaFinal);
                                        resp.setAnulado(Boolean.FALSE);
                                        omrRespuestRepository.saveAndFlush(resp);
                                    },
                                    () -> {
                                        OmrRespuest nuevo = OmrRespuest.builder()
                                                .proceso(incidencia.getProceso())
                                                .litocodigo(litocodigo)
                                                .tema(temaFinal)
                                                .anulado(Boolean.FALSE)
                                                .respuestas("")
                                                .coincide(Boolean.TRUE)
                                                .creadoEn(LocalDateTime.now())
                                                .build();
                                        omrRespuestRepository.saveAndFlush(nuevo);
                                    });
                }

                if (resultado != null) {
                    resultado.setEstado("PROCESADO");
                    resultado.setObservacion("Rehabilitado por re-resolución de incidencia");
                    resultadoProcesadoRepository.save(resultado);
                }

                if (litocodigo != null && !litocodigo.isBlank()) {
                    anulacionRepository.findByProcesoIdAndLitocodigo(incidencia.getProceso().getId(), litocodigo)
                            .ifPresent(anulacionRepository::delete);
                }

                // Reprocesar para recalcular puntaje, mérito, condición y ranking final
                recalculoResultadosService.recalcularProcesoCompleto(incidencia.getProceso().getId());
            } else if (resultado != null && !"ANULADO".equalsIgnoreCase(resultado.getEstado())) {
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

