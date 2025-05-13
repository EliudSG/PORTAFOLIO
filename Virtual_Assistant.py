import os
from openai import OpenAI
from dotenv import load_dotenv
import requests #lo integre del codigo del pelon, es para la comunicacion con el server
load_dotenv(".env") #cargar variables de entorno desde el archivo .env esto gracias al profe, nota: NO subir el .env a git
class GPT: #clase GPT para interactuar con la API de OpenAI
    def __init__(self):
        api_key =os.getenv("OPENAI_API_KEY") #meras excepciones
        if not api_key:
            raise ValueError("no encontrada la AK en .env")
        self.AK =OpenAI(api_key=api_key) # Inicializa la API de OpenAI con la clave de API
    def pedir_respuesta(self, texto):
        try:
            response = self.AK.chat.completions.create( #(endpoint) genera una respuesta  utilizando el modelo de chat
                model="gpt-4o-mini",#nota, inicalmente usaba el modelo 3.5 turbo, pero en potencia este es mucho mejor y su precio tambien
                messages=[
                    {"role": "system", "content": "Eres un asistente muy amable"}, #lo deje como una personalidad grosera me parecio bien divertido
                    {"role": "user", "content": texto}
                ],
            )
            return response.choices[0].message.content.strip()#retorna la respuesta que se encuentra, y strip en dif partes lo vi que lo agregaron
        #es para eliminiar  cualquier espacio al principio o final
        except Exception as e:
            print(f"Error en GPT: {str(e)}")
            return f"No se pudo responder: {str(e)}"

class Transcriptor:
    def __init__(self):
        self.AK =OpenAI()
        self.gpt =GPT() #inicializa (instancia) de openai (el api) y la clase GPT

    def T_audio(self, audio): 
        caudio = "temp_audio.webm"
        try:
            audio.save(caudio) #se puso en una excepcion por si las moscas de que no se guardo
            #guarda el contenido del audio
            if not os.path.exists(caudio): #aca verifica que si existe o no
                raise ValueError("No se pudo Guardar")
            with open(caudio, "rb") as f:
                trans=self.AK.audio.transcriptions.create(#empieza la transcripcion con whisper 
                    model="whisper-1",
                    file=f 
                )
            texto = trans.text.strip()#obtiene la respuestas que se mando desde el api
            if not texto:
                raise ValueError("No se hablo en el audio") #por si no dijiste nada
            res = self.gpt.pedir_respuesta(texto) #aqui se manda a llamar el metodo de respuesta por parte de la clase GPT
            tts = TTS() #inicializacion del tss
            audio_path = tts.process(res)
            return {
                "transcripcion": texto,
                "respuesta": res,
                "audio_path": f"/static/{audio_path}"
            }
        except Exception as e:
            print(f"Error en transcribir: {str(e)}")
            return {
                "transcripcion": "",
                "respuesta": f"Error: {str(e)}"
            }

class TTS: 
    def __init__(self):
        self.key=os.getenv('ELEVENLABS_API_KEY') #se saca el api key
    def process(self, text): 
        CHUNK_SIZE = 1024
        url = "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL"
        headers = { 
            "Accept": "audio/mpeg",#respuesta de mp3
            "Content-Type": "application/json",#se manda en un formato JSON
            "xi-api-key": self.key#esto es la autentificacion
        }
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v1", #usar modelo de voz  (recordando quue solo tengo 10 mil por mes)
            "voice_settings": {
                "stability": 0.55, #estabilidad de la voz
                "similarity_boost": 0.55 #ajuste para que la voz suene mas similar
            }
        }
        nomFile="response.mp3" #nombre del archivo en donde se guarda la res
        response=requests.post(url,json=data, headers=headers) #
        with open(os.path.join("static",nomFile),'wb') as f:
            for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                if chunk: #es para manejar mejores respuestas evitando con la iteracion que se pierdan datos
                    f.write(chunk)
        return nomFile #devuelve el arhcivo

#REFERENCIAS: 
#INSPIRACIONES
    #https://www.youtube.com/watch?v=-0tIy8wWtzE&t=238s
    #https://github.com/ringa-tech/asistente-virtual/blob/main/app.py
#Aprendizaje
    #NOTA: Pueda que en algunas se requiera autentificacion
    #https://platform.openai.com/docs/api-reference/responses-streaming/response/completed
    #https://www.youtube.com/watch?v=10LaFGaNVHw
    #https://www.quora.com/How-do-I-use-HTML-and-CSS-in-Visual-Studio-Code
    #https://www.youtube.com/watch?v=MJkdaVFHrto
    #https://code.visualstudio.com/docs/languages/html
    #https://www.programoergosum.es/tutoriales/servidor-web-con-flask-en-raspberry-pi/
    #https://www.toolify.ai/es/ai-news-es/cmo-ocultar-tus-claves-de-api-983838
    #https://getbootstrap.com/docs/5.3/utilities/flex/ (inicialmente lo usaba)
    #https://developer.mozilla.org/es/docs/Web/CSS
    #https://www.w3schools.com/css/css_examples.asp
    #https://developer.mozilla.org/es/docs/Learn_web_development/Core/Styling_basics/Box_model
    #https://joanleon.dev/posts/transiciones-css/
    #https://www.youtube.com/watch?v=wZniZEbPAzk
    #https://openai.com/es-419/index/whisper/
    #https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Classes
    #https://jsdoc.app/
    #https://www.youtube.com/watch?v=QoC4RxNIs5M
    #https://docs.python.org/es/3/tutorial/classes.html
    #https://www.youtube.com/watch?v=VYXdpjCZojA
    #https://www.youtube.com/watch?v=6dE57aXaChg
    #https://code.visualstudio.com/docs/languages/javascript
    #https://www.freecodecamp.org/espanol/news/como-enlazar-a-un-documento-javascript-en-html/
    #https://developer.mozilla.org/es/docs/Web/API/MediaDevices/getUserMedia
    #https://www.youtube.com/watch?v=DeRxvsHX2_I
    #https://www.youtube.com/watch?v=Y21OR1OPC9A
    #https://www.youtube.com/watch?v=IvX0uGBzsyY
    #https://docs.python.org/es/3/library/os.html
    #https://www.youtube.com/watch?v=GTZxX44N4ng
    #https://elevenlabs.io/app/subscription
    #https://www.youtube.com/watch?v=9wnVT0i-icY
    #https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
    #https://developer.mozilla.org/es/docs/Web/API/FormData
#PAGINAS EXTERNAS DE SOPORTE
    #https://openai.com/api/
    #https://fontawesome.com/icons/microphone?f=classic&s=solid
    #
#APIS
    #https://platform.openai.com/docs/api-reference/responses-streaming/response/completed
    #https://elevenlabs.io/app/subscription
    #https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
    #MODELO
        #https://platform.openai.com/docs/models/gpt-4o-mini
        #https://platform.openai.com/docs/models/whisper-1
    #OPCIONES EXTRAS EN SUSTITUCION A LOS MODELOS
        #https://platform.openai.com/docs/models/gpt-3.5-turbo 
#COMPLEMENTOS
    #https://fontawesome.com/icons/microphone?f=classic&s=solid
    