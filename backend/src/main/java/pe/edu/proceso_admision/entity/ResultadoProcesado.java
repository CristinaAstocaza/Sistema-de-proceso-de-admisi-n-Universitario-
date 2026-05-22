package pe.edu.proceso_admision.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "resultados_procesados")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoProcesado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id")
    private ProcesoAdmision proceso;

    @Column(name = "litocodigo", length = 20)
    private String litocodigo;

    @Column(name = "codigo", length = 10)
    private String codigo;

    @Column(name = "tema_identifi", length = 5)
    private String temaIdentifi;

    @Column(name = "tema_respuest", length = 5)
    private String temaRespuest;

    @Column(name = "respuestas_total")
    private Integer respuestasTotal;

    @Column(name = "correctas")
    private Integer correctas;

    @Column(name = "incorrectas")
    private Integer incorrectas;

    @Column(name = "blancas")
    private Integer blancas;

    @Column(name = "puntaje", precision = 10, scale = 3)
    private BigDecimal puntaje;

    @Column(name = "estado", length = 50)
    private String estado;

    @Column(name = "observacion")
    private String observacion;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;
}

