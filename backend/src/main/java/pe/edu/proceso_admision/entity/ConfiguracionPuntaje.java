package pe.edu.proceso_admision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_puntaje")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionPuntaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_id")
    private ProcesoAdmision proceso;

    @Column(name = "puntaje_correcta", precision = 10, scale = 3)
    private BigDecimal puntajeCorrecta;

    @Column(name = "puntaje_incorrecta", precision = 10, scale = 3)
    private BigDecimal puntajeIncorrecta;

    @Column(name = "puntaje_blanco", precision = 10, scale = 3)
    private BigDecimal puntajeBlanco;

    @Column(name = "creado_en")
    private LocalDateTime creadoEn;
}

