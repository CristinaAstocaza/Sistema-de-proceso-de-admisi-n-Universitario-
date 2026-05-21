package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.Facultad;

public interface FacultadRepository extends JpaRepository<Facultad, Long> {
}

