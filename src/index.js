import axios from 'axios';
import { promises as fs } from 'fs';
import url from 'url';

const makeName = (adress) => {
  const { hostname, pathname } = url.parse(adress);
  const name = `${hostname}.${pathname.slice(1)}`.split('.').join('-');
  return `${name}.html`;
};

export default (adress, outputDir) => axios.get(adress)
  .then((page) => fs.writeFile(`${outputDir}/${makeName(adress)}`, page.data))
  .catch(console.log);
