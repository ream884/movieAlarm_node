const request = require("request")

exports.sendMovieInfo = function(movieTitles) { 
    request({
        url: 'https://kapi.kakao.com/v2/api/talk/memo/default/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer d91PDS_P0o7A3DrnMZOt7uKhdJHIQ61iC1oKKcleAAABi-YUbAktjdRiIM79qQ',
        },
        body: `template_object={
            "object_type": "text",
            "text": "개봉 하루 전 영화 목록 - ${movieTitles}",
            "link": {
                "web_url": "http://www.cgv.co.kr/movies/pre-movies.aspx",
                "mobile_web_url": "http://www.cgv.co.kr/movies/pre-movies.aspx"
            }
        }`  
    })
}
