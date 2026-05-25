package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.OmrRespuest;

import java.util.List;
import java.util.Optional;

public interface OmrRespuestRepository extends JpaRepository<OmrRespuest, Long> {
    List<OmrRespuest> findByProcesoId(Long procesoId);
    Optional<OmrRespuest> findTopByProcesoIdAndLitocodigoOrderByCreadoEnDesc(Long procesoId, String litocodigo);
}

