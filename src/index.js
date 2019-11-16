import axios from 'axios';
import { promises as fs } from 'fs';
import url from 'url';
import cheerio from 'cheerio';
import debug from 'debug';
import path from 'path';
import Listr from 'listr';

const logs = {
  start: debug('page-loader:START'),
  search: debug('page-loader:SEARCH'),
  load: debug('page-loader:LOADING'),
  change: debug('page-loader:CHANGING'),
  write: debug('page-loader:WRITING'),
};

const getOriginUrl = (urlAdress) => {
  const urlParts = url.parse(urlAdress);
  return `${urlParts.protocol}//${urlParts.hostname}`;
};

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

const tagsAttr = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const getLocalLinks = (html) => {
  const localLinks = [];
  const dom = cheerio.load(html);
  Object.keys(tagsAttr).forEach((tag) => {
    const link = dom(tag);
    link.attr(tagsAttr[tag], ((i, elem) => {
      if (isLocalLink(elem)) {
        logs.search(`found local link - ${elem}`);
        localLinks.push(elem);
      }
      return null;
    }));
  });
  return localLinks;
};

const changeLocalLinks = (dirName, html) => {
  const dom = cheerio.load(html);
  Object.keys(tagsAttr).forEach((tag) => {
    const link = dom(tag);
    link.attr(tagsAttr[tag], ((i, elem) => {
      if (isLocalLink(elem)) {
        const newLink = path.join(dirName, makeNameFromLocalLink(elem.slice(1)));
        logs.change(`in html file: from ${elem} to ${newLink}`);
        return newLink;
      }
      return null;
    }));
  });
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
    .then(() => {
      const localLinks = getLocalLinks(html).map((link) => ({
        link: url.resolve(getOriginUrl(urlAdress), link),
        filePath: path.join(localFilesDir, makeNameFromLocalLink(link.slice(1))),
      }));
      const getPage = (localLink) => axios({
        method: 'get',
        url: localLink,
        responseType: 'arraybuffer',
      });
      const tasks = new Listr(
        localLinks.map(({ link, filePath }) => {
          const title = `loading ${link}`;
          const task = () => getPage(link).then((res) => fs.writeFile(filePath, res.data));
          logs.load(`load ${link} and save it in ${filePath}`);
          return { title, task };
        }),
        { concurrent: true },
      );
      tasks.run();
    })
    .then(() => changeLocalLinks(makeNameFromUrl(urlAdress, 'directory'), html))
    .then((newHtml) => fs.writeFile(htmlFilePath, newHtml))
    .then(() => logs.write(`write html file to ${htmlFilePath}`));
};
