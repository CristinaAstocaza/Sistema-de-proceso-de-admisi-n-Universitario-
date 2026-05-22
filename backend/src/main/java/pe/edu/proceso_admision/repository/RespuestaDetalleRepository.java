package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.RespuestaDetalle;

public interface RespuestaDetalleRepository extends JpaRepository<RespuestaDetalle, Long> {
    void deleteByResultadoProcesoId(Long procesoId);
}

