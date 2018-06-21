/**
 * @author : huangwenhao
 * @date   : 2018/6/11
 * @project: node cheerio 爬虫
 */

const http = require('http')
const fs = require('fs')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const chalk = require('chalk')
const BufferHelper = require('bufferhelper')

const baseUrl = 'http://m.wutuxs.com'
let startPage = '/html/6/6610/4753548.html'

let pageIndex = 1, txtContent = ''

class NEWS {
    fetchPage(url) {
        return new Promise((resolve) => {
            http.get(url, (res) => {
                const bufferHelper = new BufferHelper()
                res.on('data', chunk => {
                    bufferHelper.concat(chunk)
                })
                res.on('end', () => {
                    const data = iconv.decode(bufferHelper.toBuffer(), 'GBK')
                    resolve(data)
                })
            })
        })
    }

    start(page) {
        const url = baseUrl + page
        // log(chalk.green(`\n> 开始解析目标地址：${url}`))
        // fetch
        this.fetchPage(url)
            .then((response) => {
                // log(chalk.green(`> 目标地址内容获取成功`))
                const $ = cheerio.load(response, {decodeEntities: false})
                const title = $('#nr_title').text().replace(/^\s+|\s+$/g, '')
                const content = $('#nr1').text()
                const nextUrl = $('#pb_next').attr('href')

                if(nextUrl){
                    console.log(chalk.green(`> 内容解析成功 ${pageIndex}`) + '\n  ' + title + '\n  ' + nextUrl + '\n')
                    txtContent += title + '\r\n' + content
                    this.saveContent(txtContent)
                    pageIndex += 1
                    this.start(nextUrl)
                } else {
                    console.log(chalk.red(`> 内容解析有误，即将重试…\n`))
                    this.start(page)
                }
            })
    }

    saveContent(content) {
        fs.writeFile("test.txt", content, function (err) {
            if (err) {
                return console.log(err);
            }
        })
    }
}

const news = new NEWS()
news.start(startPage)