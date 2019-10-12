import nock from 'nock';
import pageLoader from '../src';
import { promises as fs } from 'fs';
import path from 'path';
import _ from 'lodash';

const getFixturePath = (name) => path.join(__dirname, '..', '__tests__','__fixtures__', name);

let contentTestFile;

beforeEach(async () => {
  await fs.unlink(getFixturePath('expected')).catch(_.noop);
  contentTestFile = await fs.readFile(getFixturePath('test.html'), 'utf-8');
  await fs.writeFile(getFixturePath('expected'), contentTestFile);
});

nock.disableNetConnect();

test('content loaded page', async () => {
  nock('https://hexlet.io')
    .log(console.log)
    .get('/courses')
    .reply(200, contentTestFile);

  const pageContent = await pageLoader('https://hexlet.io/courses');
  expect(pageContent).toEqual(contentTestFile);
});