const express = require("express");
const cors = require("cors");
const schedule = require("node-schedule");
const auth = require("./auth");
const message = require("./message");
const crawler = require("./crawler");

const app = express();
const port = 8000;

const clientId = "78efb8811860c100ec0c9648f3f2d478";
const redirectUri = "http://localhost:8000/redirect";
let accessToken = null;

app.use(cors());

app.get("/", (req, res) => {
  res.redirect(
    `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=talk_message`
  );
});

app.get("/redirect", async (req, res) => {
  const authorizationCode = req.query.code;

  try {
    accessToken = await auth.getAccessToken(authorizationCode);
    res.send("액세스 토큰 요청 성공");
  } catch (error) {
    res.send("액세스 토큰 요청 실패");
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 포트에서 실행 중입니다.`);

  schedule.scheduleJob("0 9 * * *", async function () {
    const movieUrl = "http://www.cgv.co.kr/movies/pre-movies.aspx";
    crawler.crawlingMovie(movieUrl);
    const movieList = crawler.getMovieList();
    let messageContent = "";

    if (movieList.length === 0) {
      messageContent = "D-1 영화 목록:\n\n" + "상영 예정작이 없습니다.";
    } else {
      messageContent = "D-1 영화 목록:\n\n" + movieList.join("\n");
    }
    message.sendMessage(accessToken, messageContent);

    crawler.clearMovieList();
  });
});
