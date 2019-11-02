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
let pathToTmpDir;
let expected;

beforeEach(async () => {
  contentTestFile = await fs.readFile(getFixturePath('test.html'), 'utf-8');
  pathToTmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'writed-'));
  expected = await fs.readFile(getFixturePath('expected.html'), 'utf-8');
  nock('https://hexlet.io')
    .get('/courses')
    .reply(200, contentTestFile)
    .get('/files/alan.png')
    .reply(200, 'picture')
    .get('/files/style.css')
    .reply(200, 'css')
    .get('/undefined')
    .reply(404, 'Request failed with status code 404');
});

nock.disableNetConnect();

test('page loading at the specified address', async () => {
  await pageLoader('https://hexlet.io/courses', pathToTmpDir);
  const pageContent = await fs.readFile(path.join(pathToTmpDir, 'hexlet-io-courses.html'), 'utf-8');
  expect(pageContent).toEqual(expected);
});

test('undefined output directory', async () => {
  await expect(pageLoader('https://hexlet.io/courses', '/undefined'))
    .rejects
    // почему-то с использованием toThrowErrorMatchingSnapshot не проходит тесты на travis
    .toThrow('ENOENT: no such file or directory, mkdir');
});

test('undefined require resource', async () => {
  await expect(pageLoader('https://hexlet.io/undefined', '/tmp')).rejects.toThrowErrorMatchingSnapshot();
});
