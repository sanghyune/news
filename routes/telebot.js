process.env.NTBA_FIX_319 = 1;

const express = require('express');
const router = express.Router();

const axios = require('axios');
const cheerio = require('cheerio');
const telegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const token = '883159099:AAFbqlNazc8B7XifNvB-uwb_Cd0xYiy6GF0';
const bot = new telegramBot(token, {polling: true});
let beforeDD, beforeSB;
const arrayDD = [], arraySB = [],
    filterTitleArr = [];

const getDD = async () => {
    try {
        return await axios.get("https://search.naver.com/search.naver?sm=tab_hty.top&where=news&query=%5B%EB%8B%A8%EB%8F%85%5D&oquery=%5B%EB%8B%A8%EB%8F%85%5D&tqi=iLzu2wprvmsssChlRe0ssssst18-060505&nso=so%3Add%2Cp%3Aall&mynews=0&office_section_code=0&office_type=0&pd=0&photo=0&sort=1");
    } catch (error) {
        // console.error(error);
    }
};

const getSB = async () => {
    try {
        return await axios.get("https://search.naver.com/search.naver?where=news&query=%5B%EC%86%8D%EB%B3%B4%5D&sm=tab_opt&sort=1&photo=0&field=0&pd=0&ds=&de=&docid=&related=0&mynews=0&office_type=0&office_section_code=0&news_office_checked=&nso=so%3Add%2Cp%3Aall&is_sug_officeid=0");
    } catch (error) {
        // console.error(error);
    }
};

cron.schedule('*/10 * * * * *',function() {
    getDD().then(function(html){
        let $ = cheerio.load(html.data),
            $bodyList = $('.list_news').children(),
            $title, title, $naverLink, link, ix, ixLen;

        $bodyList.each(function() {
            $naverLink = $(this).find('.info_group a.info:not(.press)').attr('href')
            $title = $(this).find('.news_tit');
            title = $title.text();
            link = $naverLink ? $naverLink : $title.attr('href')

            if (title.indexOf('[단독]') === 0) {

                for (ix = 0, ixLen = arrayDD.length; ix < ixLen; ix++) {
                    if (title === arrayDD[ix]) {
                        return false;
                    }
                }

                if (beforeDD) {
                    if (beforeDD !== title) {
                        console.log(title)
                        bot.sendMessage('@further_newss', title + '\n' + link);
                    }
                } else {
                    console.log(title)
                    bot.sendMessage('@further_newss', title + '\n' + link);
                }

                beforeDD = title;
                if (arrayDD.length > 5) {
                    arrayDD.shift();
                }
                arrayDD.push(title);
                return false;
            }
        });
    });
});

cron.schedule('*/10 * * * * *',function() {
    getSB().then(function(html){
        let $ = cheerio.load(html.data),
            $bodyList = $('.list_news').children(),
            ix, ixLen, jx, jxLen, $title, title, $naverLink, link, titleArr, titleFilterCnt = 0;

        $bodyList.each(function () {
            $naverLink = $(this).find('.info_group a.info:not(.press)').attr('href')
            $title = $(this).find('.news_tit');
            title = $title.text();
            link = $naverLink ? $naverLink : $title.attr('href')

            if (title.indexOf('[속보]') === 0) {
                titleArr = title.replace('[속보]', '').split(' ');

                for (ix = 0, ixLen = filterTitleArr.length; ix < ixLen; ix++) {
                    for (jx = 0, jxLen = titleArr.length; jx < jxLen; jx++) {
                        if (filterTitleArr[ix].indexOf(titleArr[jx]) > 0) {
                            titleFilterCnt++;
                        }
                    }

                    if (titleFilterCnt > 2) {
                        return false;
                    }
                }

                for (ix = 0, ixLen = arraySB.length; ix < ixLen; ix++) {
                    if (title === arraySB[ix]) {
                        return false;
                    }
                }

                // 없으면 -> 초기엔 보낸다
                if (beforeSB) {
                    if (beforeSB !== title) {
                        console.log(title)
                        bot.sendMessage('@further_newss', title + '\n' + link);
                    }
                } else {
                    console.log(title)
                    bot.sendMessage('@further_newss', title + '\n' + link);
                }

                beforeSB = title;
                if (arraySB.length > 5) {
                    arraySB.shift();
                }
                if (filterTitleArr.length > 5) {
                    filterTitleArr.shift();
                }

                arraySB.push(title);
                filterTitleArr.push(titleArr);
                return false;
            }
        });
    });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
});

module.exports = router;
