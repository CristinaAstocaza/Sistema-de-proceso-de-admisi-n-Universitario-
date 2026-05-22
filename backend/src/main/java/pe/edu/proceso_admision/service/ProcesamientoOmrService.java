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

    @Transactional
    public void procesar(Long procesoId) {
        procesoAdmisionRepository.findById(procesoId).orElseThrow();

        ConfiguracionPuntaje cfg = configuracionPuntajeRepository.findByProcesoId(procesoId).stream().findFirst().orElse(null);
        BigDecimal pCorrecta = cfg != null ? cfg.getPuntajeCorrecta() : BigDecimal.valueOf(20.000);
        BigDecimal pIncorrecta = cfg != null ? cfg.getPuntajeIncorrecta() : BigDecimal.valueOf(-1.125);
        BigDecimal pBlanco = cfg != null ? cfg.getPuntajeBlanco() : BigDecimal.ZERO;

        incidenciaService.eliminarPorProceso(procesoId);
        respuestaDetalleRepository.deleteByResultadoProcesoId(procesoId);
        resultadoProcesadoRepository.deleteByProcesoId(procesoId);
        List<OmrRespuest> respuests = omrRespuestRepository.findByProcesoId(procesoId);

        for (OmrRespuest resp : respuests) {
            OmrIdentifi ident = omrIdentifiRepository.findByProcesoIdAndLitocodigo(procesoId, resp.getLitocodigo()).orElse(null);

            String codigo = ident != null ? ident.getCodigo() : null;
            String temaIdent = ident != null ? ident.getTema() : null;
            String temaResp = resp.getTema();

            if (codigo == null || codigo.isBlank()) {
                incidenciaService.crear(procesoId, resp.getLitocodigo(), codigo, "CODIGO_NO_EXISTE", "No se encontró código en IDENTIFI para litocodigo");
            }

            if ((temaIdent == null || temaIdent.isBlank()) && temaResp != null && !temaResp.isBlank()) {
                incidenciaService.crear(procesoId, resp.getLitocodigo(), codigo, "SIN_TEMA_IDENTIFI", "Identificación sin tema");
            }
            if (temaResp == null || temaResp.isBlank()) {
                incidenciaService.crear(procesoId, resp.getLitocodigo(), codigo, "SIN_TEMA_RESPUEST", "Respuesta sin tema");
            }
            if (temaIdent != null && temaResp != null && !temaIdent.equals(temaResp)) {
                incidenciaService.crear(procesoId, resp.getLitocodigo(), codigo, "TEMA_NO_COINCIDE", "Tema identifi diferente a tema respuest");
            }

            boolean anulado = Boolean.TRUE.equals(resp.getAnulado()) || anulacionRepository
                    .findByProcesoIdAndLitocodigo(procesoId, resp.getLitocodigo()).isPresent();

            if (anulado) {
                incidenciaService.crear(procesoId, resp.getLitocodigo(), codigo, "ANULADO", "Hoja anulada");
            }

            String estado = anulado ? "ANULADO" : "PROCESADO";
            String observacion = anulado ? "Registro anulado" : null;

            OmrClave clave = temaResp != null ? omrClaveRepository.findTopByProcesoIdAndTema(procesoId, temaResp).orElse(null) : null;
            List<String> alumno = normalizar100(resp.getRespuestas());
            List<String> claveL = normalizar100(clave != null ? clave.getRespuestas() : null);

            int correctas = 0, incorrectas = 0, blancas = 0;
            BigDecimal puntaje = BigDecimal.ZERO;

            ResultadoProcesado r = resultadoProcesadoRepository.save(ResultadoProcesado.builder()
                    .proceso(procesoAdmisionRepository.getReferenceById(procesoId))
                    .litocodigo(resp.getLitocodigo())
                    .codigo(codigo)
                    .temaIdentifi(temaIdent)
                    .temaRespuest(temaResp)
                    .respuestasTotal(100)
                    .correctas(0)
                    .incorrectas(0)
                    .blancas(0)
                    .puntaje(BigDecimal.ZERO)
                    .estado(estado)
                    .observacion(observacion)
                    .creadoEn(LocalDateTime.now())
                    .build());

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
                    correctas++;
                } else if (ra == null || ra.isBlank()) {
                    est = "BLANCO";
                    po = pBlanco;
                    blancas++;
                } else if (ra.equalsIgnoreCase(rc)) {
                    est = "CORRECTA";
                    po = pCorrecta;
                    correctas++;
                } else {
                    est = "INCORRECTA";
                    po = pIncorrecta;
                    incorrectas++;
                }

                puntaje = puntaje.add(po);
                respuestaDetalleRepository.save(RespuestaDetalle.builder()
                        .resultado(r)
                        .numeroPregunta(i + 1)
                        .respuestaAlumno(ra)
                        .respuestaClave(rc)
                        .estado(est)
                        .puntajeObtenido(po)
                        .build());
            }

            r.setCorrectas(correctas);
            r.setIncorrectas(incorrectas);
            r.setBlancas(blancas);
            r.setPuntaje(puntaje);
            resultadoProcesadoRepository.save(r);
        }

        reporteFinalService.generar(procesoId);
        auditoriaService.registrar(null, "PROCESAR_OMR", "resultados_procesados", "Procesamiento de proceso_id=" + procesoId);
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

