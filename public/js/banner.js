function reg() {
    var elem = document.getElementById('tg-username');
    console.log(elem.value);
    if (elem.value) {
        window.open('https://telegramfriends.com/?utm_source=tlgrm&utm_medium=block' +
            '&utm_content=top&utm_campaign=ads&username=' + elem.value);
    } else {
        window.open('https://telegramfriends.com/?utm_source=tlgrm&utm_medium=block&utm_content=click&utm_campaign=ads');

    }
    return false;
}

$(document).ready(function () {
    $($('.b-page-container').size() ? '.b-page-container' : 'body')[$('.b-page-container').size() ? 'before' : 'prepend']('<style>.telegram-friends-peer{margin: 0; padding: 0; width: 100%;background-color: #D9E9F4;font-size: 13px;}select, textarea, input[type="text"]{border: 1px solid #C5CBD3; border-top-color: #d3d9e1; -webkit-border-radius: 2px; -khtml-border-radius: 2px; -moz-border-radius: 2px; border-radius: 2px; -webkit-box-shadow: 0 1px 2px rgba(6, 33, 63, 0.13); -moz-box-shadow: 0 1px 2px rgba(6, 33, 63, 0.13); box-shadow: 0 1px 2px rgba(6, 33, 63, 0.13); padding: 6px 10px;}.mbtn{border: 1px solid #5682a3; -webkit-border-radius: 2px; -khtml-border-radius: 2px; -moz-border-radius: 2px; border-radius: 2px; -webkit-box-shadow: 0 1px 2px rgba(6, 33, 63, 0.13); -moz-box-shadow: 0 1px 2px rgba(6, 33, 63, 0.13); box-shadow: 0 1px 2px rgba(6, 33, 63, 0.13); padding: 6px 18px; background: #5682a3; font-weight: 500; color: #fff;}.banner{max-width: 790px; text-align: center; padding: 10px; margin: 0 auto;}.banner .text{display: inline-block; padding-right: 12px;}.banner .input{display: inline-block;}.banner .input input{margin-right: 12px;}.mbtn:hover {cursor: pointer;background-color: #6592B5;}@media (max-width: 625px){.banner .text, .banner .input{display: block;}.banner .text{margin-bottom: 10px;}}</style><div class="telegram-friends-peer"> <form class="banner" onsubmit="return reg();"> <a href="https://telegramfriends.com/?utm_source=tlgrm&utm_medium=block&utm_content=click&utm_campaign=ads" target="_blank" class="text"> Знакомства и общение через Telegram </a> <div class="input"> <input type="text" placeholder="Введите ваш username" name="username" id="tg-username"/> <button class="mbtn" type="submit">Далее<i class="icon icon-next-submit"></i></button> </div></form></div>');
});