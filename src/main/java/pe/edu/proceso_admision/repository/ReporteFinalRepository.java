package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.ReporteFinal;

import java.util.List;

public interface ReporteFinalRepository extends JpaRepository<ReporteFinal, Long> {
    List<ReporteFinal> findByProcesoId(Long procesoId);
    List<ReporteFinal> findByProcesoIdAndCarreraId(Long procesoId, Long carreraId);
    java.util.Optional<ReporteFinal> findTopByProcesoIdAndCodigo(Long procesoId, String codigo);
    void deleteByProcesoId(Long procesoId);
}

