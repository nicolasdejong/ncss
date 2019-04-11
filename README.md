## Client side nested css (ncss) to css converter.

This is a small piece of javascript that converts nested css (which the browser does
not understand) to standard css. Nested css is a lot more readable than css because
duplicate selectors can be omitted.

Load this script in the HEAD section and conversion is automatic. No build required.

`<script src="https://nicolasdejong.github.io/ncss/ncss-1_min.js">`

There are several server-side css preprocessors that can do nesting or add other features.
Typical examples are scss or less. Being server-side means a build is needed that generates
the css to send to the client. For simple web pages or web apps, a client side solution would be more convenient.
That is where ncss helps.

Nesting is implemented like it is in scss.
To concatenate nested selectors, add an '&' prefix.<br>

For example:
```scss
.panel {
  height: 12px;
  color: green;
  .button {
    color: blue;
    &:after { content: '}"'; }
    &.disabled {
      &.in-orange { color: orange; }
      color: gray;
    }
  }
}
```
will be translated to
```css
.panel { height: 12px; color: green; }
.panel .button { color: blue; }
.panel .button:after { content: '}"'; }
.panel .button.disabled { color: gray; }
.panel .button.disabled.in-orange { color: orange; }
```
See the [test](https://nicolasdejong.github.io/ncss/test/test.html),
another [simple exampe](https://sass-lang.com/guide#topic-3) or
a [more detailed explanation](https://sass-lang.com/documentation/file.SASS_REFERENCE.html#css_extensions) of scss nesting.

#### How to use

  `<link type="text/ncss" href="your-styles.ncss" rel="stylesheet">`<br>
or<br>
  `<style type="text/ncss">.your.inline.ncss {}</style>`

and load this script **at end** of head:
`<script src="https://nicolasdejong.github.io/ncss/ncss-1_min.js">`

Using "filename.scss" and type="text/scss" (so `scss` instead of `ncss`) is supported as well for better ide/editor support.

#### Notes
This is a very simple client side css preprocessor with limited functionality.
The ncss code is kept small by using regex instead of proper tokenization.
This works quite well, but there are some corner cases where conversion fails.
That typically happens with unmatched quotes in remarks.

Note that nested properties, placeholder selectors and single-line comments are not supported in ncss.
The idea here is to keep the ncss script as small as possible (&lt; 1KB zipped).

ncss minified size: 1326 bytes<br>
ncss zipped size: 913 bytes

The script uses synchronous loading (which leads to a warning in Chrome) because this way
the behaviour is the same as with normal css loading, which is synchronous as well.

If you want some scss features added, like variables, mixins, nested properties and single line comments,
take a look at [pscss](https://github.com/nicolasdejong/pscss) (partial scss on client). It is an extension of ncss with a few scss features added.

For even more client-side css-preprocessing power, see [postcss](https://github.com/postcss/postcss) or [less](http://lesscss.org/).
They are a lot bigger but have many more conversions.
