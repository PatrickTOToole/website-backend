const execSync = require('child_process').execSync;

const output = execSync('cd ./python_services/ && ./python.sh', { encoding: 'utf-8' });  // the default is 'buffer'
console.log(`\n${output}`);
