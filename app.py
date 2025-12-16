from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
# Allow cross-origin requests from the frontend (e.g. http://localhost:3000)
CORS(app)


@app.route("/weather")
def weather():
    city = request.args.get("city", "Unknown")
    temperature = random.randint(20, 45)
    return jsonify({"city": city, "temp": temperature})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
