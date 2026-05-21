package pe.edu.proceso_admision.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "respuestas_detalle")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespuestaDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resultado_id")
    private ResultadoProcesado resultado;

    @Column(name = "numero_pregunta")
    private Integer numeroPregunta;

    @Column(name = "respuesta_alumno", length = 5)
    private String respuestaAlumno;

    @Column(name = "respuesta_clave", length = 5)
    private String respuestaClave;

    @Column(name = "estado", length = 30)
    private String estado;

    @Column(name = "puntaje_obtenido", precision = 10, scale = 3)
    private BigDecimal puntajeObtenido;
}

