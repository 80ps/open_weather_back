const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const bodyParser = require('body-parser');
const PORT = 8080;

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('hello this is backend, how r u?');
});

// /weather 엔드포인트를 추가하여 날씨 정보를 요청
app.post('/weather', (req, res) => {
  try {
    const city = req.body.city; // 요청 본문에서 도시 이름을 가져옴
    const apiKey = req.body.apiKey; // 요청 본문에서 API 키를 가져옴

    const scriptPath = path.join(__dirname, 'weather.py');
    const pythonPath = path.join(__dirname, 'venv', 'bin', 'python3'); // EC2에서의 Python 경로

    // Python 프로세스 실행
    const result = spawn(pythonPath, [scriptPath, city, apiKey]);
    let responseData = '';

    // Python 스크립트에서 출력된 데이터 수신
    result.stdout.on('data', (data) => {
      responseData += data.toString();
    });

    // 오류 수신
    result.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      res.status(500).json({ error: data.toString() });
    });

    // 프로세스 종료 이벤트 처리
    result.on('close', (code) => {
      if (code === 0) {
        const weatherInfo = JSON.parse(responseData);  // JSON 파싱

        // 한국어 메시지 포맷팅
        const answer = `현재 ${city}의 기온은 ${weatherInfo.temperature}도이며, 날씨는 ${weatherInfo.description}입니다. 습도는 ${weatherInfo.humidity}%, 바람 속도는 ${weatherInfo.wind_speed} m/s입니다.`;
        
        res.status(200).json({ answer });
      } else {
        res.status(500).json({ error: `프로세스가 종료되었습니다. 종료 코드: ${code}` });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
   

});

app.get('/weather', (req, res) => {
  // 쿼리 파라미터에서 질문을 가져옵니다 (예: ?question=What is your name?)
  const city = req.body.city; // 요청 본문에서 도시 이름을 가져옴
  const apiKey = req.body.apiKey; // 요청 본문에서 API 키를 가져옴
  const question = req.query.question || "Hello! What would you like to ask?";

  // 간단한 응답을 반환합니다.
  res.status(200).json({ message: `You asked: "${city}"` });
  res.status(200).json({ message: `You asked: "${apiKey}"` });
  

  
  // console.log(`Server is running on port ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`서버가 ${PORT} 포트에서 실행 중입니다.`);
});
