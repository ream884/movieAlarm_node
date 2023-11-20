const http = require("http");
const scheduler = require("node-schedule");
const cheerio = require("cheerio");
const request = require("request");

const movieUrl = "http://www.cgv.co.kr/movies/pre-movies.aspx";

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type' : 'text/html'});
    res.end('movie_alert_server');
});

server.listen(3001, () => {
    console.log("server on");

    // 매일 자정에 d-1인 영화 목록 보여주기
    
        console.log("개봉 직전인 영화 목록");

        
        request(movieUrl, (err, res, body) => {
            const html = cheerio.load(body);

            
            html(".box-contents").map((i, element) => {
                const movieInfo = html(element);
                const dday = movieInfo.find(".dday").text();

                
                if (dday === "D-5") {
                    console.log(movieInfo.find(".title").text());
                } 
            });
        });
    });

