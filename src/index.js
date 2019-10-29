import axios from 'axios';
import { promises as fs } from 'fs';
import url from 'url';
import cheerio from 'cheerio';
import debug from 'debug';

const logger = debug('page-loader');

const isLocalLink = (link) => (link ? !link.includes('https://', 0) && !link.includes('http://', 0) : false);

const getOriginUrl = (adress) => `${url.parse(adress).protocol}//${url.parse(adress).hostname}`;

const urlWithoutProtocol = (adress) => `${url.parse(adress).hostname}${url.parse(adress).pathname}`;

const makeName = (pathTo, type) => {
  switch (type) {
    case 'html':
      return `${pathTo.split('.').join('-').split('/').join('-')}.html`;
    case 'dir':
      return `${pathTo.split('.').join('-').split('/').join('-')}_files`;
    default:
      return `/${pathTo.split('/').join('-')}`;
  }
};

const getLocalLinks = (html) => {
  const localLinks = [];
  const dom = cheerio.load(html);
  const elementsWithLinks = dom('link').add('img[src]').add('script');
  elementsWithLinks.attr('src', (i, elem) => (isLocalLink(elem) ? localLinks.push(elem) : null));
  elementsWithLinks.attr('href', (i, elem) => (isLocalLink(elem) ? localLinks.push(elem) : null));
  return localLinks;
};

const changeLocalLinks = (adress, html) => {
  const dom = cheerio.load(html);
  const elementsWithLinks = dom('link').add('img[src]').add('script');
  elementsWithLinks.attr('src', (i, link) => (
    isLocalLink(link) ? `${makeName(urlWithoutProtocol(adress), 'dir')}${makeName(link.slice(1))}` : null));
  elementsWithLinks.attr('href', (i, link) => (
    isLocalLink(link) ? `${makeName(urlWithoutProtocol(adress), 'dir')}${makeName(link.slice(1))}` : null));
  return dom.html();
};

export default (adress, outputDir) => {
  logger(`start loading page at URL ${adress} to directory ${outputDir}`);
  let html;
  const mainFilePath = `${outputDir}/${makeName(urlWithoutProtocol(adress), 'html')}`;
  const localFilesDir = `${outputDir}/${makeName(urlWithoutProtocol(adress), 'dir')}`;
  return axios.get(adress)
    .then((page) => {
      html = page.data;
    })
    .then(() => fs.writeFile(mainFilePath, html))
    .then(() => fs.mkdir(localFilesDir, { recursive: true }))
    .then(() => getLocalLinks(html).map((link) => axios({
      method: 'get',
      url: `${getOriginUrl(adress)}${link}`,
      responseType: 'arraybuffer',
    })))
    .then((promises) => Promise.all(promises))
    .then((contents) => contents.map((content) => {
      const pathname = url.parse(content.config.url).pathname.slice(1);
      const filePath = `${localFilesDir}${makeName(pathname, 'link')}`;
      logger(`loading content by local link - ${content.config.url} to directory - ${localFilesDir}`);
      return fs.writeFile(filePath, content.data);
    }))
    .then(() => changeLocalLinks(adress, html))
    .then((newHtml) => fs.writeFile(mainFilePath, newHtml))
    .catch(console.log);
};
