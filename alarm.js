const express = require('express')
const axios = require('axios')
const qs = require('qs');
const cheerio = require("cheerio");
const node_shedule = require('node-schedule');

const app = express();
const port = 3000;
const { REST_API_KEY } = require('./config.js');


const movie_url = 'http://www.cgv.co.kr/movies/pre-movies.aspx';
const REDIRECT_URI = 'http://localhost:3000/oauth';
const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;
let token = undefined;


/*
localhost:3000 접속 시
1. 토큰 발급(카카오 로그인 필요)
2. 발급된 토큰으로 매일 10시마다 아래 동작
-1. dday 하루 남은 영화 크롤링
-2. 영화마다 피드 형식으로 카카오톡 메세지 전달

list 아닌이유 -> 아이템 리스트는 최대 5개까지(사용자 정의 템플릿) -> 개봉 영화가 많아지면 누락될 수도 있음.
*/
app.get('/', async (req, res) => {
    if (token === undefined) {
        console.log("token not found");
        res.redirect(kakaoAuthUrl);
    }
    else {
        res.send("작동중");
         node_shedule.scheduleJob('* * 10 * * *', async function () {
            const map = await Crawling(movie_url);

            map.forEach(async (links, title) => {
                axios.post(
                    'https://kapi.kakao.com/v2/api/talk/memo/default/send',
                    qs.stringify({
                        template_object: JSON.stringify({
                            object_type: 'feed',
                            content: {
                                title: title,
                                image_url:
                                    links[1],
                                link: {
                                    web_url: links[0],
                                    mobile_web_url: links[0],
                                },
                            },
                                buttons: [
                                    {
                                        title: '웹으로 보기',
                                        link: {
                                            mobile_web_url: links[0],
                                            web_url: links[0],
                                        },
                                    },
                                ]
                            })
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                    .catch((error) => {
                        console.log(error);
                    });
            })
      })
    }
});


app.get('/oauth', async (req, res) => {
    const code = req.query.code;
    if (code) {
        try {
            const result = await axios.post('https://kauth.kakao.com/oauth/token', null, {
                params: {
                    grant_type: 'authorization_code',
                    client_id: REST_API_KEY,
                    redirect_uri: REDIRECT_URI,
                    code,
                },
            });

            const { access_token } = result.data;
            token = access_token;
            res.redirect('http://localhost:3000')
        } catch (error) {
            res.send('로그인. 다시 시도해 주세요.');
        }
    } else {
        res.send('로그인 실패. 다시 시도해 주세요.');
    }
});


/*
이달의 추천영화와 아래 중복됨 -> 맵 자료구조로 중복 자료 저장x
map = {제목, [예매 링크, 이미지 링크]}

이미지와 제목은 무조건 있다고 가정(영화니까...)
예매하기 링크가 없는 경우 -> cgv 메인 홈페이지로 연결

TODO ::
개봉 하루 전만 고려해서  sect-movie-chart의 2번째 ol만 가지고와서 dday를 비교하기
vs
개봉일에 따라 유동적으로 바꾸기 위해 전체 구조에서 dday 비교 후 저장하기
뭐가 더 좋은 방향인지?
*/
async function Crawling(movie_url) {
    let map = new Map();
    try {
        const response = await axios.get(movie_url);
        const html = cheerio.load(response.data);

        html("li").each((_, element) => {
            const dday = html(element).find(".dday").text();

            if (dday == "D-3") {
                const image_link = html(element).find("img").attr('src');
                const title = html(element).find(".title").text();
                let link = html(element).find(".link-reservation").attr('href');
                if (link !== undefined) {
                    link = 'http://www.cgv.co.kr/' + link;
                }
                else {
                    link = 'http://www.cgv.co.kr/';
                }
                map.set(title, [link,image_link]);
            }
        });
        return map;
    } catch (error) {
        console.error(error);
    }
}



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
