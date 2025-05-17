import pygame, random
from pygame.locals import *
import sys
import math
import cv2
import mediapipe as mp

SCREEN_WIDTH=500
SCREEN_HEIGHT=600
SPEED=12
GRAVITY=2.5
GAME_SPEED=15
GROUND_HEIGHT=100
PIPE_WIDTH=65
PIPE_HEIGHT=475
PIPE_GAP=225

pygame.init() #inicializacion de PYGAME
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT)) #se crea el modelo con los tamaños
pygame.display.set_caption('Flappy Bird') #se le asigna un nombre 
BLUE=(77, 192, 202, 255) #este color fue escogido segun el fondo de la imagen
WHITE=(255, 255, 255) #color de el score
background = pygame.image.load('images/fondoCielo.png')
background = pygame.transform.scale(background, (SCREEN_WIDTH, SCREEN_HEIGHT))
bird = pygame.image.load('images/pajaroTieso.png')
bird = pygame.transform.scale(bird, (34, 24))
pipe_img = pygame.image.load('images/tuberia.png')
pipe_img = pygame.transform.scale(pipe_img, (PIPE_WIDTH, PIPE_HEIGHT))
pipe_inverted_img = pygame.transform.flip(pipe_img, False, True)
grounds = pygame.image.load('images/base.png')
grounds = pygame.transform.scale(grounds, (SCREEN_WIDTH, GROUND_HEIGHT))

#rect[0] posicion de X, rect[1] posicion en y, rect[2] ancho y el 3 para altura
class Bird(pygame.sprite.Sprite):
    def __init__(self):
        pygame.sprite.Sprite.__init__(self)
        self.image = pygame.Surface((34, 24), pygame.SRCALPHA)
        self.image.blit(bird, (0, 0))
        self.speed = 0 
        self.rect = self.image.get_rect() 
        self.rect[0] = SCREEN_WIDTH / 6
        self.rect[1] = SCREEN_HEIGHT / 2
        self.image.convert_alpha()

    def update(self): 
        self.speed += GRAVITY
        self.rect[1] += self.speed

    def bump(self):
        self.speed =-SPEED

#clase para las tuberias
class Pipe(pygame.sprite.Sprite):
    def __init__(self, inverted, xpos, ysize):
        pygame.sprite.Sprite.__init__(self)
        self.image = pygame.Surface((PIPE_WIDTH, PIPE_HEIGHT), pygame.SRCALPHA)
        if inverted:
            self.image.blit(pipe_inverted_img,(0,0)) #si es el de arriba, lo volteamos
        else:
            self.image.blit(pipe_img, (0, 0)) #si es el de abajo, lo dejamos normal
        self.rect = self.image.get_rect()

        self.rect[0] = xpos #posicion horizontal del tubo
        self.passed = False #si ya fue pasado por el pájaro
        if inverted:
            self.rect[1] =-(self.rect[3] -ysize) #posicion vertical para el de arriba
        else:
            self.rect[1] = SCREEN_HEIGHT-ysize  #posicion para el de abajo
    def update(self):
        self.rect[0]-= GAME_SPEED #movemos el tubo hacia la izquierda

#clase para suelo
class Ground(pygame.sprite.Sprite):
    def __init__(self, xpos):
        pygame.sprite.Sprite.__init__(self)
        self.image = pygame.Surface((SCREEN_WIDTH, GROUND_HEIGHT), pygame.SRCALPHA)
        self.image.blit(grounds, (0,0))
        self.rect = self.image.get_rect()
        self.rect[0] =xpos #posicion horizontal
        self.rect[1] = SCREEN_HEIGHT - GROUND_HEIGHT #posicion vertical fija (abajo de todo)

    def update(self):
        self.rect[0] -= GAME_SPEED #movemos el suelo hacia la izquierda
#rect[0] posicion de X, rect[1] posicion en y, rect[2] ancho y rect[3] para altura
#función para saber si un sprite ya salió de la pantalla
def offScreen(sprite):
    return sprite.rect[0] < -(sprite.rect[2]) #si el sprite se va de la pantalla (a la izquierda) lo eliminamos
#genera un par de tubos (arriba y abajo) con espacio entre ellos
def randomSize(xpos):
    size = random.randint(100,300) #altura aleatoria para el de abajo
    pipe = Pipe(False, xpos, size) 
    pipe_inverted =Pipe(True, xpos,SCREEN_HEIGHT - size -PIPE_GAP)#altura del de arriba (restamos el espacio entre los tubos)
    return pipe, pipe_inverted
