#!/usr/bin/env node
/**
 * Converts material SVGs into Template icons.
 */

const fs = require('fs');
const path = require('path');
const camelCase = require('lodash/camelCase');
const argv = require('minimist')(process.argv.slice(2));

const moduleDir = __dirname;
const inDir = argv.in || path.resolve('./in');
const outDir = argv.out || path.resolve('./out');

const templateFile = argv.template || path.resolve(moduleDir, './template.jsx');

console.log(templateFile);

const replaceAll = (string, search, replacement) => {
    return string.split(search).join(replacement);
};

const variables = {
    svgContent: '#SVG_CONTENT',
    iconComponentName: '#ICON_COMPONENT_NAME',
    iconHumanReadable: '#ICON_HUMAN_READABLE',
};

const files = fs.readdirSync( inDir );

const template = fs.readFileSync(templateFile).toString();

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

files.forEach( (file) => {
    const matches = file.match(/ic_([\w_]+)(_black.*)\.svg/);
    if(!matches || !matches[1]) {
        return;
    }

    const iconComponentName = `${camelCase(matches[1])[0].toUpperCase()}${camelCase(matches[1]).substring(1)}`;
    const iconHumanReadable = matches[1].replaceAll('_', ' ');

    const fileName = `${iconComponentName}.jsx`;

    const svgItems = fs.readFileSync(`${inDir}/${file}`).toString().replace(/<\s*[\/]?\s*svg[^>]*>/g, '').trim().split('\n');
    const svgContent = svgItems.reduce((result, item) => {
        return `${result}${item.trim()}`;
    }, '');

    let src = template;
    src = replaceAll(src, variables.svgContent, svgContent);
    src = replaceAll(src, variables.iconComponentName, iconComponentName);
    src = replaceAll(src, variables.iconHumanReadable, iconHumanReadable);

    fs.writeFileSync(`${outDir}/${fileName}`, src);
});
