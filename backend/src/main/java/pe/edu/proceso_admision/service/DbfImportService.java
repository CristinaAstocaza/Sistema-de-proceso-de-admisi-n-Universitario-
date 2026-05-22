package pe.edu.proceso_admision.service;

import com.linuxense.javadbf.DBFField;
import com.linuxense.javadbf.DBFReader;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.proceso_admision.dto.omr.CargaOmrClaveRequestDto;
import pe.edu.proceso_admision.dto.omr.CargaOmrIdentifiRequestDto;
import pe.edu.proceso_admision.dto.omr.CargaOmrRespuestRequestDto;
import pe.edu.proceso_admision.dto.omr.OmrClaveCargaDto;
import pe.edu.proceso_admision.dto.omr.OmrIdentifiCargaDto;
import pe.edu.proceso_admision.dto.omr.OmrRespuestCargaDto;
import pe.edu.proceso_admision.exception.BusinessException;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Service
public class DbfImportService {

    public CargaOmrIdentifiRequestDto parsearIdentifi(MultipartFile archivo) {
        validarArchivoDbf(archivo);
        try (InputStream input = archivo.getInputStream()) {
            DBFReader reader = new DBFReader(input);
            ColumnasDbf columnas = construirIndices(reader);
            System.out.println("[DBF][IDENTIFI] Columnas detectadas: " + columnas.reales);
            exigirColumnas(columnas, List.of("LITOCODIGO", "CODIGO", "TEMA", "AREA", "SECUENCIA", "BLOQUE"), false);

            List<OmrIdentifiCargaDto> items = new ArrayList<>();
            Object[] fila;
            while ((fila = reader.nextRecord()) != null) {
                if (filaVacia(fila)) continue;
                OmrIdentifiCargaDto dto = new OmrIdentifiCargaDto();
                dto.setLitocodigo(valor(fila, columnas.indices, "LITOCODIGO"));
                dto.setCodigo(valor(fila, columnas.indices, "CODIGO"));
                dto.setTema(valor(fila, columnas.indices, "TEMA"));
                dto.setArea(valor(fila, columnas.indices, "AREA"));
                dto.setSecuencia(valor(fila, columnas.indices, "SECUENCIA"));
                dto.setBloque(valor(fila, columnas.indices, "BLOQUE"));
                dto.setAula(valor(fila, columnas.indices, "AULA"));
                items.add(dto);
            }

            CargaOmrIdentifiRequestDto request = new CargaOmrIdentifiRequestDto();
            request.setIdentificaciones(items);
            return request;
        } catch (IOException e) {
            throw new BusinessException("No se pudo leer el archivo DBF IDENTIFI");
        } catch (Exception e) {
            throw new BusinessException("Error parseando DBF IDENTIFI: " + e.getMessage());
        }
    }

    public CargaOmrRespuestRequestDto parsearRespuest(MultipartFile archivo) {
        validarArchivoDbf(archivo);
        try (InputStream input = archivo.getInputStream()) {
            DBFReader reader = new DBFReader(input);
            ColumnasDbf columnas = construirIndices(reader);
            System.out.println("[DBF][RESPUEST] Columnas detectadas: " + columnas.reales);
            exigirColumnas(columnas, List.of("LITOCODIGO", "TEMA", "RESPUESTAS"), true);

            List<OmrRespuestCargaDto> items = new ArrayList<>();
            Object[] fila;
            while ((fila = reader.nextRecord()) != null) {
                if (filaVacia(fila)) continue;
                OmrRespuestCargaDto dto = new OmrRespuestCargaDto();
                dto.setLitocodigo(valor(fila, columnas.indices, "LITOCODIGO"));
                dto.setTema(valor(fila, columnas.indices, "TEMA"));
                dto.setAnulado(parseBooleano(valor(fila, columnas.indices, "ANULADO")));
                String respuestas = valor(fila, columnas.indices, "RESPUESTAS");
                if (respuestas == null) {
                    respuestas = construirRespuestasDesdePreguntas(fila, columnas.indices);
                }
                dto.setRespuestas(respuestas);
                items.add(dto);
            }

            CargaOmrRespuestRequestDto request = new CargaOmrRespuestRequestDto();
            request.setRespuestas(items);
            return request;
        } catch (IOException e) {
            throw new BusinessException("No se pudo leer el archivo DBF RESPUEST");
        } catch (Exception e) {
            throw new BusinessException("Error parseando DBF RESPUEST: " + e.getMessage());
        }
    }

    public CargaOmrClaveRequestDto parsearClaves(MultipartFile archivo) {
        validarArchivoDbf(archivo);
        try (InputStream input = archivo.getInputStream()) {
            DBFReader reader = new DBFReader(input);
            ColumnasDbf columnas = construirIndices(reader);
            System.out.println("[DBF][CLAVES] Columnas detectadas: " + columnas.reales);
            exigirColumnas(columnas, List.of("TEMA", "AREA", "RESPUESTAS"), true);

            List<OmrClaveCargaDto> items = new ArrayList<>();
            Object[] fila;
            while ((fila = reader.nextRecord()) != null) {
                if (filaVacia(fila)) continue;
                OmrClaveCargaDto dto = new OmrClaveCargaDto();
                dto.setTema(valor(fila, columnas.indices, "TEMA"));
                dto.setArea(valor(fila, columnas.indices, "AREA"));
                String respuestas = valor(fila, columnas.indices, "RESPUESTAS");
                if (respuestas == null) {
                    respuestas = construirRespuestasDesdePreguntas(fila, columnas.indices);
                }
                dto.setRespuestas(respuestas);
                items.add(dto);
            }

            CargaOmrClaveRequestDto request = new CargaOmrClaveRequestDto();
            request.setClaves(items);
            return request;
        } catch (IOException e) {
            throw new BusinessException("No se pudo leer el archivo DBF CLAVES");
        } catch (Exception e) {
            throw new BusinessException("Error parseando DBF CLAVES: " + e.getMessage());
        }
    }

