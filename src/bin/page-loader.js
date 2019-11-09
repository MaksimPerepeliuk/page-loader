#!/usr/bin/env node
import commander from 'commander';
import loader from '..';

const program = new commander.Command();

program
  .version('1.0.0')
  .description('page-loader')
  .arguments('<urlAdress>')
  .option('--output <dirpath>', 'writed a file contains page content in specified directory', process.cwd())
  .action((urlAdress) => {
    loader(program.output, urlAdress)
      .then(() => console.log(`page ${urlAdress} was loaded in ${program.output}`))
      .catch((err) => {
        console.error(err.message);
        process.exit(1);
      });
  })
  .parse(process.argv);
