
from flask import Flask
from flask_cors import CORS

from config import config
from database import mysql
from blueprints.pedidos.routes import pedidos_bp

app = Flask(__name__)

# Configuración de la base de datos
app.config.from_object(config['development'])

# Permitir conexiones desde Angular
CORS(app)

# Inicializar la instancia compartida de MySQL
mysql.init_app(app)

# Registrar Blueprint
app.register_blueprint(pedidos_bp)


def pagina_no_encontrada(error):
    return "<h1>Página no encontrada</h1>", 404


app.register_error_handler(404, pagina_no_encontrada)


if __name__ == '__main__':
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=False
    )
