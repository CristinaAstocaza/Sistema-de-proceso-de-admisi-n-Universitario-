package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.Anulacion;

import java.util.List;
import java.util.Optional;

public interface AnulacionRepository extends JpaRepository<Anulacion, Long> {
    Optional<Anulacion> findByProcesoIdAndLitocodigo(Long procesoId, String litocodigo);
    List<Anulacion> findByProcesoId(Long procesoId);
}

