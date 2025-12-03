# Implementación y Entrenamiento de Modelo CNN

## Entrenamiento

En este proyecto, utilicé un conjunto de datos que contenía cerca de 42 000 imágenes obtenidas a través de Geek for Geeks y guardadas en un archivo CSV. Después de un preprocesamiento que abarcó la normalización y la reestructuración de las imágenes, iniciamos con un modelo MLP como referencia básica; este permitió obtener una referencia inicial, aunque con limitaciones para capturar patrones espaciales complejos.

Para superar estas restricciones, decidí implementar un modelo basado en Convolutional Neural Networks (CNN), aprovechando su capacidad para identificar estructuras locales y jerárquicas en datos visuales.

Este nuevo modelo constaba con distintas capas las cuales fueron:

- Capas convolucionales (Conv2D): Filtros de 3x3 y activaciones ReLU para identificar gradualmente rasgos, desde bordes sencillos hasta patrones más complejos.

- Capas MaxPooling2D: Disminuyen la dimensionalidad conservando rasgos importantes, lo que mejora la eficiencia y reduce el overfitting.

- Capa Flatten: Transforma los mapas de características en un vector para que puedan ser procesados en la capa densa.

-Capas densas (Dense): Combinan la información adquirida y terminan el flujo con una capa de clasificación adaptada a la cantidad de clases en el conjunto de datos.

Se efectuó el entrenamiento con una cantidad controlada de epochs, incorporando métodos para optimizar la estabilidad y generalización del modelo:

Ampliación de datos a través de ImageDataGenerator (zoom, rotación, desplazamiento), esto fue fundamental ya que el dataset contenía números escritos a mano pero en todo momento centradas, derechas y todas a la misma distancia, lo que estorbaba para que el modelo mejorara.

EarlyStopping para evitar el sobreajuste.

ModelCheckpoint para guardar la versión óptima del modelo a lo largo del proceso de entrenamiento.

## Implementación

Esta parte fue realizada por: 
Daniela Leal: https://www.linkedin.com/in/daniela-leal-mx/
Naomi Ortíz: https://www.linkedin.com/in/naomi-ort%C3%ADz-8a9b15338/
Andrea Carolina Alfaro Sánchez

Este proyecto implementa un whiteboard interactivo en Python utilizando tkinter, basado en el tutorial de freeCodeCamp:
“Build a Whiteboard App”.
Tutorial original: https://www.freecodecamp.org/news/build-a-whiteboard-app/

Las utilidades fueron modificadas según las necesidades del proyecto.

El whiteboard permite dibujar a mano alzada y, al soltar el mouse, donde dicha modelo CNN predice automáticamente el número escrito.

Características:

- Dibujar líneas suaves y ajustables en un lienzo tipo whiteboard.

- Guardado automático del dibujo en drawing.png.

- Preprocesamiento de la imagen (invertido, redimensionado y normalizado) para que sea compatible con modelos tipo MNIST.

- Carga automática del modelo Red_Neuronal.keras.

- Predicción inmediata al soltar el mouse, mostrando porcentaje de confianza.

- Botón Limpiar para reiniciar el lienzo y la predicción.

- Control deslizante para cambiar el grosor de la línea.