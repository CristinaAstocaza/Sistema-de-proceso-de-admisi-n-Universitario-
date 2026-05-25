package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.Incidencia;

import java.util.List;
import java.util.Optional;

public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {
    List<Incidencia> findByProcesoId(Long procesoId);
    Optional<Incidencia> findTopByProcesoIdAndCodigoOrderByCreadoEnDesc(Long procesoId, String codigo);
    List<Incidencia> findByProcesoIdAndCodigo(Long procesoId, String codigo);
    boolean existsByProcesoIdAndLitocodigoAndTipoAndEstado(Long procesoId, String litocodigo, String tipo, String estado);
    void deleteByProcesoIdAndEstadoNot(Long procesoId, String estado);
    void deleteByProcesoId(Long procesoId);
}

