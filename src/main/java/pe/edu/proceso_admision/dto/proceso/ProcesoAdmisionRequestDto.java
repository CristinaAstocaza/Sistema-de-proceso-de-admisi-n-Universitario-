package pe.edu.proceso_admision.dto.proceso;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProcesoAdmisionRequestDto {

    @NotBlank(message = "nombre es obligatorio")
    @Size(max = 150, message = "nombre no debe exceder 150 caracteres")
    private String nombre;

    @Size(max = 100, message = "modalidad no debe exceder 100 caracteres")
    private String modalidad;

    @Size(max = 50, message = "periodo no debe exceder 50 caracteres")
    private String periodo;

    private String descripcion;

    @Size(max = 30, message = "estado no debe exceder 30 caracteres")
    private String estado;
}