#clase para el score
class Score(pygame.sprite.Sprite):
    def __init__(self):
        pygame.sprite.Sprite.__init__(self)
        self.score = 0
        self.font = pygame.font.Font(None, 25)
        self.image = pygame.Surface((100, 50), pygame.SRCALPHA) 
        self.rect = self.image.get_rect()
        self.rect.topleft = (5, 5)

    def update(self):
        self.text = self.font.render("SCORE: "+str(int(self.score)), 1, WHITE)
        self.image = self.text

class DetectarManos:
    def __init__(self, mode=False, max_hands=1, detection_confidence=0.5, tracking_confidence=0.5):
        self.mode = mode 
        self.max_hands = max_hands
        self.detection_confidence = detection_confidence
        self.tracking_confidence = tracking_confidence
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=self.mode,
            max_num_hands=self.max_hands,
            min_detection_confidence=self.detection_confidence,
            min_tracking_confidence=self.tracking_confidence
        )
        self.tip = [4, 8]
        self.lista_landmarks = []

    def detectar_manos(self, frame):
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        resultados = self.hands.process(frame_rgb)
        self.lista_landmarks = []

        if resultados.multi_hand_landmarks:
            for hand_landmarks in resultados.multi_hand_landmarks:
                for id in self.tip:
                    lm = hand_landmarks.landmark[id]
                    h, w, _ = frame.shape
                    cx, cy = int(lm.x * w), int(lm.y * h)
                    self.lista_landmarks.append([id, cx, cy])

    def calcular_distancia(self):
        if len(self.lista_landmarks) < 2:
            return float('inf')
        x1, y1 = self.lista_landmarks[0][1:]
        x2, y2 = self.lista_landmarks[1][1:]
        return math.hypot(x2 - x1, y2 - y1)
    
def main():
    bird_group = pygame.sprite.Group()
    bird = Bird()
    bird_group.add(bird)
    ground_group =pygame.sprite.Group()
    for i in range(2):
        ground = Ground(SCREEN_WIDTH *i) #dos suelos, uno detras del otro
        ground_group.add(ground)
    pipe_group = pygame.sprite.Group()
    for i in range(2):
        pipes = randomSize(SCREEN_WIDTH *i+800)#generamos tubos
        pipe_group.add(pipes[0])
        pipe_group.add(pipes[1])
    score = Score()
    score_group = pygame.sprite.Group()
    score_group.add(score)
    clock = pygame.time.Clock()
    game_started = False
    cap = cv2.VideoCapture(0) #abrimos la cámara
    detector =DetectarManos(detection_confidence=0.5, tracking_confidence=0.5) #inicializamos el detector
    while True:
        success, frame = cap.read() #leemos frame de la camara
        if not success:
            print("No se pudo acceder a la camara.")
            break
        detector.detectar_manos(frame)
        distance = detector.calcular_distancia()  # medimos distancia entre dedos
        if distance < 30: #gesto de juntar dedos
            if not game_started:
                game_started =True #empezamos el juego
            bird.bump() #el pajaro salta
        #capturacion de eventos del usuario
        for event in pygame.event.get():
            if event.type == QUIT: #si se cierra la ventana se termina el juego
                pygame.quit()
                cap.release()
                cv2.destroyAllWindows()
                sys.exit()
        screen.fill(BLUE)#asignación de color azul
        screen.blit(background, (0, 0)) #dibujamos fondo
        if game_started:
            bird_group.update()
            ground_group.update()
            pipe_group.update()
            score_group.update()
            if offScreen(ground_group.sprites()[0]): #si un suelo se va, lo reemplazamos
                ground_group.remove(ground_group.sprites()[0])
                new_ground = Ground(SCREEN_WIDTH - 20)
                ground_group.add(new_ground)
            if offScreen(pipe_group.sprites()[0]): #si un tubo se va, generamos nuevos
                pipe_group.remove(pipe_group.sprites()[0])
                pipe_group.remove(pipe_group.sprites()[0])
                pipes = randomSize(SCREEN_WIDTH * 2)
                pipe_group.add(pipes[0])
                pipe_group.add(pipes[1])
            for pipe in pipe_group:
                if pipe.rect[0] + PIPE_WIDTH < bird.rect[0] and not pipe.passed:
                    pipe.passed = True
                    score.score +=0.5 #hice la novatada de incrementar 0.5
            if pygame.sprite.groupcollide(bird_group, pipe_group, False, False) or pygame.sprite.groupcollide(bird_group, ground_group, False, False):
                return #si chocamos con algo se termina el juego
        bird_group.draw(screen)
        pipe_group.draw(screen)
        ground_group.draw(screen)
        score_group.draw(screen)
        pygame.display.update()
        clock.tick(60)#puse mas fps pa ver si mejoraba pero alch no vi mucho cambio supongo que es por la camara
    cv2.destroyAllWindows()
    cap.release()
    pygame.quit()
