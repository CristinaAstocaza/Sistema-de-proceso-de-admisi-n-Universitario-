package pe.edu.proceso_admision.dto.carrera;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CarreraRequestDto {

    @NotNull(message = "facultadId es obligatorio")
    private Long facultadId;

    @NotBlank(message = "El nombre de la carrera es obligatorio")
    @Size(max = 150, message = "El nombre no debe exceder 150 caracteres")
    private String nombre;

    private Boolean activo;
}

