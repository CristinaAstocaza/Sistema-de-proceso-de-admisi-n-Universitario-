package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.dto.omr.ResultadoProcesadoDto;
import pe.edu.proceso_admision.entity.*;
import pe.edu.proceso_admision.mapper.OmrMapper;
import pe.edu.proceso_admision.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProcesamientoOmrService {

    private static final int BATCH_RESULTADOS = 500;
    private static final int BATCH_DETALLES = 1000;

    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final OmrIdentifiRepository omrIdentifiRepository;
    private final OmrRespuestRepository omrRespuestRepository;
    private final OmrClaveRepository omrClaveRepository;
    private final ConfiguracionPuntajeRepository configuracionPuntajeRepository;
    private final ResultadoProcesadoRepository resultadoProcesadoRepository;
    private final RespuestaDetalleRepository respuestaDetalleRepository;
    private final AnulacionRepository anulacionRepository;
    private final IncidenciaService incidenciaService;
    private final ReporteFinalService reporteFinalService;
    private final AuditoriaService auditoriaService;
    private final PostulanteRepository postulanteRepository;

    @Transactional
    public void procesar(Long procesoId) {
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId).orElseThrow();

        ConfiguracionPuntaje cfg = configuracionPuntajeRepository.findByProcesoId(procesoId).stream().findFirst().orElse(null);
        BigDecimal pCorrecta = cfg != null ? cfg.getPuntajeCorrecta() : BigDecimal.valueOf(20.000);
        BigDecimal pIncorrecta = cfg != null ? cfg.getPuntajeIncorrecta() : BigDecimal.valueOf(-1.125);
        BigDecimal pBlanco = cfg != null ? cfg.getPuntajeBlanco() : BigDecimal.ZERO;

        // control de reproceso: limpiar completamente antes de recalcular
        incidenciaService.eliminarPorProceso(procesoId);
        respuestaDetalleRepository.deleteByResultadoProcesoId(procesoId);
        resultadoProcesadoRepository.deleteByProcesoId(procesoId);

        List<OmrIdentifi> identifiList = omrIdentifiRepository.findByProcesoId(procesoId);
        List<OmrRespuest> respuests = omrRespuestRepository.findByProcesoId(procesoId);
        List<OmrClave> claves = omrClaveRepository.findAll().stream()
                .filter(c -> c.getProceso() != null && procesoId.equals(c.getProceso().getId()))
                .toList();

        Map<String, OmrIdentifi> identifiPorLitocodigo = new HashMap<>();
        for (OmrIdentifi ident : identifiList) {
            if (ident.getLitocodigo() != null && !ident.getLitocodigo().isBlank()) {
                identifiPorLitocodigo.putIfAbsent(ident.getLitocodigo(), ident);
            }
        }

        Map<String, OmrClave> clavePorTema = new HashMap<>();
        for (OmrClave clave : claves) {
            if (clave.getTema() != null && !clave.getTema().isBlank()) {
                clavePorTema.putIfAbsent(clave.getTema(), clave);
            }
        }

        Set<String> litocodigosAnulados = new HashSet<>();
        for (Anulacion anulacion : anulacionRepository.findAll()) {
            if (anulacion.getProceso() != null
                    && procesoId.equals(anulacion.getProceso().getId())
                    && anulacion.getLitocodigo() != null
                    && !anulacion.getLitocodigo().isBlank()) {
                litocodigosAnulados.add(anulacion.getLitocodigo());
            }
        }

        Set<String> codigos = new HashSet<>();
        for (OmrRespuest resp : respuests) {
            OmrIdentifi ident = identifiPorLitocodigo.get(resp.getLitocodigo());
            if (ident != null && ident.getCodigo() != null && !ident.getCodigo().isBlank()) {
                codigos.add(ident.getCodigo());
            }
        }

        // carga de postulantes solo una vez por proceso/códigos involucrados
        Map<String, Postulante> postulantePorCodigo = new HashMap<>();
        for (Postulante p : postulanteRepository.findAllById(codigos)) {
            postulantePorCodigo.put(p.getCodigo(), p);
        }

        System.out.println("[OMR] total identifi=" + identifiList.size());
        System.out.println("[OMR] total respuest=" + respuests.size());
        System.out.println("[OMR] total claves=" + claves.size());

        int totalAlumnosProcesados = 0;
        int totalDetallesGenerados = 0;

        List<ResultadoProcesado> bufferResultados = new ArrayList<>(BATCH_RESULTADOS);
        List<List<String>> bufferAlumno = new ArrayList<>(BATCH_RESULTADOS);
        List<List<String>> bufferClave = new ArrayList<>(BATCH_RESULTADOS);
        List<Boolean> bufferAnulado = new ArrayList<>(BATCH_RESULTADOS);
        List<Boolean> bufferSkipDetalle = new ArrayList<>(BATCH_RESULTADOS);

        for (OmrRespuest resp : respuests) {
            OmrIdentifi ident = identifiPorLitocodigo.get(resp.getLitocodigo());

            String codigo = ident != null ? ident.getCodigo() : null;
            String temaIdent = ident != null ? ident.getTema() : null;
            String temaResp = resp.getTema();
            boolean incidenciaGrave = false;

            if (codigo == null || codigo.isBlank()) {
                incidenciaService.crear(procesoId, resp.getLitocodigo(), codigo, "CODIGO_NO_EXISTE", "No se encontró código en IDENTIFI para litocodigo");
                incidenciaGrave = true;
            } else if (!postulantePorCodigo.containsKey(codigo)) {
                incidenciaService.crear(procesoId, resp.getLitocodigo(), codigo, "POSTULANTE_NO_EXISTE", "No se encontró postulante para el código");
                incidenciaGrave = true;
            }

            if ((temaIdent == null || temaIdent.isBlank()) && temaResp != null && !temaResp.isBlank()) {
                incidenciaService.crear(procesoId, resp.getLitocodigo(), codigo, "SIN_TEMA_IDENTIFI", "Identificación sin tema");
                incidenciaGrave = true;
            }
            if (temaResp == null || temaResp.isBlank()) {
                incidenciaService.crear(procesoId, resp.getLitocodigo(), codigo, "SIN_TEMA_RESPUEST", "Respuesta sin tema");
                incidenciaGrave = true;
            }
            if (temaIdent != null && temaResp != null && !temaIdent.equals(temaResp)) {
                incidenciaService.crear(procesoId, resp.getLitocodigo(), codigo, "TEMA_NO_COINCIDE", "Tema identifi diferente a tema respuest");
                incidenciaGrave = true;
            }

            boolean anulado = Boolean.TRUE.equals(resp.getAnulado()) || litocodigosAnulados.contains(resp.getLitocodigo());

            if (anulado) {
                incidenciaService.crear(procesoId, resp.getLitocodigo(), codigo, "ANULADO", "Hoja anulada");
                incidenciaGrave = true;
            }

            String estado = anulado ? "ANULADO" : "PROCESADO";
            String observacion = anulado ? "Registro anulado" : null;

            OmrClave clave = temaResp != null ? clavePorTema.get(temaResp) : null;
            List<String> alumno = normalizar100(resp.getRespuestas());
            List<String> claveL = normalizar100(clave != null ? clave.getRespuestas() : null);

            int correctas = 0, incorrectas = 0, blancas = 0;
            BigDecimal puntaje = BigDecimal.ZERO;

            if (!incidenciaGrave) {
                for (int i = 0; i < 100; i++) {
                    String ra = alumno.get(i);
                    String rc = claveL.get(i);
                    if (rc == null || rc.isBlank()) {
                        correctas++;
                        puntaje = puntaje.add(pCorrecta);
                    } else if (ra == null || ra.isBlank()) {
                        blancas++;
                        puntaje = puntaje.add(pBlanco);
                    } else if (ra.equalsIgnoreCase(rc)) {
                        correctas++;
                        puntaje = puntaje.add(pCorrecta);
                    } else {
                        incorrectas++;
                        puntaje = puntaje.add(pIncorrecta);
                    }
                }
            }

            ResultadoProcesado r = ResultadoProcesado.builder()
                    .proceso(proceso)
                    .litocodigo(resp.getLitocodigo())
                    .codigo(codigo)
                    .temaIdentifi(temaIdent)
                    .temaRespuest(temaResp)
                    .respuestasTotal(100)
                    .correctas(incidenciaGrave ? 0 : correctas)
                    .incorrectas(incidenciaGrave ? 0 : incorrectas)
                    .blancas(incidenciaGrave ? 0 : blancas)
                    .puntaje(incidenciaGrave ? BigDecimal.ZERO : puntaje)
                    .estado(estado)
                    .observacion(observacion)
                    .creadoEn(LocalDateTime.now())
                    .build();

            bufferResultados.add(r);
            bufferAlumno.add(alumno);
            bufferClave.add(claveL);
            bufferAnulado.add(anulado);
            bufferSkipDetalle.add(incidenciaGrave);

            if (bufferResultados.size() >= BATCH_RESULTADOS) {
                totalDetallesGenerados += flushBatch(bufferResultados, bufferAlumno, bufferClave, bufferAnulado, bufferSkipDetalle,
                        pCorrecta, pIncorrecta, pBlanco);
                totalAlumnosProcesados += BATCH_RESULTADOS;
                System.out.println("[OMR] avance alumnos procesados=" + totalAlumnosProcesados + ", detalles generados=" + totalDetallesGenerados);
            }
        }

        if (!bufferResultados.isEmpty()) {
            int pendientes = bufferResultados.size();
            totalDetallesGenerados += flushBatch(bufferResultados, bufferAlumno, bufferClave, bufferAnulado, bufferSkipDetalle,
                    pCorrecta, pIncorrecta, pBlanco);
            totalAlumnosProcesados += pendientes;
        }

        System.out.println("[OMR] total alumnos procesados=" + totalAlumnosProcesados);
        System.out.println("[OMR] total detalles generados=" + totalDetallesGenerados);

        reporteFinalService.generar(procesoId);
        auditoriaService.registrar(null, "PROCESAR_OMR", "resultados_procesados", "Procesamiento de proceso_id=" + procesoId);
    }

    private int flushBatch(List<ResultadoProcesado> bufferResultados,
                           List<List<String>> bufferAlumno,
                           List<List<String>> bufferClave,
                           List<Boolean> bufferAnulado,
                           List<Boolean> bufferSkipDetalle,
                           BigDecimal pCorrecta,
                           BigDecimal pIncorrecta,
                           BigDecimal pBlanco) {
        List<ResultadoProcesado> guardados = resultadoProcesadoRepository.saveAll(bufferResultados);

        List<RespuestaDetalle> detalles = new ArrayList<>(BATCH_DETALLES);
        int totalDetalles = 0;
        for (int idx = 0; idx < guardados.size(); idx++) {
            if (Boolean.TRUE.equals(bufferSkipDetalle.get(idx))) continue;

            ResultadoProcesado r = guardados.get(idx);
            List<String> alumno = bufferAlumno.get(idx);
            List<String> claveL = bufferClave.get(idx);
            boolean anulado = Boolean.TRUE.equals(bufferAnulado.get(idx));

            for (int i = 0; i < 100; i++) {
                String ra = alumno.get(i);
                String rc = claveL.get(i);
                String est;
                BigDecimal po;

                if (anulado) {
                    est = "ANULADO";
                    po = BigDecimal.ZERO;
                } else if (rc == null || rc.isBlank()) {
                    est = "CLAVE_VACIA";
                    po = pCorrecta;
                } else if (ra == null || ra.isBlank()) {
                    est = "BLANCO";
                    po = pBlanco;
                } else if (ra.equalsIgnoreCase(rc)) {
                    est = "CORRECTA";
                    po = pCorrecta;
                } else {
                    est = "INCORRECTA";
                    po = pIncorrecta;
                }

                detalles.add(RespuestaDetalle.builder()
                        .resultado(r)
                        .numeroPregunta(i + 1)
                        .respuestaAlumno(ra)
                        .respuestaClave(rc)
                        .estado(est)
                        .puntajeObtenido(po)
                        .build());

                if (detalles.size() >= BATCH_DETALLES) {
                    respuestaDetalleRepository.saveAll(detalles);
                    totalDetalles += detalles.size();
                    detalles.clear();
                }
            }
        }

        if (!detalles.isEmpty()) {
            respuestaDetalleRepository.saveAll(detalles);
            totalDetalles += detalles.size();
            detalles.clear();
        }

        bufferResultados.clear();
        bufferAlumno.clear();
        bufferClave.clear();
        bufferAnulado.clear();
        bufferSkipDetalle.clear();

        return totalDetalles;
    }

    @Transactional(readOnly = true)
    public List<ResultadoProcesadoDto> listarResultados(Long procesoId) {
        return resultadoProcesadoRepository.findByProcesoId(procesoId).stream().map(OmrMapper::toResultadoDto).toList();
    }

    private List<String> normalizar100(String s) {
        List<String> out = new ArrayList<>();
        if (s == null || s.isBlank()) {
            for (int i = 0; i < 100; i++) out.add("");
            return out;
        }

        if (s.contains(",")) {
            out.addAll(Arrays.stream(s.split(",", -1)).map(String::trim).toList());
        } else {
            for (char c : s.toCharArray()) out.add(String.valueOf(c).trim());
        }

        while (out.size() < 100) out.add("");
        if (out.size() > 100) return out.subList(0, 100);
        return out;
    }
}

