import os from 'os';
import nock from 'nock';
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import httpAdapter from 'axios/lib/adapters/http';
import pageLoader from '../src';

axios.defaults.adapter = httpAdapter;

const getFixturePath = (name) => path.join(__dirname, '..', '__tests__', '__fixtures__', name);

let contentTestFile;
let pathToTmpdir;
let expected;

beforeEach(async () => {
  contentTestFile = await fs.readFile(getFixturePath('test.html'), 'utf-8');
  pathToTmpdir = await fs.mkdtemp(path.join(os.tmpdir(), 'writed-'));
  expected = await fs.readFile(getFixturePath('expected.html'), 'utf-8');
});

nock.disableNetConnect();

test('page loading at the specified address', async () => {
  nock('https://hexlet.io')
    .log(console.log)
    .get('/courses')
    .reply(200, contentTestFile);

  await pageLoader('https://hexlet.io/courses', pathToTmpdir);
  const pageContent = await fs.readFile(path.join(pathToTmpdir, 'hexlet-io-courses.html'), 'utf-8');
  expect(pageContent).toEqual(expected);
});
