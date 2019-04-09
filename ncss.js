// Nested css (ncss) to css converter by Nicolas de Jong
//
// V1.0/20180607 - initial version
//
// Nested css is a lot more readable than css which has lots of duplications.
// To concatenate nested selectors, add an '&' prefix (like in scss).
//
// How to use:
//
//  <link type="text/ncss" href="your-styles.ncss" rel="stylesheet">
// or
// <style type="text/ncss">.your.inline.ncss {}</style>
//
// and load this script: <script src="ncss-minimal.js"></script> *at end* of head.
//
// Type "text/scss" is supported as well, since ide/editors support nested css then.
//
(() => {

const syncLoad = node => {
  // synchronized load because a <link ...> call would block as well
  let request = new XMLHttpRequest();
  request.open('GET', node.href, /*async=*/false); // this does not work for file://
  request.send();
  return request.responseText || '';
};
const convertNcssTextToCss = ncss => {
  const tokens = [];
  const quotes = [];
  const quoteToken = ':Q=' + (Math.random() + '=Q:').substr(2);

  ncss
    .replace(/<!\[CDATA\[([\s\S]*)]]>/g, '$1') // remove CDATA
    .replace(/(['"])(.*?[^\\])?\1|\([^)]+:\/\/[^)]+\)/g, q => quoteToken + quotes.push(q)) // store and remove quotes
    .replace( /\/\*[\s\S]*?\*\//g, '').replace( /\/\/[^\n]*/g, '') // remove remarks
    .replace(/([\s\S]*?)\s*([;{}]|$)/g, (_, g1, g2) => tokens.push.apply(tokens, [g1, g2].map(s=>s.trim()).filter(s=>s))); // tokenize

  return flattenRules()
    .replace(/[ \n]*\n */g, '\n')
    .replace( new RegExp(quoteToken + '(\\d+)', 'g'), (_, n) => quotes[n-1]); // restore quotes

  function flattenRules() {
    function addRules(rules, selectors, styles) {
      rules.push([selectors, styles]);
      const get = () => tokens.shift();
      let atRule = null;
      let ll;
      for(let token=get(); token; token=get()) {
        if (/^@/.test(token)) { atRule = ''; ll = 0; }
        if(atRule !== null) {
          if(token !== ';') atRule += ' ';
          atRule += token;
          if(token === '{') ++ll;
          if((token === '}' && --ll === 0) || (token === ';' && ll === 0)) {
            const parts = /^([^{]+){([\s\S]*)}$/.exec(atRule);
            if(parts && /^\s*@(media|supports|document)/.test(parts[0])) atRule = parts[1] + '{' + convertNcssTextToCss(parts[2]).replace(/\n/g, ' ') + ' }';
            rules.push([[], [atRule.replace(/ *\n */g, ' ')]]);
            atRule = null;
          }
        } else
        if (token === '}') break; else
        if (tokens[0] === '{') { // next token is {
          get(); // skip {
          let deeperSelectors = [];
          token.split(/\s*,\s*/).forEach(tsel => selectors.forEach(sel =>
            deeperSelectors.push(
              tsel.includes('&') ? tsel.replace(/^(.*?)\s*&/, (_, prefix) => prefix ? prefix + ' ' + sel.trim() : sel) : sel + ' ' + tsel
            )
          ));
          addRules(rules, deeperSelectors, []);
        } else
          styles.push(token);
      }
      return rules;
    }
    return addRules([], [''], [])
      .filter(([selectors, styles]) => styles[0])
      .map(([selectors, styles]) => selectors + (selectors[0] ? ` { ${styles.join(' ')} }` : styles.join('\n')).replace(/ ;/g,';'))
      .join('\n')
  }
};

['text/ncss','text/scss'].forEach(type => {
  document.querySelectorAll(`style[type="${type}"],link[type="${type}"]`).forEach(node => {
    let newNode = document.createElementNS(node.namespaceURI, 'style');
    newNode.type = 'text/css';
    newNode.textContent = convertNcssTextToCss(node.textContent || syncLoad(node));

    if(node.media) newNode.setAttribute('media', node.media);
    node.parentNode.replaceChild(newNode, node);
  });
});

})();
