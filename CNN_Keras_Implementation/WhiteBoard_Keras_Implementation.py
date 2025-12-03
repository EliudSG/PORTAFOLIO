# Instrucciones para la creacion de un whiteboard en:
# https://www.freecodecamp.org/news/build-a-whiteboard-app/
# las utilidades fueron cambiadas de acuerdo a las necesidades del proyecto
import tkinter as tk
from tkinter.colorchooser import askcolor
from PIL import Image, ImageDraw, ImageOps
import numpy as np
from tensorflow import keras
import time

def start_drawing(event):
    global is_drawing, prev_x, prev_y
    is_drawing = True
    prev_x, prev_y = event.x, event.y

def draw(event):
    global is_drawing, prev_x, prev_y
    if is_drawing:
        current_x, current_y = event.x, event.y
        canvas.create_line(prev_x, prev_y, current_x, current_y, fill=drawing_color,
                           width=line_width, capstyle=tk.ROUND, smooth=True)
        prev_x, prev_y = current_x, current_y
    save_drawing()

def stop_drawing(event):
    global is_drawing
    is_drawing = False
    predict_number() #aqui lo cambie para que prediga al soltar el mouse (y no al dibujar)

def change_line_width(value):
    global line_width
    line_width = int(value)

def limpiar():
    canvas.delete("all")
    save_drawing()
    prediction_label.config(text="Predicción: ", foreground="black") #un reset de la prediccion

def save_drawing():
    image = Image.new("RGB", (350, 350), "white")
    draw = ImageDraw.Draw(image)
    for item in canvas.find_all():
        coords = canvas.coords(item)
        if len(coords) >= 1:
            draw.line(coords, fill=drawing_color, width=line_width)
    image.save("drawing.png")

def preprocess_image_for_prediction(): 
    """Convierte la imagen al formato que el modelo espera (MNIST-like)."""
    try:
        image = Image.open("drawing.png").convert('L')
        image = ImageOps.invert(image)
        image = image.resize((28, 28), Image.Resampling.LANCZOS)
        image_array = np.array(image) / 255.0
        image_array = image_array.reshape(1, 28, 28, 1)
        return image_array
    except Exception as e:
        print(f"Error en preprocesamiento: {e}")
        return None

def predict_number():
    """Predice el número y muestra el resultado en la etiqueta inferior."""
    try:
        processed = preprocess_image_for_prediction()
        if processed is not None and model is not None:
            time.sleep(0.2)
            prediction = model.predict(processed, verbose=0)
            predicted_number = np.argmax(prediction)
            confidence = np.max(prediction)
            #actualiza el texto y color segun confianza
            prediction_label.config(
                text=f"Predicción: {predicted_number} ({confidence*100:.1f}%)",
                foreground="green" if confidence > 0.7 else "red" #meros colorcitos
            )
        else:
            prediction_label.config(text="Predicción: (sin modelo)", foreground="gray")
    except Exception as e:
        print(f"Error en predicción: {e}")
        prediction_label.config(text="Predicción: Error", foreground="red")

try:
    model = keras.models.load_model("Red_Neuronal.keras")
    print("Modelo cargado correctamente.")
except Exception as e:
    print(f"No se pudo cargar el modelo: {e}")
    model = None

root = tk.Tk()
root.title("Whiteboard con Predicción")

canvas = tk.Canvas(root, bg="white")
canvas.pack(fill="both", expand=True)

is_drawing = False
drawing_color = "black"
line_width = 8

root.geometry("350x400")

controls_frame = tk.Frame(root)
controls_frame.pack(side="top", fill="x")

prediction_frame = tk.Frame(root)
prediction_frame.pack(side="bottom", fill="x", pady=5)

prediction_label = tk.Label(prediction_frame, text="Predicción: ", font=("Arial", 14, "bold"))
prediction_label.pack(pady=5)

clear_button = tk.Button(
    controls_frame, text="Limpiar", background="#C80505",
    foreground="#ffffff", activebackground="#890000",
    activeforeground="#ffffff", command=lambda: limpiar())
clear_button.pack(side="right", padx=8, pady=5)

line_width_label = tk.Label(controls_frame, text="Grosor:")
line_width_label.pack(side="left", padx=5, pady=3)

line_width_slider = tk.Scale(controls_frame, from_=5, to=20,
                             orient="horizontal", fg="#616161",
                             command=lambda val: change_line_width(val))
line_width_slider.set(line_width)
line_width_slider.pack(side="left", padx=5, pady=5)

canvas.bind("<Button-1>", start_drawing)
canvas.bind("<B1-Motion>", draw)
canvas.bind("<ButtonRelease-1>", stop_drawing)

root.mainloop()
