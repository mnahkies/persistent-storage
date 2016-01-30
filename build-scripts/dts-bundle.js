var dts = require('dts-bundle');
var packageJson =  require('../package.json');
var path = require('path');

dts.bundle({
    name: packageJson.name,
    main: path.join(process.cwd(), packageJson.main.replace('.js', '.d.ts')),
    out: path.join(process.cwd(), packageJson.typescript.definition)
});
