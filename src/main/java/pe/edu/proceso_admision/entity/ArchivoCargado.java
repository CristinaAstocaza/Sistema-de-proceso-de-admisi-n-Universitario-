package pe.edu.proceso_admision.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "archivos_cargados")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoCargado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id")
    private ProcesoAdmision proceso;

    @Column(name = "tipo_archivo", length = 50)
    private String tipoArchivo;

    @Column(name = "nombre_archivo", length = 255)
    private String nombreArchivo;

    @Column(name = "fecha_carga")
    private LocalDateTime fechaCarga;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cargado_por")
    private Usuario cargadoPor;
}

