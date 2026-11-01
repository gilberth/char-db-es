# Biblioteca de cambio de atuendo de personajes 2D · Versión en español (peinado / atuendo / pose / armado)

<img width="2714" height="1860" alt="Image" src="https://github.com/user-attachments/assets/15a87b09-dedd-47ea-9199-76bdb0b23b08" />

Sitio original: <https://charadb-2fi.pages.dev/> (autora taki AI / [@taki_auto](https://x.com/taki_auto), publicado el 2026-11-01)
Base de esta traducción: <https://github.com/sleepy-zone/char-db-cn> (versión china de sleepy-zone)
Esta es su **interfaz de búsqueda en español**: las 1,027 piezas se conservan, los nombres y las categorías están traducidos al español, y las etiquetas se mantienen en su texto original Danbooru.

## Cómo abrirla

También se puede abrir en local haciendo doble clic en **index.html** (debe estar en el mismo directorio que thumbs/).

- Cuadrícula y filtros: las imágenes usan miniaturas locales, así que funcionan sin conexión
- Al abrir una imagen grande, descargar un original o un lineart: se salta al sitio original de la autora

### Originales locales (opcional)

Si tienes otra copia local de los originales (por defecto en el directorio hermano `../originales-char-db/originals/`, con la estructura `img/<id>.jpg` y `line/<id>.png`),
al abrir con doble clic se leerán primero esos archivos locales y los botones de la ventana cambiarán a «Descargar original (local · 1024×1536)» y «Descargar lineart (local · PNG)», totalmente sin conexión.

La ruta se cambia en **config.js**:

```js
window.LOCAL_ORIGINALS = {
  img: "../originales-char-db/originals/img/",
  line: "../originales-char-db/originals/line/"
};
```

Al abrir con http/https (incluido un sitio publicado) esa configuración se ignora automáticamente y se siguen usando los enlaces del sitio original, así que el repositorio no necesita incluir los originales.

## Descarga de los originales

En la parte superior hay una barra de descarga en paquete, con dos nubes a elegir:

- Baidu Netdisk: <https://pan.baidu.com/s/1HOBVBkWRRPVW1rKmrWt7Fw?pwd=5NR1>
- Quark Netdisk: <https://pan.quark.cn/s/b18c3791645b>

Contenido: 1,027 imágenes originales JPEG (1024×1536) + 281 linearts de pose en PNG, 191 MB en total.

## Qué se puede hacer

- **Cuatro pestañas**: peinado 306 (peinado 230 / color de pelo 20 / color de ojos 19 / accesorios para el pelo 16 / flequillo 12 / forma de pupila 9), atuendo 440 (15 categorías), pose 281 (8 categorías), armado
- **Búsqueda en español / japonés / etiquetas**: escribir «coletas», «ツインテール» o «twintails» da resultados
- **Favoritos**: la ★ en la esquina inferior izquierda de la tarjeta, con el filtro «Solo favoritos»
- **Copiar etiquetas**: un clic copia las etiquetas Danbooru de esa pieza
- **Añadir al armado**: coloca peinado, flequillo, color de pelo, accesorio, ojos, atuendo y pose en 7 ranuras
- **Página de armado**: elige prefijo de calidad (Illustrious, Anima, NovelAI, SDXL/Pony), expresión, encuadre, fondo, complexión y etiquetas adicionales; genera el prompt positivo + negativo en tiempo real, con tres formas de copiarlo
- **Exportar hoja de referencia**: junta las piezas elegidas con canvas en una imagen comparativa numerada (① peinado ② atuendo ③ pose…), descargable o copiable al portapapeles, para enviarla junto con el prompt
- **Lineart**: en las tarjetas de pose que lo tienen, arriba a la derecha se puede cambiar entre «Imagen / Lineart»; el lineart es PNG y se puede usar directamente en ControlNet

## Cómo se arma el prompt

Según la plantilla de la autora en su publicación:

    Prefijo de calidad → 1girl, solo → fila fija (peinado / color de pelo / flequillo / accesorio / ojos / complexión)
    → expresión → atuendo → pose → encuadre → fondo → etiquetas adicionales

- **Fila fija**: en 300 páginas del mismo personaje no se cambia ni una palabra
- **Fila variable**: por imagen se cambian como máximo 3 cosas (atuendo, pose, expresión)
- Si en las etiquetas de la pose aparece 2girls, «1girl, solo» se cambia automáticamente por «2girls, multiple girls»

## Licencia (la del sitio original)

- ✅ Uso gratuito; uso comercial, modificación y referencia dentro de la creación de obras, todo permitido; no exige atribución
- ❌ Prohibido redistribuir, republicar o revender las imágenes en sí (incluidas las de tamaño original y las modificadas)
- ❌ Prohibido usarlas para representar personas reales o menores
- La ropa interior / ropa sugerente, las poses atrevidas y la descarga masiva de originales pertenecen a la «versión especial» de la autora y no están en este repositorio

> Este repositorio solo incluye miniaturas para búsqueda; los originales y los linearts se obtienen siempre desde el sitio original. No los descargues en masa para redistribuirlos.

## Atribución y agradecimientos

Los derechos del material pertenecen a taki AI. Esta versión es solo una interfaz de búsqueda en español para uso personal, basada en la versión china de sleepy-zone, y se entrega tal cual, sin garantía.
