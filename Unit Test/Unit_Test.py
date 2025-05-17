import unittest
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))) #esto es por tenerlo en una subcarpeta
from PIA_FlappyBird_con_Reconocimiento import *

class TestFlappyBird(unittest.TestCase):
    def test_bird(self):
        bird = Bird()
        bird.bump()
        self.assertEqual(bird.speed,-12)#verifica que la velocidad del pajaro es -12
    def test_groundpos(self):
        ground = Ground(150)
        self.assertEqual(ground.rect[0],150)
        self.assertEqual(ground.rect[1],SCREEN_HEIGHT-100)
        #se asegura que el suelo este en la posicion esperada
    def test_randomSize(self):
        pipe, pipe_inverted=randomSize(300)
        self.assertIsInstance(pipe,Pipe)
        self.assertIsInstance(pipe_inverted,Pipe)
        self.assertNotEqual(pipe.rect[1], pipe_inverted.rect[1]) #corrobora que al crearse se creen con sus posiciones correctas
        #(respetando el espacio entre enntre tuberias)

if __name__ == '__main__':
    unittest.main()
