import traceback
from flask import Blueprint, jsonify, request

from database import mysql
 
pedidos_bp = Blueprint(

    'pedidos',

    __name__,

    url_prefix = '/api/pedidos'

)
 
def fila_a_diccionario(cursor, fila):

    columnas = [columna[0] for columna in cursor.description]

    return dict(zip(columnas, fila))
 
# 1. Listar todos los pedidos generales (Ventas acumuladas)

@pedidos_bp.route('/', methods=['GET'])

def listar_pedidos():

    cursor = None

    try:

        cursor = mysql.connection.cursor()

        cursor.execute("""

            SELECT id_pedido, nombre_cliente, direccion, telefono, fecha_pedido, total_pedido 

            FROM pedidos

        """)

        datos = cursor.fetchall()

        pedidos = [fila_a_diccionario(cursor, fila) for fila in datos]

        return jsonify({

            'pedidos': pedidos,

            'mensaje': 'Lista de pedidos',

            'exito': True

        }), 200

    except Exception as ex:

        return jsonify({'mensaje': f'Error al consultar los pedidos: {ex}', 'exito': False}), 500

    finally:

        if cursor is not None:

            cursor.close()
 
# 2. Registrar un pedido completo con sus detalles de pizza (Botón Terminar)

# 2. Registrar un pedido completo con sus detalles de pizza (Botón Terminar)

@pedidos_bp.route('/', methods=['POST'])
def registrar_pedido():
    cursor = None

    try:
        data = request.get_json(silent=True) or {}

        print("Datos recibidos:", data)

        nombre_cliente = (
            data.get('nombre_cliente') or
            data.get('nombre_completo') or ''
        ).strip()

        direccion = (data.get('direccion') or '').strip()
        telefono = (data.get('telefono') or '').strip()

        fecha_pedido = (
            data.get('fecha_compra') or
            data.get('fecha_pedido')
        )

        total_pedido = data.get('total_pedido')
        pizzas = data.get('pizzas') or []

        if not all([nombre_cliente, direccion, telefono, fecha_pedido]):
            return jsonify({
                'mensaje': 'Faltan datos del cliente.',
                'exito': False
            }), 400

        if not isinstance(pizzas, list) or not pizzas:
            return jsonify({
                'mensaje': 'El pedido debe contener al menos una pizza.',
                'exito': False
            }), 400

        if total_pedido is None:
            return jsonify({
                'mensaje': 'No se recibió el total del pedido.',
                'exito': False
            }), 400

        cursor = mysql.connection.cursor()

        sql_pedido = """
            INSERT INTO pedidos
            (nombre_cliente, direccion, telefono,
             fecha_pedido, total_pedido)
            VALUES (%s, %s, %s, %s, %s)
        """

        cursor.execute(sql_pedido, (
            nombre_cliente,
            direccion,
            telefono,
            fecha_pedido,
            total_pedido
        ))

        id_pedido = cursor.lastrowid

        sql_detalle = """
            INSERT INTO detalle_pedidos
            (id_pedido, tamano, ingredientes,
             numero_pizzas, subtotal)
            VALUES (%s, %s, %s, %s, %s)
        """

        for pizza in pizzas:

            ingredientes = pizza.get('ingredientes', '')

            if isinstance(ingredientes, list):
                ingredientes = ', '.join(ingredientes)

            cursor.execute(sql_detalle, (
                id_pedido,
                pizza.get('tamano'),
                ingredientes,
                pizza.get('numero_pizzas'),
                pizza.get('subtotal')
            ))

        mysql.connection.commit()

        return jsonify({
            'mensaje': 'Pedido registrado exitosamente',
            'id_pedido': id_pedido,
            'total_pagar': total_pedido,
            'exito': True
        }), 201

    except Exception as ex:

        print("=== ERROR DETALLADO EN EL SERVIDOR ===")
        traceback.print_exc()

        if cursor:
            mysql.connection.rollback()

        return jsonify({
            'mensaje': f'Error al registrar el pedido: {ex}',
            'exito': False,
            'error': str(ex)
        }), 500

    finally:
        if cursor:
            cursor.close()
 
# 3. Visualizar el detalle de una venta específica (desglose de pizzas)

@pedidos_bp.route('/<int:id_pedido>/detalle', methods=['GET'])

def ver_detalle_pedido(id_pedido):

    cursor = None

    try:

        cursor = mysql.connection.cursor()

        sql = """

            SELECT id_detalle, tamano, ingredientes, numero_pizzas, subtotal 

            FROM detalle_pedidos 

            WHERE id_pedido = %s

        """

        cursor.execute(sql, (id_pedido,))

        datos = cursor.fetchall()

        detalles = [fila_a_diccionario(cursor, fila) for fila in datos]

        return jsonify({

            'id_pedido': id_pedido,

            'detalle_pizzas': detalles,

            'exito': True

        }), 200

    except Exception as ex:

        return jsonify({'mensaje': f'Error al consultar el detalle: {ex}', 'exito': False}), 500

    finally:

        if cursor:

            cursor.close()
 
# 4. Consulta de ventas por día de la semana (ej. 'Monday', 'Tuesday' o usando DAYNAME)

@pedidos_bp.route('/dia/<string:dia_semana>', methods=['GET'])

def ventas_por_dia(dia_semana):

    cursor = None

    try:

        cursor = mysql.connection.cursor()

        # DAYNAME(fecha_pedido) devuelve el nombre del día en inglés, 

        # o puedes adaptarlo según cómo guardes el día/fecha

        sql = """

            SELECT nombre_cliente, total_pedido, fecha_pedido 

            FROM pedidos 

            WHERE LOWER(DAYNAME(fecha_pedido)) = LOWER(%s)

        """

        cursor.execute(sql, (dia_semana,))

        datos = cursor.fetchall()

        ventas = [fila_a_diccionario(cursor, fila) for fila in datos]

        # Calcular el total acumulado del día

        total_dia = sum(v['total_pedido'] for v in ventas)
 
        return jsonify({

            'dia': dia_semana,

            'ventas': ventas,

            'ventas_totales_dia': total_dia,

            'exito': True

        }), 200

    except Exception as ex:

        return jsonify({'mensaje': f'Error en consulta por día: {ex}', 'exito': False}), 500

    finally:

        if cursor:

            cursor.close()
 
# 5. Consulta de ventas por mes (ej. 'November' o nombre del mes)

@pedidos_bp.route('/mes/<string:nombre_mes>', methods=['GET'])

def ventas_por_mes(nombre_mes):

    cursor = None

    try:

        cursor = mysql.connection.cursor()

        sql = """

            SELECT nombre_cliente, total_pedido, fecha_pedido 

            FROM pedidos 

            WHERE LOWER(MONTHNAME(fecha_pedido)) = LOWER(%s)

        """

        cursor.execute(sql, (nombre_mes,))

        datos = cursor.fetchall()

        ventas = [fila_a_diccionario(cursor, fila) for fila in datos]

        # Calcular el total acumulado del mes

        total_mes = sum(v['total_pedido'] for v in ventas)
 
        return jsonify({

            'mes': nombre_mes,

            'ventas': ventas,

            'total_acumulado_mes': total_mes,

            'exito': True

        }), 200

    except Exception as ex:

        return jsonify({'mensaje': f'Error en consulta por mes: {ex}', 'exito': False}), 500

    finally:

        if cursor:

            cursor.close()
 