import axios from 'axios';
import { promises as fs } from 'fs';
import url from 'url';

const makeFileName = (adress) => {
  const { hostname, pathname } = url.parse(adress);
  const fileName = `${hostname}.${pathname.slice(1)}`.split('.').join('-');
  return `${fileName}.html`;
};

export default (adress, dirPath) => axios.get(adress)
  .then((page) => fs.writeFile(`${dirPath}/${makeFileName(adress)}`, page.data))
  .catch(console.log);
