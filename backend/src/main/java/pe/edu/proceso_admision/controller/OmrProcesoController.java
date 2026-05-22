package pe.edu.proceso_admision.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.proceso_admision.dto.omr.*;
import pe.edu.proceso_admision.entity.Anulacion;
import pe.edu.proceso_admision.repository.AnulacionRepository;
import pe.edu.proceso_admision.repository.ProcesoAdmisionRepository;
import pe.edu.proceso_admision.repository.UsuarioRepository;
import pe.edu.proceso_admision.service.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class OmrProcesoController {

    private final OmrCargaService omrCargaService;
    private final ProcesamientoOmrService procesamientoOmrService;
    private final ReporteFinalService reporteFinalService;
    private final OmrConsultaService omrConsultaService;
    private final IncidenciaService incidenciaService;
    private final DbfImportService dbfImportService;
    private final AnulacionRepository anulacionRepository;
    private final ProcesoAdmisionRepository procesoAdmisionRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    @PostMapping("/api/procesos/{id}/cargar-identifi")
    @ResponseStatus(HttpStatus.CREATED)
    public void cargarIdentifi(@PathVariable("id") Long procesoId,
                               @RequestBody CargaOmrIdentifiRequestDto request) {
        omrCargaService.cargarIdentifi(procesoId, request);
    }

    @PostMapping(value = "/api/procesos/{id}/upload-identifi-dbf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public void uploadIdentifiDbf(@PathVariable("id") Long procesoId,
                                  @RequestParam("archivo") MultipartFile archivo) {
        CargaOmrIdentifiRequestDto request = dbfImportService.parsearIdentifi(archivo);
        omrCargaService.cargarIdentifi(procesoId, request);
    }

    @PostMapping("/api/procesos/{id}/cargar-respuest")
    @ResponseStatus(HttpStatus.CREATED)
    public void cargarRespuest(@PathVariable("id") Long procesoId,
                               @RequestBody CargaOmrRespuestRequestDto request) {
        omrCargaService.cargarRespuest(procesoId, request);
    }

    @PostMapping(value = "/api/procesos/{id}/upload-respuest-dbf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public void uploadRespuestDbf(@PathVariable("id") Long procesoId,
                                  @RequestParam("archivo") MultipartFile archivo) {
        CargaOmrRespuestRequestDto request = dbfImportService.parsearRespuest(archivo);
        omrCargaService.cargarRespuest(procesoId, request);
    }

    @PostMapping("/api/procesos/{id}/cargar-claves")
    @ResponseStatus(HttpStatus.CREATED)
    public void cargarClaves(@PathVariable("id") Long procesoId,
                             @RequestBody CargaOmrClaveRequestDto request) {
        omrCargaService.cargarClaves(procesoId, request);
    }

    @PostMapping(value = "/api/procesos/{id}/upload-claves-dbf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public void uploadClavesDbf(@PathVariable("id") Long procesoId,
                                @RequestParam("archivo") MultipartFile archivo) {
        CargaOmrClaveRequestDto request = dbfImportService.parsearClaves(archivo);
        omrCargaService.cargarClaves(procesoId, request);
    }

    @PostMapping("/api/procesos/{id}/procesar")
    public void procesar(@PathVariable("id") Long procesoId) {
        procesamientoOmrService.procesar(procesoId);
    }

    @PostMapping("/api/procesos/{id}/generar-reporte")
    public void generarReporte(@PathVariable("id") Long procesoId) {
        reporteFinalService.generar(procesoId);
    }

    @GetMapping("/api/procesos/{id}/resultados")
    public List<ResultadoProcesadoDto> resultados(@PathVariable("id") Long procesoId) {
        return procesamientoOmrService.listarResultados(procesoId);
    }

    @GetMapping("/api/procesos/{id}/estadisticas")
    public ProcesoEstadisticasDto estadisticas(@PathVariable("id") Long procesoId) {
        return omrConsultaService.obtenerEstadisticas(procesoId);
    }

    @GetMapping("/api/procesos/{id}/alumnos/{codigo}/detalle")
    public AlumnoDetalleDto detalleAlumno(@PathVariable("id") Long procesoId,
                                          @PathVariable("codigo") String codigo) {
        return omrConsultaService.obtenerDetalleAlumno(procesoId, codigo);
    }

    @GetMapping("/api/procesos/{id}/reporte-final")
    public List<ReporteFinalDto> reporteFinal(@PathVariable("id") Long procesoId) {
        return reporteFinalService.listar(procesoId);
    }

    @GetMapping("/api/procesos/{id}/reporte-final/carrera/{carreraId}")
    public List<ReporteFinalDto> reporteFinalPorCarrera(@PathVariable("id") Long procesoId,
                                                        @PathVariable("carreraId") Long carreraId) {
        return reporteFinalService.listarPorCarrera(procesoId, carreraId);
    }

    @GetMapping("/api/procesos/{id}/incidencias")
    public List<IncidenciaResponseDto> incidencias(@PathVariable("id") Long procesoId) {
        return incidenciaService.listarPorProceso(procesoId);
    }

    @PostMapping("/api/incidencias/{id}/resolver")
    public IncidenciaResponseDto resolver(@PathVariable("id") Long incidenciaId,
                                          @RequestBody ResolverIncidenciaRequestDto request) {
        return incidenciaService.resolver(incidenciaId, request);
    }

    @PostMapping("/api/procesos/{id}/alumnos/{codigo}/anular")
    public void anularAlumno(@PathVariable("id") Long procesoId,
                             @PathVariable("codigo") String codigo,
                             @RequestBody AnularAlumnoRequestDto request) {
        omrConsultaService.anularAlumno(procesoId, codigo, request.getMotivo());
        auditoriaService.registrar(null,
                "ANULAR_ALUMNO",
                "anulaciones",
                "proceso_id=" + procesoId + " codigo=" + codigo + " motivo=" + request.getMotivo());
    }

    @GetMapping("/api/auditoria")
    public List<AuditoriaResponseDto> auditoria(@RequestParam(value = "procesoId", required = false) Long procesoId,
                                                @RequestParam(value = "codigo", required = false) String codigo,
                                                @RequestParam(value = "accion", required = false) String accion,
                                                @RequestParam(value = "fechaInicio", required = false) LocalDateTime fechaInicio,
                                                @RequestParam(value = "fechaFin", required = false) LocalDateTime fechaFin) {
        return omrConsultaService.listarAuditoria(procesoId, codigo, accion, fechaInicio, fechaFin);
    }

    @GetMapping("/api/procesos/{id}/exportar-excel")
    public ExportacionResponseDto exportarExcel(@PathVariable("id") Long procesoId) {
        reporteFinalService.validarExportacion(procesoId);
        return ExportacionResponseDto.builder()
                .tipo("EXCEL")
                .mensaje("Exportación Excel pendiente de implementación")
                .build();
    }

    @GetMapping("/api/procesos/{id}/exportar-pdf")
    public ExportacionResponseDto exportarPdf(@PathVariable("id") Long procesoId) {
        reporteFinalService.validarExportacion(procesoId);
        return ExportacionResponseDto.builder()
                .tipo("PDF")
                .mensaje("Exportación PDF pendiente de implementación")
                .build();
    }

    @PostMapping("/api/anulaciones")
    @ResponseStatus(HttpStatus.CREATED)
    public void crearAnulacion(@RequestBody AnulacionRequestDto request) {
        Anulacion a = Anulacion.builder()
                .proceso(procesoAdmisionRepository.getReferenceById(request.getProcesoId()))
                .codigo(request.getCodigo())
                .litocodigo(request.getLitocodigo())
                .motivo(request.getMotivo())
                .anuladoPor(request.getAnuladoPor() != null ? usuarioRepository.getReferenceById(request.getAnuladoPor()) : null)
                .creadoEn(java.time.LocalDateTime.now())
                .build();
        anulacionRepository.save(a);
        auditoriaService.registrar(request.getAnuladoPor(), "CREAR_ANULACION", "anulaciones", "Anulación litocodigo=" + request.getLitocodigo());
    }
}

