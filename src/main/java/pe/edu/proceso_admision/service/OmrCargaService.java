package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.proceso_admision.dto.omr.*;
import pe.edu.proceso_admision.entity.*;
import pe.edu.proceso_admision.repository.*;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OmrCargaService {

    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final OmrIdentifiRepository omrIdentifiRepository;
    private final OmrRespuestRepository omrRespuestRepository;
    private final OmrClaveRepository omrClaveRepository;
    private final ArchivoService archivoService;
    private final AuditoriaService auditoriaService;

    @Transactional
    public void cargarIdentifi(Long procesoId, CargaOmrIdentifiRequestDto request) {
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId).orElseThrow();

        if (request.getIdentificaciones() != null) {
            for (OmrIdentifiCargaDto d : request.getIdentificaciones()) {
                omrIdentifiRepository.save(OmrIdentifi.builder()
                        .proceso(proceso)
                        .litocodigo(d.getLitocodigo())
                        .codigo(d.getCodigo())
                        .tema(d.getTema())
                        .area(d.getArea())
                        .secuencia(d.getSecuencia())
                        .bloque(d.getBloque())
                        .aula(d.getAula())
                        .noCodigo(false).dupCodigo(false).noRespuesta(false).noTema(false).dupLitho(false).coincide(true)
                        .creadoEn(LocalDateTime.now())
                        .build());
            }
            archivoService.registrarCarga(procesoId, "OMR_IDENTIFI", "JSON_IDENTIFI", null);
            auditoriaService.registrar(null, "CARGAR_IDENTIFI", "omr_identifi", "Carga JSON IDENTIFI proceso_id=" + procesoId);
        }
    }

    @Transactional
    public void cargarRespuest(Long procesoId, CargaOmrRespuestRequestDto request) {
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId).orElseThrow();

        if (request.getRespuestas() != null) {
            for (OmrRespuestCargaDto d : request.getRespuestas()) {
                omrRespuestRepository.save(OmrRespuest.builder()
                        .proceso(proceso)
                        .litocodigo(d.getLitocodigo())
                        .tema(d.getTema())
                        .anulado(d.getAnulado() != null ? d.getAnulado() : false)
                        .respuestas(d.getRespuestas())
                        .coincide(true)
                        .creadoEn(LocalDateTime.now())
                        .build());
            }
            archivoService.registrarCarga(procesoId, "OMR_RESPUEST", "JSON_RESPUEST", null);
            auditoriaService.registrar(null, "CARGAR_RESPUEST", "omr_respuest", "Carga JSON RESPUEST proceso_id=" + procesoId);
        }
    }

    @Transactional
    public void cargarClaves(Long procesoId, CargaOmrClaveRequestDto request) {
        ProcesoAdmision proceso = procesoAdmisionRepository.findById(procesoId).orElseThrow();

        if (request.getClaves() != null) {
            for (OmrClaveCargaDto d : request.getClaves()) {
                omrClaveRepository.save(OmrClave.builder()
                        .proceso(proceso)
                        .tema(d.getTema())
                        .area(d.getArea())
                        .respuestas(d.getRespuestas())
                        .creadoEn(LocalDateTime.now())
                        .build());
            }
            archivoService.registrarCarga(procesoId, "OMR_CLAVES", "JSON_CLAVES", null);
            auditoriaService.registrar(null, "CARGAR_CLAVES", "omr_claves", "Carga JSON CLAVES proceso_id=" + procesoId);
        }
    }
}

