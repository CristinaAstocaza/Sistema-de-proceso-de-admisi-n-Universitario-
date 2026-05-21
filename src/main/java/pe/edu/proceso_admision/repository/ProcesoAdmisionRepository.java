package pe.edu.proceso_admision.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.proceso_admision.entity.ProcesoAdmision;

public interface ProcesoAdmisionRepository extends JpaRepository<ProcesoAdmision, Long> {
}

