package pe.edu.proceso_admision.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "omr_respuest")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OmrRespuest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id")
    private ProcesoAdmision proceso;

    @Column(name = "litocodigo", length = 20)
    private String litocodigo;

    @Column(name = "tema", length = 5)
    private String tema;

    @Column(name = "anulado")
    private Boolean anulado;

    @Column(name = "respuestas")
    private String respuestas;

    @Column(name = "coincide")
    private Boolean coincide;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;
}

