package pe.edu.proceso_admision.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "accion", length = 100)
    private String accion;

    @Column(name = "tabla_afectada", length = 100)
    private String tablaAfectada;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "fecha")
    private LocalDateTime fecha;
}

