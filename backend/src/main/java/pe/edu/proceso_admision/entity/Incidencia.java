package pe.edu.proceso_admision.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidencias")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Incidencia {

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

    @Column(name = "tipo", length = 100)
    private String tipo;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "estado", length = 30)
    private String estado;

    @Column(name = "decision_admin", length = 100)
    private String decisionAdmin;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;
}

