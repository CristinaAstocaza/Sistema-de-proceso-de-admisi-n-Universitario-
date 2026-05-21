package pe.edu.proceso_admision.dto.omr;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AlumnoDetalleDto {
    private String codigo;
    private String nombre;
    private String carrera;
    private String merito;
    private BigDecimal puntaje;
    private String condicion;
    private String estadoInterno;
    private Integer correctas;
    private Integer incorrectas;
    private Integer blancas;
    private String tipoIncidencia;
    private String descripcionIncidencia;
}

