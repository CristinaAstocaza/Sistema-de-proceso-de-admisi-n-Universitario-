package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.OmrRespuest;

import java.util.List;

public interface OmrRespuestRepository extends JpaRepository<OmrRespuest, Long> {
    List<OmrRespuest> findByProcesoId(Long procesoId);
}

