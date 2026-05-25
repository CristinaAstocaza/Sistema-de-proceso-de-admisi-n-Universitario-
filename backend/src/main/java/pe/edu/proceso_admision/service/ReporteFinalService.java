package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.exception.BusinessException;
import pe.edu.proceso_admision.dto.omr.ReporteFinalDto;
import pe.edu.proceso_admision.entity.*;
import pe.edu.proceso_admision.mapper.OmrMapper;
import pe.edu.proceso_admision.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteFinalService {

    private final ReporteFinalRepository reporteFinalRepository;
    private final ResultadoProcesadoRepository resultadoProcesadoRepository;
    private final PostulanteRepository postulanteRepository;
    private final ProcesoCarreraRepository procesoCarreraRepository;
    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final IncidenciaRepository incidenciaRepository;

    @Transactional
    public void generar(Long procesoId) {
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId).orElseThrow();
        reporteFinalRepository.deleteByProcesoId(procesoId);

        List<ResultadoProcesado> resultados = resultadoProcesadoRepository.findByProcesoId(procesoId).stream()
                .filter(r -> r.getCodigo() != null)
                .toList();

        List<ReporteFinal> temporales = new ArrayList<>();
        for (ResultadoProcesado r : resultados) {
            Optional<Postulante> postOpt = postulanteRepository.findById(r.getCodigo());
            if (postOpt.isEmpty() || postOpt.get().getCarrera() == null) continue;

            Postulante p = postOpt.get();
            temporales.add(ReporteFinal.builder()
                    .proceso(proceso)
                    .carrera(p.getCarrera())
                    .sec(String.valueOf(p.getCarrera().getId()))
                    .codigo(p.getCodigo())
                    .nombreCompleto(p.getNombreCompleto())
                    .puntaje(r.getPuntaje() == null ? BigDecimal.ZERO : r.getPuntaje())
                    .creadoEn(LocalDateTime.now())
                    .build());
        }

        Map<Long, Integer> vacantesByCarrera = procesoCarreraRepository.findByProcesoId(procesoId).stream()
                .collect(Collectors.toMap(pc -> pc.getCarrera().getId(), ProcesoCarrera::getVacantes, (a, b) -> a));

        Map<Long, List<ReporteFinal>> porCarrera = temporales.stream()
                .collect(Collectors.groupingBy(r -> r.getCarrera().getId()));

        for (Map.Entry<Long, List<ReporteFinal>> e : porCarrera.entrySet()) {
            List<ReporteFinal> lista = e.getValue().stream()
                    .sorted(Comparator.comparing(ReporteFinal::getPuntaje).reversed())
                    .toList();

            int vacantes = vacantesByCarrera.getOrDefault(e.getKey(), 0);
            BigDecimal corte = null;
            if (vacantes > 0 && lista.size() >= vacantes) {
                corte = lista.get(vacantes - 1).getPuntaje();
            }

            int pos = 0;
            int meritoActual = 0;
            BigDecimal puntajeAnterior = null;
            for (ReporteFinal rf : lista) {
                pos++;

                // SEC: secuencial siempre (0001, 0002, ...)
                rf.setSec(String.format("%04d", pos));

                // MÉRITO: mismo puntaje => mismo mérito
                BigDecimal puntajeActual = rf.getPuntaje() != null ? rf.getPuntaje() : BigDecimal.ZERO;
                if (puntajeAnterior == null || puntajeActual.compareTo(puntajeAnterior) != 0) {
                    meritoActual = pos;
                }
                rf.setMerito(String.valueOf(meritoActual));
                puntajeAnterior = puntajeActual;

                if (vacantes <= 0) {
                    rf.setCondicion("NO INGRESO");
                } else if (pos <= vacantes) {
                    rf.setCondicion("INGRESO");
                } else {
                    rf.setCondicion(corte != null && rf.getPuntaje().compareTo(corte) == 0 ? "INGRESO" : "NO INGRESO");
                }
            }
        }

        reporteFinalRepository.saveAll(temporales);
    }

    @Transactional(readOnly = true)
    public List<ReporteFinalDto> listar(Long procesoId) {
        return reporteFinalRepository.findByProcesoId(procesoId).stream()
                .sorted(Comparator
                        .comparing((ReporteFinal r) -> r.getCarrera() != null ? r.getCarrera().getNombre() : "")
                        .thenComparing(ReporteFinal::getPuntaje, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(OmrMapper::toReporteDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReporteFinalDto> listarPorCarrera(Long procesoId, Long carreraId) {
        return reporteFinalRepository.findByProcesoIdAndCarreraId(procesoId, carreraId).stream()
                .sorted(Comparator.comparing(ReporteFinal::getPuntaje, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(OmrMapper::toReporteDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public void validarExportacion(Long procesoId) {
        boolean tienePendientes = incidenciaRepository.findByProcesoId(procesoId).stream()
                .anyMatch(i -> i.getEstado() != null && "PENDIENTE".equalsIgnoreCase(i.getEstado()));
        if (tienePendientes) {
            throw new BusinessException("No se puede exportar mientras existan observaciones pendientes.");
        }

        if (reporteFinalRepository.findByProcesoId(procesoId).isEmpty()) {
            throw new BusinessException("No se puede exportar porque el reporte final no ha sido generado.");
        }
    }
}

