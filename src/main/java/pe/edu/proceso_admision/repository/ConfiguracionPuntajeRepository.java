package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.ConfiguracionPuntaje;

import java.util.List;

public interface ConfiguracionPuntajeRepository extends JpaRepository<ConfiguracionPuntaje, Long> {
    List<ConfiguracionPuntaje> findByProcesoId(Long procesoId);
}

