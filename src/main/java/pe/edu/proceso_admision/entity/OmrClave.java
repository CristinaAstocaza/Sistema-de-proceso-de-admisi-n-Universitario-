package pe.edu.proceso_admision.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "omr_claves")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OmrClave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id")
    private ProcesoAdmision proceso;

    @Column(name = "tema", length = 5)
    private String tema;

    @Column(name = "area", length = 10)
    private String area;

    @Column(name = "respuestas")
    private String respuestas;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;
}

