package pe.edu.proceso_admision.mapper;

import pe.edu.proceso_admision.dto.omr.IncidenciaResponseDto;
import pe.edu.proceso_admision.dto.omr.ReporteFinalDto;
import pe.edu.proceso_admision.dto.omr.ResultadoProcesadoDto;
import pe.edu.proceso_admision.entity.Incidencia;
import pe.edu.proceso_admision.entity.ReporteFinal;
import pe.edu.proceso_admision.entity.ResultadoProcesado;

public class OmrMapper {

    private OmrMapper() {}

    public static ResultadoProcesadoDto toResultadoDto(ResultadoProcesado e) {
        return ResultadoProcesadoDto.builder()
                .id(e.getId())
                .litocodigo(e.getLitocodigo())
                .codigo(e.getCodigo())
                .correctas(e.getCorrectas())
                .incorrectas(e.getIncorrectas())
                .blancas(e.getBlancas())
                .puntaje(e.getPuntaje())
                .estado(e.getEstado())
                .observacion(e.getObservacion())
                .build();
    }

    public static IncidenciaResponseDto toIncidenciaDto(Incidencia e) {
        return IncidenciaResponseDto.builder()
                .id(e.getId())
                .litocodigo(e.getLitocodigo())
                .codigo(e.getCodigo())
                .tipo(e.getTipo())
                .descripcion(e.getDescripcion())
                .estado(e.getEstado())
                .decisionAdmin(e.getDecisionAdmin())
                .creadoEn(e.getCreadoEn())
                .build();
    }

    public static ReporteFinalDto toReporteDto(ReporteFinal e) {
        return ReporteFinalDto.builder()
                .id(e.getId())
                .carreraId(e.getCarrera() != null ? e.getCarrera().getId() : null)
                .sec(e.getSec())
                .codigo(e.getCodigo())
                .nombreCompleto(e.getNombreCompleto())
                .puntaje(e.getPuntaje())
                .merito(e.getMerito())
                .condicion(e.getCondicion())
                .build();
    }
}

