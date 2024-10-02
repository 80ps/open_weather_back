import requests
import json
import sys

def get_weather(city, apikey):
    base_url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": apikey,
        "units": "metric"  # 섭씨로 온도 표시
    }

    response = requests.get(base_url, params=params)

    if response.status_code == 200:
        weather_data = response.json()
        temperature = weather_data["main"]["temp"]
        description = weather_data["weather"][0]["description"]
        humidity = weather_data["main"]["humidity"]
        wind_speed = weather_data["wind"]["speed"]

        # JSON 형식으로 출력
        weather_info = {
            "temperature": temperature,
            "description": description,
            "humidity": humidity,
            "wind_speed": wind_speed
        }
        print(json.dumps(weather_info))  # JSON 문자열로 변환하여 출력
    else:
        print(json.dumps({"error": "Failed to fetch weather data"}))

if __name__ == "__main__":
    city = sys.argv[1]  # 명령행 인수로 도시명 받기
    apikey = sys.argv[2]  # 명령행 인수로 API 키 받기
    get_weather(city, apikey)
