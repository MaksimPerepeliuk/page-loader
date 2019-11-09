import axios from 'axios';
import { promises as fs } from 'fs';
import url from 'url';
import cheerio from 'cheerio';
import debug from 'debug';
import path from 'path';
import Listr from 'listr';

const logs = {
  start: debug('page-loader:START'),
  find: debug('page-loader:FIND'),
  load: debug('page-loader:LOADING'),
  change: debug('page-loader:CHANGING'),
  write: debug('page-loader:WRITING'),
};

const getOriginUrl = (urlAdress) => `${url.parse(urlAdress).protocol}//${url.parse(urlAdress).hostname}`;

const endings = {
  htmlFile: '.html',
  directory: '_files',
};

const trimEndSlash = (str) => (str.slice(-1) === '/' ? str.slice(0, -1) : str);

const makeNameFromUrl = (urlAdress, type) => {
  const urlWithoutProtocol = trimEndSlash(`${url.parse(urlAdress).hostname}${url.parse(urlAdress).pathname}`);
  return `${urlWithoutProtocol.split('.').join('-').split('/').join('-')}${endings[type]}`;
};

const makeNameFromLocalLink = (link) => `/${link.split('/').join('-')}`;

const isLocalLink = (link) => link && !url.parse(link).hostname;

const adressAttributes = ['src', 'href'];

const getLocalLinks = (html) => {
  const localLinks = [];
  const dom = cheerio.load(html);
  const elementsWithLinks = dom('link').add('img[src]').add('script');
  adressAttributes.forEach((attr) => (
    elementsWithLinks.attr(attr, (i, elem) => {
      if (isLocalLink(elem)) {
        localLinks.push(elem);
        logs.find(`found local link - ${elem}`);
      }
    })
  ));
  return localLinks;
};

const changeLocalLinks = (dirName, html) => {
  const dom = cheerio.load(html);
  const elementsWithLinks = dom('link').add('img[src]').add('script');
  adressAttributes.forEach((attr) => elementsWithLinks.attr(attr, (i, link) => {
    if (isLocalLink(link)) {
      const filePath = path.join(dirName, makeNameFromLocalLink(link.slice(1)));
      logs.change(`in html file: from ${link} to ${filePath}`);
      return filePath;
    }
    return null;
  }));
  return dom.html();
};

export default (outputDir, urlAdress) => {
  logs.start(`start loading page at URL ${urlAdress} and save it in directory ${outputDir}`);
  let html;
  const htmlFilePath = path.join(outputDir, makeNameFromUrl(urlAdress, 'htmlFile'));
  const localFilesDir = path.join(outputDir, makeNameFromUrl(urlAdress, 'directory'));
  return axios.get(urlAdress)
    .then((page) => {
      html = page.data;
    })
    .then(() => fs.mkdir(localFilesDir, { recursive: true }))
    .then(() => getLocalLinks(html).forEach((link) => {
      const localLink = url.resolve(getOriginUrl(urlAdress), link);
      const localFilePath = path.join(localFilesDir, makeNameFromLocalLink(link.slice(1)));
      const getPage = () => axios({
        method: 'get',
        url: localLink,
        responseType: 'arraybuffer',
      });
      const title = `loading ${localLink}`;
      const task = () => getPage().then((res) => {
        fs.writeFile(localFilePath, res.data);
      });
      logs.load(`load ${localLink} and save it in ${localFilePath}`);
      const tasks = new Listr([{ title, task }]);
      tasks.run();
    }))
    .then(() => changeLocalLinks(makeNameFromUrl(urlAdress, 'directory'), html))
    .then((newHtml) => fs.writeFile(htmlFilePath, newHtml)
      .then(() => logs.write(`write html file to ${htmlFilePath}`)));
};
