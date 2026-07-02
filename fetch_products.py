import requests
import json

def fetch_excel_products():
    try:
        response = requests.get('https://opensheet.elk.sh/1OV2ZSt4TFBLC7V2JrUxYD5PONTxXWQ5HcB2Bnrhh7-I/catalog')
        response.raise_for_status()
        data = response.json()
        
        productos = {}

        for item in data:
            nombre = item.get("NOMBRE", "").strip()

            if not nombre:
                continue

            # Crear producto si no existe
            if nombre not in productos:
                productos[nombre] = {
                    "categoria": item.get("CATEGORIA", ""),
                    "nombre": nombre,
                    "descripcion": item.get("DESCRIPCION", ""),
                    "media": [],
                    "estado": item.get("ESTADO", "inactivo"),
                    "detalles": item.get("DETALLES", ""),
                    "opciones": {},
                    "variantes": []
                }

                # MEDIA
                if item.get("MEDIA"):
                    media_items = item["MEDIA"].split(";")
                    productos[nombre]["media"] = [
                        m.strip() for m in media_items if m.strip()
                    ]

            producto = productos[nombre]

            # -------- OPCIONES --------

            opcion1 = item.get("OPCION1", "").strip()
            valor1 = item.get("VALOR1", "").strip()

            opcion2 = item.get("OPCION2", "").strip()
            valor2 = item.get("VALOR2", "").strip()

            if opcion1 and valor1:
                producto["opciones"].setdefault(opcion1, [])

                if valor1 not in producto["opciones"][opcion1]:
                    producto["opciones"][opcion1].append(valor1)

            if opcion2 and valor2:
                producto["opciones"].setdefault(opcion2, [])

                if valor2 not in producto["opciones"][opcion2]:
                    producto["opciones"][opcion2].append(valor2)

            # -------- VARIANTE --------

            variante = {
                "sku": item.get("SKU", "").strip(),
                "precio": int(item.get("PRECIO", 0)) if item.get("PRECIO") else 0
            }

            if opcion1 and valor1:
                variante[opcion1] = valor1

            if opcion2 and valor2:
                variante[opcion2] = valor2

            producto["variantes"].append(variante)

        return list(productos.values())
        
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error: {e}")
        return []

def save_to_json(data, output_path):
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Data saved to {output_path}")
    except Exception as e:
        print(f"Error saving file: {e}")

if __name__ == "__main__":
    data = fetch_excel_products()
    if data:
        save_to_json(data, "./public/data.json")
    else:
        print("No data to save")
