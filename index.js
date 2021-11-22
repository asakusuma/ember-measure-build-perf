'use strict';

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {
  performance,
  createHistogram,
  PerformanceObserver
} = require('perf_hooks');

async function measureCommand(cmd) {
  const s = performance.now();
  const { stdout, stderr } = await exec(cmd);
  const t = Math.trunc(performance.now() - s);
  return {
    stderr,
    stdout,
    t
  };
}

module.exports = {
  name: require('./package').name,
  includedCommands() {
    return {
      'measure-build-perf': {
        name: 'measure-build-perf',
        description: 'Test build speed',
        availableOptions: [
          { name: 'command', type: String, default: 'ember build', alias: ['c'] },
          { name: 'iterations', type: Number,  default: 10, alias: ['n'] }
        ],

        async run({ iterations, command }) {
          const histogram = createHistogram();
          console.log(`Measuring build time of '${command}' over ${iterations} iterations...`);
          for (let i = 0; i < iterations; i++) {
            const { t } = await measureCommand(command);
            histogram.record(t);
            console.log(`Iteration ${i + 1}`, t);
          }
          
          console.log(histogram);
        }
      },
    }
  }
};
