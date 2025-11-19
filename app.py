from flask import Flask, render_template
class Hoja_Punteo:
    def __init__(self):
        self.app=Flask(__name__)
        self.app.add_url_rule('/','home', self.home)
    def home(self):
        return render_template('index.html')
    def run(self):
        self.app.run(host='0.0.0.0', port=8000, debug=True)

if __name__ == '__main__':
    app_instance = Hoja_Punteo()
    app_instance.run()