    private void validarArchivoDbf(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new BusinessException("Debe adjuntar un archivo DBF no vacío");
        }
        String nombre = Optional.ofNullable(archivo.getOriginalFilename()).orElse("").toLowerCase();
        if (!nombre.endsWith(".dbf")) {
            throw new BusinessException("El archivo debe tener extensión .dbf");
        }
    }

    private ColumnasDbf construirIndices(DBFReader reader) {
        Map<String, Integer> indices = new HashMap<>();
        List<String> reales = new ArrayList<>();
        int count = reader.getFieldCount();
        for (int i = 0; i < count; i++) {
            DBFField f = reader.getField(i);
            String original = f.getName();
            reales.add(original);
            String normal = normalizarCabecera(original);
            String canonica = canonizarCabecera(normal);
            indices.putIfAbsent(canonica, i);
        }
        return new ColumnasDbf(indices, reales);
    }

    private void exigirColumnas(ColumnasDbf columnas, List<String> requeridas, boolean permitirPreguntasParaRespuestas) {
        List<String> faltantes = requeridas.stream().filter(c -> !columnas.indices.containsKey(c)).toList();
        if (permitirPreguntasParaRespuestas && faltantes.contains("RESPUESTAS") && tienePreguntas(columnas.indices)) {
            faltantes = faltantes.stream().filter(c -> !"RESPUESTAS".equals(c)).toList();
        }
        if (!faltantes.isEmpty()) {
            throw new BusinessException("Columnas faltantes en DBF: " + String.join(", ", faltantes)
                    + ". Columnas detectadas: " + String.join(", ", columnas.reales));
        }
    }

    private boolean tienePreguntas(Map<String, Integer> indices) {
        for (int i = 1; i <= 100; i++) {
            if (indices.containsKey(String.format("PREG%03d", i))) {
                return true;
            }
        }
        return false;
    }

    private String construirRespuestasDesdePreguntas(Object[] fila, Map<String, Integer> indices) {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 100; i++) {
            String key = String.format("PREG%03d", i);
            Integer idx = indices.get(key);
            if (idx == null || idx < 0 || idx >= fila.length) continue;
            Object v = fila[idx];
            String s = v == null ? "" : String.valueOf(v).trim();
            sb.append(s.isEmpty() ? "-" : s);
        }
        return sb.length() == 0 ? null : sb.toString();
    }

    private String valor(Object[] fila, Map<String, Integer> indices, String campoCanonico) {
        Integer idx = indices.get(campoCanonico);
        if (idx == null || idx < 0 || idx >= fila.length) return null;
        Object v = fila[idx];
        if (v == null) return null;
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? null : s;
    }

    private Boolean parseBooleano(String texto) {
        if (texto == null) return false;
        String t = texto.trim().toUpperCase();
        return Set.of("1", "S", "SI", "Y", "YES", "TRUE", "T", "X").contains(t);
    }

    private boolean filaVacia(Object[] fila) {
        for (Object v : fila) {
            if (v != null && !String.valueOf(v).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private String normalizarCabecera(String nombre) {
        if (nombre == null) return "";
        return nombre.toUpperCase(Locale.ROOT)
                .replace("_", "")
                .replace("-", "")
                .replace(" ", "")
                .replace(",", "")
                .replace(";", "")
                .replace(".", "");
    }

    private String canonizarCabecera(String n) {
        if (n.startsWith("PREG")) {
            String digitos = n.replaceAll("[^0-9]", "");
            if (!digitos.isEmpty()) {
                int nro = Integer.parseInt(digitos);
                if (nro >= 1 && nro <= 100) {
                    return String.format("PREG%03d", nro);
                }
            }
        }
        return switch (n) {
            case "LITOCODIGO", "LITHOCODIGO", "LITOCDIGO", "LITHO", "LITHOC6", "LITHOCOD" -> "LITOCODIGO";
            case "CODIGO", "CODALUMNO", "ALUMNOCODIGO" -> "CODIGO";
            case "TEMA", "TEM" -> "TEMA";
            case "AREA", "ARE" -> "AREA";
            case "SECUENCIA", "SECUEN" -> "SECUENCIA";
            case "BLOQUE", "BLOQ" -> "BLOQUE";
            case "AULA", "SALON" -> "AULA";
            case "ANULADO", "ANULA", "ANUL" -> "ANULADO";
            case "RESPUESTAS", "RESPUESTA", "RESPUEST", "RPTAS" -> "RESPUESTAS";
            default -> n;
        };
    }

    private record ColumnasDbf(Map<String, Integer> indices, List<String> reales) {}
}

