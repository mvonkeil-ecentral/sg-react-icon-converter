# Material icon converter

Mass converts material icons into template icons.

### Usage

* Go to https://material.io/icons and pick your icons.
* Each icon must be exported as SVG file. Only black items are supported. The file name is expected to be something like
    `ic_your_icon_name_black_[some pixel size]px.svg` (which is the default filename pattern of a downloaded the icon).
* Copy all downloaded SVG files to the `in` folder.
* run `npm run convert` and have fun.
