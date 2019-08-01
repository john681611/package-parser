const location = process.argv.slice(2)[0];
const package = require(`../${location}/package-lock.json`);
const axios = require('axios');
const stringify = require('util').promisify(require('csv-stringify'));
const fs = require('fs');

(async (x) => {
  const dependecies = Object.keys(package.dependencies).filter(key => !package.dependencies[key].dev);
  let dependencyList = await Promise.all(dependecies.map(async dependency => {
    const obj = package.dependencies[dependency];
    try {
      const response = await axios.get(`https://registry.npmjs.org/${dependency.toLowerCase()}`);
      return {
        name: dependency,
        version: obj.version,
        released: response.data.time[obj.version],
        latest: response.data['dist-tags'].latest,
        latestUpdate: response.data.time.modified
      };
    } catch (error) {
      console.log(dependency);
      console.log(error.response.status);
    }
  }));
  dependencyList = dependencyList.filter(dependency => dependency !== undefined);
  return stringify(dependencyList, {
    header: true
  });
})().then(v => {
  fs.writeFileSync(`output.csv`, v)
});