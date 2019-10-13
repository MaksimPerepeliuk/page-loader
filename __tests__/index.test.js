import nock from 'nock';
import pageLoader from '../src';
import { promises as fs } from 'fs';
import path from 'path';
import _ from 'lodash';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http'
import os from 'os';

axios.defaults.adapter = httpAdapter;

const getFixturePath = (name) => path.join(__dirname, '..', '__tests__','__fixtures__', name);

let contentTestFile;
let pathToTmpdir;

beforeEach(async () => {
  contentTestFile = await fs.readFile(getFixturePath('test.html'), 'utf-8');
  pathToTmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'writed3-'));
});

afterEach(async () => {
  await fs.rmdir(pathToTmpdir);
});

nock.disableNetConnect();

test('content loaded page', async () => {
  nock('https://hexlet.io')
    .log(console.log)
    .get('/courses')
    .reply(200, contentTestFile);
    
  const promise = await pageLoader(pathToTmpdir, 'https://hexlet.io/courses');
  const pageContent = await fs.readFile(path.join(pathToTmpdir, 'hexlet-io-courses.html')); 
  // заменить имя файла на соотв функцию которая делает это имя из переданного адреса

  expect(pageContent).toEqual(contentTestFile);
});