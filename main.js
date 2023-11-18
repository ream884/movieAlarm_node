const http = require("http");
const scheduler = require("node-schedule");
const cheerio = require("cheerio");
const request = require("request");

const movieUrl = "http://www.cgv.co.kr/movies/pre-movies.aspx";

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('movie_alert_server');
});

server.listen(7000, () => {





    scheduler.scheduleJob('0 0 0 * * *', () => {

        console.log("개봉 직전인 영화 목록");

        request(movieUrl, (err, res, body) => {
            if (err) {
                console.error("영화 데이터를 가져오는 중 오류 발생:", err);
                return;
            }

            const html = cheerio.load(body);
            const d1Movies = [];

            html(".box-contents").map((i, element) => {
                const movieInfo = html(element);
                const dday = movieInfo.find(".dday").text();

                if (dday === "D-1") {
                    const movieTitle = movieInfo.find(".title").text();
                    console.log(movieTitle);
                    d1Movies.push(movieTitle);
                }
            });

            if (d1Movies.length === 0) {
                console.log("개봉 직전인 영화가 없습니다.");
                return;
            }

            const movieTitlesString = d1Movies.join(", ");

            const kakao_message = {
                url: "https://kapi.kakao.com/v2/api/talk/memo/default/send",
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Bearer f1732cb92977b29aeb45819230d29469"
                },
                body: `template_object={
                "object_type": "text",
                "text": "${movieTitlesString}",
                "link": {
                    "web_url": "https://developers.kakao.com",
                    "mobile_web_url": "https://developers.kakao.com"
                }
            }`
            };

            request(kakao_message, (error, res, body) => {
                if (error) {
                    console.error("카카오 메시지 전송 중 오류 발생:", error);
                } else {
                    console.log("카카오 메시지 전송 성공.");
                }
            });
        });
    });
});
