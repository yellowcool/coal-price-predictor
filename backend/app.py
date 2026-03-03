from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import random

app = Flask(__name__)
CORS(app)

COAL_TYPES = [
    {"id": "coking", "name": "焦煤", "base_price": 900, "range": 50},
    {"id": "fat", "name": "肥煤", "base_price": 950, "range": 50},
    {"id": "one_third_coking", "name": "1/3 焦煤", "base_price": 850, "range": 50},
    {"id": "lean", "name": "瘦煤", "base_price": 800, "range": 50},
]

def generate_history_prices(base_price, months=12):
    prices = []
    current_date = datetime.now()
    for i in range(months):
        month_date = current_date - timedelta(days=30 * (months - 1 - i))
        month_key = month_date.strftime("%Y-%m")
        variation = random.uniform(-0.05, 0.05)
        price = round(base_price * (1 + variation), 0)
        prices.append({"date": month_key, "price": int(price)})
    return prices

def generate_current_prices(base_price):
    early_variation = random.uniform(-0.02, 0.02)
    middle_variation = random.uniform(-0.02, 0.02)
    late_variation = random.uniform(-0.02, 0.02)
    
    early = round(base_price * (1 + early_variation), 0)
    middle = round(base_price * (1 + middle_variation), 0)
    late = round(base_price * (1 + late_variation), 0)
    
    return {
        "early": int(early),
        "middle": int(middle),
        "late": int(late)
    }

def generate_forecast_prices(base_price, periods=3):
    forecasts = []
    current_date = datetime.now()
    period_names = ["上旬", "中旬", "下旬"]
    
    for i in range(periods):
        month_offset = (i // 3) + 1
        period_index = i % 3
        forecast_date = current_date + timedelta(days=30 * month_offset)
        
        year = forecast_date.year
        month = forecast_date.month
        
        variation = random.uniform(-0.03, 0.05)
        price = round(base_price * (1 + variation), 0)
        
        forecasts.append({
            "date": f"{year}-{month:02d}-{period_names[period_index]}",
            "price": int(price)
        })
    
    return forecasts

def calculate_change(current_price, history):
    if len(history) >= 2:
        last_month_price = history[-1]["price"]
        change = ((current_price - last_month_price) / last_month_price) * 100
        return round(change, 2)
    return 0

def generate_coal_data():
    coal_types_data = []
    
    for coal in COAL_TYPES:
        base_price = coal["base_price"]
        
        history = generate_history_prices(base_price, 12)
        prices = generate_current_prices(base_price)
        current_price = prices["late"]
        
        forecast = generate_forecast_prices(base_price, 3)
        
        all_prices = [h["price"] for h in history] + [p for p in prices.values()] + [f["price"] for f in forecast]
        
        coal_data = {
            "id": coal["id"],
            "name": coal["name"],
            "currentPrice": current_price,
            "prices": prices,
            "high": max(all_prices),
            "low": min(all_prices),
            "change": calculate_change(current_price, history),
            "history": history,
            "forecast": forecast
        }
        
        coal_types_data.append(coal_data)
    
    return {
        "coalTypes": coal_types_data,
        "updateTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

@app.route('/api/all-data', methods=['GET'])
def get_all_data():
    return jsonify(generate_coal_data())

@app.route('/api/coal-types', methods=['GET'])
def get_coal_types():
    return jsonify([{"id": c["id"], "name": c["name"]} for c in COAL_TYPES])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
