#!/usr/bin/env node
import commander from 'commander';
import loader from '..';

const program = new commander.Command();

program
  .version('1.0.0')
  .description('page-loader')
  .arguments('<adress>')
  .option('--output [dirpath]', 'writed a page content in specified file', './')
  .action((adress) => {
    loader(adress, program.output)
      .then(() => console.log(`page ${adress} was loaded in ${program.output}`))
      .catch(console.log);
  })
  .parse(process.argv);
