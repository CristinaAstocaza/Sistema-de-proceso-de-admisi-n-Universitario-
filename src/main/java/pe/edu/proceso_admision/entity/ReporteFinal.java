package pe.edu.proceso_admision.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reporte_final")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteFinal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id")
    private ProcesoAdmision proceso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrera_id")
    private Carrera carrera;

    @Column(name = "sec", length = 10)
    private String sec;

    @Column(name = "codigo", length = 10)
    private String codigo;

    @Column(name = "nombre_completo", length = 200)
    private String nombreCompleto;

    @Column(name = "puntaje", precision = 10, scale = 3)
    private BigDecimal puntaje;

    @Column(name = "merito", length = 10)
    private String merito;

    @Column(name = "condicion", length = 30)
    private String condicion;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;
}

