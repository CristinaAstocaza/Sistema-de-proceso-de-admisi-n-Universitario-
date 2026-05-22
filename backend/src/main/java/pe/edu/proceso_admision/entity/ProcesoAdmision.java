package pe.edu.proceso_admision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "procesos_admision")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcesoAdmision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "modalidad", length = 100)
    private String modalidad;

    @Column(name = "periodo", length = 50)
    private String periodo;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "estado", length = 30)
    private String estado;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;
}

