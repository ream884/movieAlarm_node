/* 카카오톡 나에게 메시지 보내기 REST API를 이용해 상영 예정 영화 정보 전송하기 */

const express = require("express");
const request = require("request");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const schedule = require("node-schedule");

const app = express();
const port = 8000;

const clientId = "78efb8811860c100ec0c9648f3f2d478";
const clientSecret = "Mf8kQpQafFksSsU12NaXYtoLHBcw0a9j";
const redirectUri = "http://localhost:8000/redirect";
let accessToken = null;

app.use(cors());

/*
"localhost:8000/": 인증 코드 및 액세스 토큰 발급 페이지로 리다이렉션.
"localhost:8000/redirect": 인증 코드 및 액세스 토큰 발급.
"localhost:8000/message": 메시지 전송 안내.
*/
app.get("/", (req, res) => {
  res.redirect(
    `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=talk_message`
  );
});

app.get("/redirect", async (req, res) => {
  const authorizationCode = req.query.code;

  try {
    const tokenResponse = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: authorizationCode,
          scope: "talk_message",
        },
      }
    );

    accessToken = tokenResponse.data.access_token;
    console.log("액세스 토큰 요청 성공");
    res.redirect(`http://localhost:8000/message`);
  } catch (error) {
    console.error("액세스 토큰 요청 실패:", error.response.data);
    res.send("액세스 토큰 요청 실패");
  }
});

app.get("/message", async (req, res) => {
  res.send("매일 오전 9시, D-1 상영 예정 영화 정보가 카카오톡으로 전송됩니다.");
});

/*
crawlingMovie(url): url에서 dday가 D-1인 영화 제목을 크롤링하는 함수.
sendMessage(message): message 내용을 카카오톡 나에게 메시지 보내기 REST API를 이용해 전송하는 함수.
*/
let movieList = [];
const movieUrl = "http://www.cgv.co.kr/movies/pre-movies.aspx";

function crawlingMovie(url) {
  request(url, function (err, res, body) {
    const $ = cheerio.load(body);
    const movie = $(".box-contents");

    movie.each(function (i, element) {
      const movieInfo = $(element);
      const dday = movieInfo.find(".dday").text();

      if (dday === "D-1") {
        movieList.push(movieInfo.find(".title").text());
      }
    });
  });
}

function sendMessage(message) {
  if (!accessToken) {
    console.log("액세스 토큰이 없습니다. 먼저 인가를 수락하세요.");
    return;
  }

  const messageContent = message;
  const webUrl = "http://www.cgv.co.kr/ticket/";
  const buttonTitle = "예매하기";

  const templateObject = {
    object_type: "text",
    text: messageContent,
    link: {
      web_url: webUrl,
    },
    button_title: buttonTitle,
  };

  axios
    .post(
      "https://kapi.kakao.com/v2/api/talk/memo/default/send",
      {
        template_object: JSON.stringify(templateObject),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "content-type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((response) => {
      console.log("카카오톡 메시지 전송 성공!");
    })
    .catch((error) => {
      console.error("카카오톡 메시지 전송 실패:", error.response.data);
    });
}

/*
서버가 시작되면 매일 오전 9시에 설정한 Url에서 영화 정보를 크롤링 해와,
카카오톡 나에게 메시지 보내기 API로 개봉 1일 남은 영화 제목을 text 형태로 전송.
*/
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 포트에서 실행 중입니다.`);

  schedule.scheduleJob("0 9 * * *", function () {
    crawlingMovie(movieUrl);
    let message = "";
    if (movieList.length === 0) {
      message = "D-1 영화 목록:\n\n" + "상영 예정작이 없습니다.";
    } else {
      message = "D-1 영화 목록:\n\n" + movieList.join("\n");
    }
    sendMessage(message);
    movieList = [];
  });
});
