import axios from 'axios';
import { promises as fs } from 'fs';
import url from 'url';
import cheerio from 'cheerio';
import debug from 'debug';
import path from 'path';
import Listr from 'listr';

const log = debug('page-loader');

const getOriginUrl = (adress) => `${url.parse(adress).protocol}//${url.parse(adress).hostname}`;

const endings = {
  htmlFile: '.html',
  directory: '_files',
};

<<<<<<< HEAD
const makeName = (pathTo, type) => {
  switch (type) {
    case 'html':
      return `${pathTo.split('.').join('-').split('/').join('-')}.html`;
    case 'dir':
      return `${pathTo.split('.').join('-').split('/').join('-')}_files`;
    case 'link':
      return `/${pathTo.split('/').join('-')}`;
    default:
      return null;
  }
=======
const makeNameFromUrl = (urlAdress, type) => {
  const urlWithoutProtocol = `${url.parse(urlAdress).hostname}${url.parse(urlAdress).pathname}`;
  return `${urlWithoutProtocol.split('.').join('-').split('/').join('-')}${endings[type]}`;
>>>>>>> 37754d9f64ed5d0987d93449c80965a0e77fafc0
};

const makeNameFromLocalLink = (link) => `/${link.split('/').join('-')}`;

const isLocalLink = (link) => link && !url.parse(link).hostname;

const adressAttributes = ['src', 'href'];

const getLocalLinks = (html) => {
  const localLinks = [];
  const dom = cheerio.load(html);
  const elementsWithLinks = dom('link').add('img[src]').add('script');
  adressAttributes.forEach((attr) => (
    elementsWithLinks.attr(attr, (i, elem) => (isLocalLink(elem) ? localLinks.push(elem) : null))));
  return localLinks;
};

const changeLocalLinks = (dirName, html) => {
  const dom = cheerio.load(html);
  const elementsWithLinks = dom('link').add('img[src]').add('script');
  adressAttributes.forEach((attr) => elementsWithLinks.attr(attr, (i, link) => {
    if (isLocalLink(link)) {
<<<<<<< HEAD
      const filePath = makePath(dirName, makeName(link.slice(1), 'link'));
      log(`changing the path of a local resource from ${link} to ${filePath}`);
=======
      const filePath = path.join(dirName, makeNameFromLocalLink(link.slice(1)));
      log(`4. changing the path of a local resource from ${link} to ${filePath}`);
>>>>>>> 37754d9f64ed5d0987d93449c80965a0e77fafc0
      return filePath;
    }
    return null;
  }));
  return dom.html();
};

const loadLocalResources = (links, adress) => links.map((link) => {
  const urlLink = `${adress}${link}`;
<<<<<<< HEAD
  log(`start loading local resource at ${urlLink} local link - ${link} url - ${adress}`);
=======
  log(`2. start loading content by link ${urlLink}`);
>>>>>>> 37754d9f64ed5d0987d93449c80965a0e77fafc0
  return axios({
    method: 'get',
    url: urlLink,
    responseType: 'arraybuffer',
  });
});

export default (adress, outputDir) => {
  log(`1. start loading page at URL ${adress} and save it in directory ${outputDir}`);
  let html;
  const htmlFilePath = path.join(outputDir, makeNameFromUrl(adress, 'htmlFile'));
  const localFilesDir = path.join(outputDir, makeNameFromUrl(adress, 'directory'));
  return axios.get(adress)
    .then((page) => {
      html = page.data;
    })
    .then(() => fs.mkdir(localFilesDir, { recursive: true }))
    .then(() => loadLocalResources(getLocalLinks(html), getOriginUrl(adress)))
    .then((promises) => Promise.all(promises))
    .then((contents) => contents.map((content) => {
<<<<<<< HEAD
      const pathname = url.parse(content.config.url).pathname.slice(1);
      const filePath = makePath(localFilesDir, makeName(pathname, 'link'));
      log(`loading content by local link - ${content.config.url} and save it into directory - ${localFilesDir}`);
=======
      const localLink = url.parse(content.config.url).pathname.slice(1);
      const filePath = path.join(localFilesDir, makeNameFromLocalLink(localLink));
      log(`3. content from ${content.config.url} save to ${localFilesDir}`);
>>>>>>> 37754d9f64ed5d0987d93449c80965a0e77fafc0
      return fs.writeFile(filePath, content.data);
    }))
    .then(() => changeLocalLinks(makeNameFromUrl(adress, 'directory'), html))
    .then((newHtml) => fs.writeFile(htmlFilePath, newHtml))
    .then(() => log(`5. write html file to ${htmlFilePath}`));
};
