import axios from 'axios';
import os from 'os';
import { promises as fs } from 'fs';

const makeFileName = adress => {
  
}

export default (dirPath, adress) => {
  return axios.get(adress)
    .then(page => fs.writeFile(dirPath, page));
};