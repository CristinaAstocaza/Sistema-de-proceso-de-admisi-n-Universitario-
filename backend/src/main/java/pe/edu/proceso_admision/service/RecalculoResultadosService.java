package pe.edu.proceso_admision.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecalculoResultadosService {

    private final ProcesamientoOmrService procesamientoOmrService;

    @Transactional
    public void recalcularProcesoCompleto(Long procesoId) {
        procesamientoOmrService.procesar(procesoId);
    }
}

