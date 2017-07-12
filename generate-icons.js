/**
 * Converts material SVGs into Template icons.
 */

const fs = require('fs');
const camelCase = require('lodash/camelCase');
const replace = require('lodash/replace');

const inDir = './in';
const outDir = './out';

const templateFile = './template.jsx';

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
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

    const src = template
        .replaceAll(variables.svgContent, svgContent)
        .replaceAll(variables.iconComponentName, iconComponentName)
        .replaceAll(variables.iconHumanReadable, iconHumanReadable)
        ;

    fs.writeFileSync(`${outDir}/${fileName}`, src);
});
