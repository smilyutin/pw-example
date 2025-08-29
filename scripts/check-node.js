const semver = require('semver');

const required = '16.x';
if (!semver.satisfies(process.version, required)) {
  console.error(`❌ Node ${process.version} does not satisfy required ${required}. Run "nvm use".`);
  process.exit(1);
}