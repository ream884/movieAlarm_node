const axios = require("axios");

function sendMessage(accessToken, message) {
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

module.exports = {
  sendMessage,
};
