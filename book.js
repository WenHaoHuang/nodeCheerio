const fs = require('fs');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const chalk = require('chalk');
const request = require('request');

const homePage = 'https://www.yqzww.cc/book_115962/';

let txtContent = [];
const bookName = 'book';

const fetchPage = (url) => {
  return new Promise((resolve, reject) => {
    request(
      {
        url,
        encoding: null,
      },
      (error, response, body) => {
        if (error) reject(error);
        if (response && response.statusCode === 200) {
          resolve(body);
        } else {
          reject(`请求✿✿✿${url}✿✿✿失败`);
        }
      }
    );
  });
};

const save = (content) => {
  fs.writeFile(`./dist/${bookName}.txt`, content, (err) => {
    if (err) {
      return console.log(err);
    }
  });
};

const start = async (page, pageIndex) => {
  const htmlBody = await fetchPage(page);
  const data = iconv.decode(htmlBody, 'gbk');
  const $ = cheerio.load(data, { decodeEntities: false });
  console.log('>\r\n', data);
  const title = $('.bookname h1')
    .text()
    .replace(/^\s+|\s+$/g, '');
  const content = $('#content').text().replace('言情中文网 www.yqzww.cc，最快更新女总裁的超级兵王 ！', '');
  // let content = $('#content').text().replace('言情中文网 www.yqzww.cc，最快更新女总裁的超级兵王 ！', '').replace('  ', '\r\n');

  console.log(chalk.green(`> 内容解析成功 ${pageIndex}`) + '\n  ' + title + '\n  ' + page + '\n');
  txtContent[pageIndex] = content + '\r\n';

  const isCompleted = txtContent.every((v) => v !== false);

  if (isCompleted) {
    save(txtContent.join(''));
  }
};

const home = async (page) => {
  const htmlBody = await fetchPage(page);
  const data = iconv.decode(htmlBody, 'gbk');
  const $ = cheerio.load(data, { decodeEntities: false });

  const wrap = $('#list').find('dt').eq(1).nextAll('dd');
  txtContent = new Array(wrap.length).fill(false);

  wrap.map((i, el) => {
    const href = $(el).find('a').attr('href');
    if (!href) {
      txtContent[i] = '';
      return;
    }
    // if (i > 1) {
    //   return;
    // }
    const pageUrl = `${homePage}${href}`;
    setTimeout(() => {
      start(pageUrl, i);
    }, i * 100);
  });
};

home(homePage);
