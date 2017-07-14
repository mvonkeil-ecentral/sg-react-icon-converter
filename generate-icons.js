#!/usr/bin/env node
/**
 * Converts material SVGs into Template icons.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const camelCase = require('lodash/camelCase');
const argv = require('minimist')(process.argv.slice(2));

const moduleDir = __dirname;

// The input file or glob pattern.
const inDir = argv.in || './in/*.svg';

// The output directory.
const outDir = argv.out || './out';

const templateFile = argv.template || './template.jsx';

const logMessage = argv.quiet ? () => {} : console.info;

const isValid = () => {
    if (!fs.existsSync(outDir)) {
        console.error(`No such directory: ${outDir}`);
        return false;
    }

    if (!fs.existsSync(templateFile)) {
        console.error(`Cannot find template file: ${templateFile}`);
        return false;
    }

    return true;
};

const replaceAll = (string, search, replacement) => {
    return string.split(search).join(replacement);
};

const variables = {
    svgContent: '#SVG_CONTENT',
    iconComponentName: '#ICON_COMPONENT_NAME',
    iconHumanReadable: '#ICON_HUMAN_READABLE',
};

let pattern = inDir;
if(fs.existsSync(inDir) &&  fs.statSync(inDir).isDirectory()) {
  pattern = `${pattern}/*`;
}

const files = glob.sync(pattern);

const template = fs.readFileSync(templateFile).toString();

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

let generated = 0;

files.forEach( (file) => {
    const matches = file.match(/ic_([\w_]+)(_black.*)\.svg/);
    if(!matches || !matches[1]) {
        return;
    }

    const iconComponentName = `${camelCase(matches[1])[0].toUpperCase()}${camelCase(matches[1]).substring(1)}`;
    const iconHumanReadable = matches[1].replaceAll('_', ' ');

    const fileName = `${iconComponentName}.jsx`;

    const svgItems = fs.readFileSync(file).toString().replace(/<\s*[\/]?\s*svg[^>]*>/g, '').trim().split('\n');
    const svgContent = svgItems.reduce((result, item) => {
        return `${result}${item.trim()}`;
    }, '');

    let src = template;
    src = replaceAll(src, variables.svgContent, svgContent);
    src = replaceAll(src, variables.iconComponentName, iconComponentName);
    src = replaceAll(src, variables.iconHumanReadable, iconHumanReadable);

    const target = `${outDir}/${fileName}`;

    if (fs.existsSync(target)) {
      if (!argv.force) {
        logMessage(`Skipping existing file '${iconComponentName}' (use --force to overwrite).`);
        return;
      }
      else {
        logMessage(`Overwriting existing icon component '${iconComponentName}'.`);
        fs.unlinkSync(target);
      }
    }
    else {
      logMessage(`Generated icon component '${iconComponentName}'.`);
    }

    fs.writeFileSync(target, src);
    generated += 1;
});

logMessage(`Generated ${generated} icon(s).`);
