package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.OmrClave;

import java.util.Optional;

public interface OmrClaveRepository extends JpaRepository<OmrClave, Long> {
    Optional<OmrClave> findTopByProcesoIdAndTema(Long procesoId, String tema);
}

