const fs = require('fs')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const chalk = require('chalk')
const request = require('request')

const homePage = 'https://www.ranwen.tw/book_102363/'

let txtContent = []
const bookName = '都市修仙1'

const fetchPage = (url) => {
    return new Promise((resolve, reject) => {
        request(
            {
                url,
                encoding: null
            },
            (error, response, body) => {
                if (error) reject(error);
                if (response && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(`请求✿✿✿${url}✿✿✿失败`);
                }
            }
        )
    })
}

const save = (content) => {
    fs.writeFile(`${bookName}.txt`, content, (err) => {
        if (err) {
            return console.log(err);
        }
    })
}

const start = async (page, pageIndex) => {
    const htmlBody = await fetchPage(page)
    const data = iconv.decode(htmlBody, "gbk")
    const $ = cheerio.load(data, { decodeEntities: false })

    const title = $('h1.h1title').text().replace(/^\s+|\s+$/g, '')
    const content = $('#htmlContent').text()
    
    console.log(chalk.green(`> 内容解析成功 ${pageIndex}`) + '\n  ' + title + '\n  ' + page + '\n')
    txtContent[pageIndex] = title + '\r\n' + content + '\r\n'

    const isCompleted = txtContent.every(v => v !== false)

    if (isCompleted) {
        save(txtContent.join(''))
    }
}

const home = async (page) => {
    const htmlBody = await fetchPage(page)
    const data = iconv.decode(htmlBody, "gbk")
    const $ = cheerio.load(data, { decodeEntities: false })

    const wrap = $('.chapterlist').eq(1).find('li a')
    txtContent = new Array(wrap.length).fill(false)

    wrap.map((i, el) => {
        const href = $(el).attr('href')
        const pageUrl = `${homePage}${href}`
        setTimeout(() => {
            start(pageUrl, i)
        }, i * 100)
    })
}

home(homePage)