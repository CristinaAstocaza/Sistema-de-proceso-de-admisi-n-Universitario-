package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.ResultadoProcesado;

import java.util.List;
import java.util.Optional;

public interface ResultadoProcesadoRepository extends JpaRepository<ResultadoProcesado, Long> {
    List<ResultadoProcesado> findByProcesoId(Long procesoId);
    Optional<ResultadoProcesado> findTopByProcesoIdAndCodigo(Long procesoId, String codigo);
    void deleteByProcesoId(Long procesoId);
}

