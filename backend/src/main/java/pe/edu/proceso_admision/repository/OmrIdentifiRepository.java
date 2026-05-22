package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.OmrIdentifi;

import java.util.List;
import java.util.Optional;

public interface OmrIdentifiRepository extends JpaRepository<OmrIdentifi, Long> {
    List<OmrIdentifi> findByProcesoId(Long procesoId);
    Optional<OmrIdentifi> findByProcesoIdAndLitocodigo(Long procesoId, String litocodigo);
}

