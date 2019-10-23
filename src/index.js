import axios from 'axios';
import { promises as fs } from 'fs';
import url from 'url';
import cheerio from 'cheerio';

const isLocalLink = (link) => (link ? !link.includes('https', 0) && !link.includes('http', 0) : false);

const makeName = (link) => {
  if (isLocalLink(link)) {
    return link.split('/').join('-');
  }
  const { hostname, pathname } = url.parse(link);
  const name = `${hostname}.${pathname.slice(1)}`.split('.').join('-');
  return `${name}.html`;
};

const getLocalLinks = (html) => {
  const localLinks = [];
  const dom = cheerio.load(html);
  const elementsWithLinks = dom('link').add('img[src]').add('script');
  elementsWithLinks.attr('src', (i, elem) => (isLocalLink(elem) ? localLinks.push(elem) : null));
  elementsWithLinks.attr('href', (i, elem) => (isLocalLink(elem) ? localLinks.push(elem) : null));
  return localLinks;
};

const load = (adress, outputDir) => {
  const filepath = `${outputDir}/${makeName(adress)}`;
  return axios.get(adress)
    .then((page) => fs.writeFile(filepath, page.data))
    .then(() => fs.readFile(filepath, 'utf-8'))
    .then((html) => getLocalLinks(html))
    .then((links) => links.map(link => ))
    .catch(console.log);
};

load('https://hexlet.io/courses', '/tmp');
// const changeLinks = (html) => {
//   const dom = cheerio.load(html);
//   const elementsWithLinks = dom('link').add('img[src]');
//   ['src', 'href'].forEach((attribute) => {
//     elementsWithLinks.attr(attribute, (i, elem) => (
//       isLocalLink(elem) ? makeNameForLinks(elem) : elem
//     ));
//   });
//   return dom.html();
// };
