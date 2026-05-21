package pe.edu.proceso_admision.dto.omr;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProcesoEstadisticasDto {
    private long totalAlumnosProcesados;
    private long totalExamenesCalificados;
    private long totalObservados;
    private long totalAnulados;
    private long totalIngresantes;
    private long totalNoIngresantes;
    private long totalCarrerasConfiguradas;
    private long totalVacantes;
}

