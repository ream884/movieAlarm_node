const cheerio = require("cheerio");
const axios = require('axios')

const movieUrl = 'http://www.cgv.co.kr'

module.exports = async function Crawling() {
    let map = new Map();
    try {
        const response = await axios.get(movieUrl + "/movies/pre-movies.aspx");
        const html = cheerio.load(response.data);
        let link;

        html("li").each((_, element) => {
            const dday = html(element).find(".dday").text();

            if (dday == "D-3") {
                const image_link = html(element).find("img").attr('src');
                const title = html(element).find(".title").text();
                let detailPage = html(element).find(".link-reservation").attr('href');
                if (detailPage !== undefined) {
                    link = movieUrl + detailPage;
                }
                else {
                    link = movieUrl;
                }
                map.set(title, [link,image_link]);
            }
        });

        return map;
    } catch (error) {
        console.error(error);
    }
}

