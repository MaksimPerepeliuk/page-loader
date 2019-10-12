#!/usr/bin/env node
import commander from 'commander';

const program = new commander.Command();

program
  .version('1.0.0')
  .description('page-loader')
  .arguments('<firstConfig>')
  .option('-o, --output [path]', 'Output directory[path]', '__dirname')
  .action((firstConfig, secondConfig, option) => {
    console.log(gendiff(firstConfig, secondConfig, option.format));
  })
  .parse(process.argv);
