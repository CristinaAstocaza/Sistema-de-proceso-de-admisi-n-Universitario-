package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.ProcesoCarrera;

import java.util.List;

public interface ProcesoCarreraRepository extends JpaRepository<ProcesoCarrera, Long> {
    List<ProcesoCarrera> findByProcesoId(Long procesoId);
}

