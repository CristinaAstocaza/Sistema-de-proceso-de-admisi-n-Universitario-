error id: file:///D:/CURSOS/7MO/Desarrollo_we/proceso_uni/src/main/java/pe/edu/proceso_admision/dto/configuracion/ConfiguracionPuntajeResponseDto.java:java/math/BigDecimal#
file:///D:/CURSOS/7MO/Desarrollo_we/proceso_uni/src/main/java/pe/edu/proceso_admision/dto/configuracion/ConfiguracionPuntajeResponseDto.java
empty definition using pc, found symbol in pc: 
empty definition using semanticdb
empty definition using fallback
non-local guesses:

offset: 304
uri: file:///D:/CURSOS/7MO/Desarrollo_we/proceso_uni/src/main/java/pe/edu/proceso_admision/dto/configuracion/ConfiguracionPuntajeResponseDto.java
text:
```scala
package pe.edu.proceso_admision.dto.configuracion;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ConfiguracionPuntajeResponseDto {
    private Long id;
    private Long procesoId;
    private BigDecimal@@ puntajeCorrecta;
    private BigDecimal puntajeIncorrecta;
    private BigDecimal puntajeBlanco;
    private LocalDateTime creadoEn;
}


```


#### Short summary: 

empty definition using pc, found symbol in pc: 