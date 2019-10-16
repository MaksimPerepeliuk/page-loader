import axios from 'axios';
import { promises as fs } from 'fs';
import url from 'url';

const makeFileName = (adress) => {
  const { hostname, pathname } = url.parse(adress);
  const pathnameWithoutSlashes = pathname.slice(1);
  const fileName = `${hostname}.${pathnameWithoutSlashes}`.split('.').join('-');
  return `${fileName}.html`;
};

export default (dirPath, adress) => axios.get(adress)
  .then((page) => fs.writeFile(`${dirPath}/${makeFileName(adress)}`, page.data))
  .catch(console.log);
