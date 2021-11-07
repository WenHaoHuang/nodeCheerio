/**
 * @author : huangwenhao
 * @date   : 2018/6/11
 * @project: node cheerio 爬虫
 */

const fs = require('fs')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const chalk = require('chalk')
const request = require('request')

// const baseUrl = 'https://www.bbiquge.cc'
// let startPage = `${baseUrl}/book_115035/38582040.html`
const startPage = 'https://www.ranwen.tw/book_102363/36262340.html'

let pageIndex = 1, txtContent = ''
const bookName = '都市修仙'

class NEWS {
    fetchPage(url) {
        return new Promise((resolve) => {
            request({
                url,
                encoding: null
            }, (error, response, body) => {
                if (error) reject(error);
                if (response && response.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(`请求✿✿✿${url}✿✿✿失败`);
                }
            })
        })
    }

    async start(page) {
        const data = await this.fetchPage(page)
        const html = iconv.decode(data, "gbk")
        const $ = cheerio.load(html, { decodeEntities: false })
        const title = $('h1.h1title').text().replace(/^\s+|\s+$/g, '')
        const content = $('#htmlContent').text()
        const nextUrl = $('#link-next').attr('href')

        if (nextUrl) {
            console.log(chalk.green(`> 内容解析成功 ${pageIndex}`) + '\n  ' + title + '\n  ' + nextUrl + '\n')
            txtContent += title + '\r\n' + content
            pageIndex += 1
            this.start(nextUrl)
        } else {
            this.saveContent(txtContent)
            console.log(chalk.red(`> 内容解析有误，即将重试…\n`))
            this.start(page)
        }
    }

    saveContent(content) {
        fs.writeFile(`${bookName}.txt`, content, function (err) {
            if (err) {
                return console.log(err);
            }
        })
    }
}

const news = new NEWS()
news.start(startPage)