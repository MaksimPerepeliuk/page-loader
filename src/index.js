import axios from 'axios';
import { promises as fs } from 'fs';
import url from 'url';
import cheerio from 'cheerio';

const makeName = (adress) => {
  const { hostname, pathname } = url.parse(adress);
  const name = `${hostname}.${pathname.slice(1)}`.split('.').join('-');
  return `${name}.html`;
};

const isLocalLinks = (link) => (link ? !link.includes('https', 0) && !link.includes('http', 0) : false);

const makeNameForLinks = (link) => link.split('/').join('-');

const tagExtraction = (html) => {
  const dom = cheerio.load(html);
  const elementsWithLinks = dom('link').add('img[src]');
  ['src', 'href'].forEach((attribute) => {
    elementsWithLinks.attr(attribute, (i, elem) => (
      isLocalLinks(elem) ? makeNameForLinks(elem) : elem
    ));
  });
  return dom.html();
};

export default (adress, outputDir) => axios.get(adress)
  .then((page) => fs.writeFile(`${outputDir}/${makeName(adress)}`, page.data))
  .catch(console.log);


fs.readFile('__tests__/__fixtures__/test.html', 'utf-8')
  .then((data) => tagExtraction(data))
  .then(console.log);
