package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.dto.omr.AjusteResultadoRequestDto;
import pe.edu.proceso_admision.dto.omr.AlumnoDetalleDto;
import pe.edu.proceso_admision.dto.omr.AuditoriaResponseDto;
import pe.edu.proceso_admision.dto.omr.ProcesoEstadisticasDto;
import pe.edu.proceso_admision.entity.*;
import pe.edu.proceso_admision.exception.ResourceNotFoundException;
import pe.edu.proceso_admision.repository.*;

import java.util.List;
import java.util.Locale;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class OmrConsultaService {

    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final ResultadoProcesadoRepository resultadoProcesadoRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final AnulacionRepository anulacionRepository;
    private final ReporteFinalRepository reporteFinalRepository;
    private final ProcesoCarreraRepository procesoCarreraRepository;
    private final PostulanteRepository postulanteRepository;
    private final AuditoriaRepository auditoriaRepository;
    private final ReporteFinalService reporteFinalService;
    private final AuditoriaService auditoriaService;

    @Transactional(readOnly = true)
    public ProcesoEstadisticasDto obtenerEstadisticas(Long procesoId) {
        procesoAdmisionRepository.findById(procesoId).orElseThrow();

        List<ResultadoProcesado> resultados = resultadoProcesadoRepository.findByProcesoId(procesoId);
        List<Incidencia> incidencias = incidenciaRepository.findByProcesoId(procesoId);
        List<Anulacion> anulaciones = anulacionRepository.findByProcesoId(procesoId);
        List<ReporteFinal> reporte = reporteFinalRepository.findByProcesoId(procesoId);
        List<ProcesoCarrera> procesoCarreras = procesoCarreraRepository.findByProcesoId(procesoId);

        long totalAlumnosProcesados = resultados.stream()
                .map(ResultadoProcesado::getCodigo)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .count();

        long totalExamenesCalificados = resultados.stream()
                .filter(r -> r.getEstado() != null && !"ANULADO".equalsIgnoreCase(r.getEstado()))
                .count();

        long totalObservados = incidencias.stream()
                .filter(i -> i.getEstado() != null && "PENDIENTE".equalsIgnoreCase(i.getEstado()))
                .count();

        long totalIngresantes = reporte.stream()
                .filter(r -> r.getCondicion() != null && "INGRESO".equalsIgnoreCase(r.getCondicion()))
                .count();

        long totalNoIngresantes = reporte.stream()
                .filter(r -> r.getCondicion() != null && "NO INGRESO".equalsIgnoreCase(r.getCondicion()))
                .count();

        long totalVacantes = procesoCarreras.stream()
                .map(ProcesoCarrera::getVacantes)
                .filter(v -> v != null)
                .mapToLong(Integer::longValue)
                .sum();

        return ProcesoEstadisticasDto.builder()
                .totalAlumnosProcesados(totalAlumnosProcesados)
                .totalExamenesCalificados(totalExamenesCalificados)
                .totalObservados(totalObservados)
                .totalAnulados(anulaciones.size())
                .totalIngresantes(totalIngresantes)
                .totalNoIngresantes(totalNoIngresantes)
                .totalCarrerasConfiguradas(procesoCarreras.size())
                .totalVacantes(totalVacantes)
                .build();
    }

    @Transactional(readOnly = true)
    public AlumnoDetalleDto obtenerDetalleAlumno(Long procesoId, String codigo) {
        procesoAdmisionRepository.findById(procesoId).orElseThrow();

        ResultadoProcesado resultado = resultadoProcesadoRepository
                .findTopByProcesoIdAndCodigo(procesoId, codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Resultado no encontrado para código: " + codigo));

        Postulante postulante = postulanteRepository.findById(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Postulante no encontrado con código: " + codigo));

        ReporteFinal reporte = reporteFinalRepository.findByProcesoId(procesoId).stream()
                .filter(r -> codigo.equals(r.getCodigo()))
                .findFirst()
                .orElse(null);

        Incidencia incidencia = incidenciaRepository
                .findTopByProcesoIdAndCodigoOrderByCreadoEnDesc(procesoId, codigo)
                .orElse(null);

        return AlumnoDetalleDto.builder()
                .codigo(codigo)
                .nombre(postulante.getNombreCompleto())
                .carrera(postulante.getCarrera() != null ? postulante.getCarrera().getNombre() : null)
                .merito(reporte != null ? reporte.getMerito() : null)
                .puntaje(reporte != null ? reporte.getPuntaje() : resultado.getPuntaje())
                .condicion(reporte != null ? reporte.getCondicion() : null)
                .estadoInterno(resultado.getEstado())
                .correctas(resultado.getCorrectas())
                .incorrectas(resultado.getIncorrectas())
                .blancas(resultado.getBlancas())
                .tipoIncidencia(incidencia != null ? incidencia.getTipo() : null)
                .descripcionIncidencia(incidencia != null ? incidencia.getDescripcion() : null)
                .build();
    }

    @Transactional
    public void anularAlumno(Long procesoId, String codigo, String motivo) {
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId)
                .orElseThrow(() -> new ResourceNotFoundException("Proceso no encontrado con id: " + procesoId));

        ResultadoProcesado resultado = resultadoProcesadoRepository.findTopByProcesoIdAndCodigo(procesoId, codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Resultado no encontrado para código: " + codigo));

        Anulacion anulacion = anulacionRepository.findByProcesoIdAndCodigo(procesoId, codigo)
                .orElseGet(() -> Anulacion.builder()
                        .proceso(proceso)
                        .codigo(codigo)
                        .litocodigo(resultado.getLitocodigo())
                        .creadoEn(java.time.LocalDateTime.now())
                        .build());
        anulacion.setLitocodigo(resultado.getLitocodigo());
        anulacion.setMotivo(motivo);
        anulacion.setCreadoEn(java.time.LocalDateTime.now());
        anulacionRepository.save(anulacion);

        resultado.setEstado("ANULADO");
        resultado.setObservacion(motivo != null && !motivo.isBlank() ? motivo : "Anulado por observación");
        resultado.setPuntaje(java.math.BigDecimal.ZERO);
        resultado.setCorrectas(0);
        resultado.setIncorrectas(0);
        resultado.setBlancas(0);
        resultadoProcesadoRepository.save(resultado);

        reporteFinalRepository.findTopByProcesoIdAndCodigo(procesoId, codigo).ifPresent(rf -> {
            rf.setCondicion("NO INGRESO");
            rf.setPuntaje(java.math.BigDecimal.ZERO);
            rf.setMerito("0");
            reporteFinalRepository.save(rf);
        });

        reporteFinalService.generar(procesoId);

        List<Incidencia> incidencias = incidenciaRepository.findByProcesoIdAndCodigo(procesoId, codigo);
        for (Incidencia inc : incidencias) {
            inc.setEstado("ANULADO");
            String motivoFinal = motivo != null && !motivo.isBlank() ? motivo : "Anulado manualmente";
            String decisionNueva = "accion=anular_examen | motivo=" + motivoFinal + " | fecha=" + java.time.LocalDateTime.now();
            inc.setDecisionAdmin(decisionNueva);
            incidenciaRepository.save(inc);
        }
    }

    @Transactional
    public AlumnoDetalleDto ajustarResultadoManual(Long procesoId,
                                                   String codigo,
                                                   AjusteResultadoRequestDto request,
                                                   Long usuarioId) {
        if (request == null || request.getMotivo() == null || request.getMotivo().isBlank()) {
            throw new IllegalArgumentException("El motivo es obligatorio para ajustar resultado.");
        }

        procesoAdmisionRepository.findById(procesoId)
                .orElseThrow(() -> new ResourceNotFoundException("Proceso no encontrado con id: " + procesoId));

        ResultadoProcesado resultado = resultadoProcesadoRepository.findTopByProcesoIdAndCodigo(procesoId, codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Resultado no encontrado para código: " + codigo));

        Integer prevCorrectas = resultado.getCorrectas();
        Integer prevIncorrectas = resultado.getIncorrectas();
        Integer prevBlancas = resultado.getBlancas();
        BigDecimal prevPuntaje = resultado.getPuntaje();
        String prevEstado = resultado.getEstado();
        String prevObs = resultado.getObservacion();

        if (request.getCorrectas() != null) resultado.setCorrectas(request.getCorrectas());
        if (request.getIncorrectas() != null) resultado.setIncorrectas(request.getIncorrectas());
        if (request.getBlancas() != null) resultado.setBlancas(request.getBlancas());
        if (request.getPuntaje() != null) resultado.setPuntaje(request.getPuntaje());
        if (request.getEstado() != null && !request.getEstado().isBlank()) resultado.setEstado(request.getEstado().trim());
        if (request.getObservacion() != null) resultado.setObservacion(request.getObservacion().trim());

        resultadoProcesadoRepository.saveAndFlush(resultado);
        reporteFinalService.generar(procesoId);

        String descripcion = "proceso_id=" + procesoId +
                " codigo=" + codigo +
                " motivo=" + request.getMotivo().trim() +
                " | before{correctas=" + String.valueOf(prevCorrectas) +
                ", incorrectas=" + String.valueOf(prevIncorrectas) +
                ", blancas=" + String.valueOf(prevBlancas) +
                ", puntaje=" + String.valueOf(prevPuntaje) +
                ", estado=" + String.valueOf(prevEstado) +
                ", observacion=" + String.valueOf(prevObs) +
                "} after{correctas=" + String.valueOf(resultado.getCorrectas()) +
                ", incorrectas=" + String.valueOf(resultado.getIncorrectas()) +
                ", blancas=" + String.valueOf(resultado.getBlancas()) +
                ", puntaje=" + String.valueOf(resultado.getPuntaje()) +
                ", estado=" + String.valueOf(resultado.getEstado()) +
                ", observacion=" + String.valueOf(resultado.getObservacion()) + "}";

        auditoriaService.registrar(usuarioId,
                "AJUSTE_RESULTADO_MANUAL",
                "resultados_procesados",
                descripcion);

        return obtenerDetalleAlumno(procesoId, codigo);
    }

    @Transactional(readOnly = true)
    public List<AuditoriaResponseDto> listarAuditoria(Long procesoId,
                                                      String codigo,
                                                      String accion,
                                                      java.time.LocalDateTime fechaInicio,
                                                      java.time.LocalDateTime fechaFin) {
        return auditoriaRepository.findAllByOrderByFechaDesc().stream()
                .filter(a -> fechaInicio == null || (a.getFecha() != null && !a.getFecha().isBefore(fechaInicio)))
                .filter(a -> fechaFin == null || (a.getFecha() != null && !a.getFecha().isAfter(fechaFin)))
                .filter(a -> accion == null || accion.isBlank() ||
                        (a.getAccion() != null && a.getAccion().toLowerCase(Locale.ROOT).contains(accion.toLowerCase(Locale.ROOT))))
                .filter(a -> {
                    if (procesoId == null) return true;
                    String token = "proceso_id=" + procesoId;
                    return a.getDescripcion() != null && a.getDescripcion().contains(token);
                })
                .filter(a -> {
                    if (codigo == null || codigo.isBlank()) return true;
                    return a.getDescripcion() != null && a.getDescripcion().toLowerCase(Locale.ROOT).contains(codigo.toLowerCase(Locale.ROOT));
                })
                .map(a -> AuditoriaResponseDto.builder()
                        .fecha(a.getFecha())
                        .accion(a.getAccion())
                        .proceso(extraerValor(a.getDescripcion(), "proceso_id="))
                        .codigo(extraerCodigo(a.getDescripcion()))
                        .descripcion(a.getDescripcion())
                        .motivo(extraerMotivo(a.getDescripcion()))
                        .build())
                .toList();
    }

    private String extraerValor(String descripcion, String token) {
        if (descripcion == null) return null;
        int idx = descripcion.indexOf(token);
        if (idx < 0) return null;
        int start = idx + token.length();
        int end = descripcion.indexOf(' ', start);
        if (end < 0) end = descripcion.length();
        return descripcion.substring(start, end).replaceAll("[^0-9]", "");
    }

    private String extraerCodigo(String descripcion) {
        if (descripcion == null) return null;
        if (descripcion.contains("codigo=")) {
            return descripcion.substring(descripcion.indexOf("codigo=") + 7).split("\\s|\\|")[0];
        }
        return null;
    }

    private String extraerMotivo(String descripcion) {
        if (descripcion == null) return null;
        if (descripcion.toLowerCase(Locale.ROOT).contains("motivo=")) {
            return descripcion.substring(descripcion.toLowerCase(Locale.ROOT).indexOf("motivo=") + 7).trim();
        }
        return null;
    }
}

