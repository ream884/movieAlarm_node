const express = require('express')
const axios = require('axios')
const qs = require('qs');

const node_shedule = require('node-schedule');
const Crawling = require('./CrawlingMovie.js');

const router = express.Router();

const { REST_API_KEY } = require('./config.js');

const REDIRECT_URI = 'http://localhost:3000/oauth';
const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;



let token = undefined;

router.get('/', async (req, res) => {
    if (token === undefined) {
        res.redirect(kakaoAuthUrl);
    }
    else {
        res.send("작동중");
        node_shedule.scheduleJob('* * 10 * * *',async ()=>{
            await CrawlingAndSend()
        });
    }
});

router.get('/oauth', async (req, res) => {
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

            token = result.data.access_token
            res.redirect('http://localhost:3000')
            
        } catch (error) {
            res.send('로그인. 다시 시도해 주세요.');
        }
    } else {
        res.send('로그인 실패. 다시 시도해 주세요.');
    }
});


async function CrawlingAndSend(){
        const map = await Crawling();

        map.forEach(async (links, title) => {
            SendMessage(links, title);
        })
}

function SendMessage(links, title){
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
}


module.exports = router;