if __name__ == '__main__':
    main()

#referencias
#links principales
    #https://github.com/LeonMarqs/Flappy-bird-python/tree/master
    #https://www.youtube.com/watch?v=_zjKszdAVG8
    #https://www.youtube.com/watch?v=9bWGFWg7gc8&list=PLjcN1EyupaQkz5Olxzwvo1OzDNaNLGWoJ&index=8

#inspiracion
    #https://www.youtube.com/watch?v=_BjL6W71mWY
    #https://www.youtube.com/watch?v=P93ud6stQAE

#configuracion
    #https://opencv.org/?s=install
    #https://opencv.org/license/
    #https://opencv.org/releases/
    #https://www.python.org/downloads/windows/
    #https://www.youtube.com/watch?v=Kn1HF3oD19c
    #perdi otro link que me ayudo con la instalacion de ciertas librerias
#aprendizaje
    #https://chuoling.github.io/mediapipe/
    #https://acodigo.blogspot.com/2014/03/reconocimiento-facial.html
    #https://acodigo.blogspot.com/2014/03/reconocimiento-facial.html
    #https://www.freepik.es/search?format=search&last_filter=query&last_value=pajaro+pixeleado&query=pajaro+pixeleado
    #ideas originales de diseño https://www.shutterstock.com/es/image-vector/pixel-art-illustration-seagull-pixelated-ocean-2375064085
    #https://www.google.com.mx/search?q=murcielago+pixeleado&sca_esv=dac7d92ae969bbf7&hl=es-419&udm=2&biw=1280&bih=718&ei=BfnxZ6OoFdP6kPIP7af0wAs&ved=0ahUKEwjjvoewv8KMAxVTPUQIHe0THbgQ4dUDCBE&uact=5&oq=murcielago+pixeleado&gs_lp=EgNpbWciFG11cmNpZWxhZ28gcGl4ZWxlYWRvSPZcUABY3FVwA3gAkAEAmAGeAaABzA-qAQQxMC45uAEDyAEA-AEBmAIRoAKbDqgCAMICDhAAGIAEGLEDGIMBGIoFwgIIEAAYgAQYsQPCAgsQABiABBixAxiDAcICBRAAGIAEwgIKEAAYgAQYQxiKBcICDRAAGIAEGLEDGEMYigXCAgQQABgDwgIGEAAYCBgewgIEEAAYHsICBhAAGAoYHpgDA5IHBDQuMTOgB-dJsgcEMy4xM7gHlA4&sclient=img#vhid=S43Kp-5ZbtQApM&vssid=mosaic
    #https://www.spreadshirt.es/shop/design/lindo+murcielago+pixel+art+pegatina-D628d358edd84697cc79b1d78?sellable=jwBj0vDQqlugy3l3ANRb-1459-215
    #formato para los sprites https://www.remove.bg/es/upload
    #https://es.stackoverflow.com/questions/528770/imagen-en-pygame-visual-estudio-code
    #https://docs.python.org/3/tutorial/classes.html
    #https://docs.python.org/es/3/library/__main__.html
    #https://docs.opencv.org/4.x/ (objetivo...seguir aprendiendo)
    #https://programarfacil.com/blog/vision-artificial/deteccion-de-movimiento-con-opencv-python/
    #https://docs.opencv.org/4.x/d1/dfb/intro.html
    #https://www.assemblyai.com/blog/mediapipe-for-dummies (real es para dummes)
    #https://ai.google.dev/edge/mediapipe/solutions/guide?hl=es-419
    #https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker?hl=es-419#configurations_options
    #https://ai.google.dev/edge/mediapipe/solutions/guide?hl=es-419
    #https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/hand_landmarker/python/hand_landmarker.ipynb?hl=es-419#scrollTo=_JVO3rvPD4RN
    #https://www.reddit.com/r/madeinpython/comments/n1fekj/as_a_followup_from_my_previous_post_using_the/?rdt=42380
    #https://www.reddit.com/r/learnmachinelearning/comments/skcr5q/playing_tekken_using_python_code_in_comments/ estos ultimos dos fue mas para aprendizaje general
    #https://github.com/Pawandeep-prog/tekken-python-ml/blob/main/tekken.py
    #https://omes-va.com/mediapipe-hands-python/
    #https://mediapipe.readthedocs.io/en/latest/solutions/hands.html
    #https://omes-va.com/como-segmentar-distintos-objetos-en-una-imagen-mediapipe-deeplab-v3-python/
    