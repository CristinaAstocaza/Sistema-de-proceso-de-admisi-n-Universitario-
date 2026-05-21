package pe.edu.proceso_admision.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "omr_identifi")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OmrIdentifi {

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

    @Column(name = "tema", length = 5)
    private String tema;

    @Column(name = "area", length = 10)
    private String area;

    @Column(name = "secuencia", length = 20)
    private String secuencia;

    @Column(name = "bloque", length = 10)
    private String bloque;

    @Column(name = "aula", length = 20)
    private String aula;

    @Column(name = "no_codigo")
    private Boolean noCodigo;

    @Column(name = "dup_codigo")
    private Boolean dupCodigo;

    @Column(name = "no_respuesta")
    private Boolean noRespuesta;

    @Column(name = "no_tema")
    private Boolean noTema;

    @Column(name = "dup_litho")
    private Boolean dupLitho;

    @Column(name = "coincide")
    private Boolean coincide;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;
}

