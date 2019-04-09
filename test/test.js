const normalize = s => (s||'').replace(/^\s+/mg, '').replace(/\r\n/g, '\n');
const generated = normalize((document.querySelector('style[type="text/css"]')||{}).textContent);
const expected  = normalize((document.querySelector('style[type="text/css-expected"]')||{}).textContent);
let ok;
let diff = [];

window.addEventListener('load',() => {
  function addStyles(node, styles) {  Object.keys(styles || {}).forEach(sname => node.style[sname] = styles[sname]); }
  function addNode(parent, name, styles, textContent) {
    const node = document.createElement(name);
    addStyles(node, styles);
    if(textContent) node.textContent = textContent;
    (parent || document.body).appendChild(node);
    return node;
  }
  addStyles(document.body, {
    whiteSpace: 'pre',
    fontFamily: 'Consolas, monospace',
    margin: 0,
    overflow: 'hidden',
    height: '100%',
    display: 'grid',
    gridTemplateColumns:'35% 65%',
    gridTemplateRows:'2em 1fr'
  });

  const topStyles = {
    fontSize: '140%',
    backgroundColor: '#eee',
    borderBottom: '1px solid #ccc',
    paddingTop: '0.1em',
    paddingLeft: '1em',
    borderRight: '1px solid #ccc'
  };
  addNode(null, 'div', topStyles, 'Input NCSS');
  addNode(null, 'div', topStyles, 'Generated Output CSS');
  const inpNode = addNode(null, 'div', {overflow: 'auto', fontSize:'1em', color:'black'}, ncssNode.textContent.replace(/^\s*\n+/,''));
  const genNode = addNode(null, 'div', {overflow: 'auto', fontSize:'1em', color:'black', paddingLeft: '1em'}, generated);
  setTimeout(() => { inpNode.scrollTop = genNode.scrollTop = 999999; }, 1);

  diff.forEach(line => genNode.innerHTML = genNode.innerHTML.replace(line.replace(/&/g, '&amp;'), m=>`<span style="background-color:#ffbfbf;">${m}</span>`));
  if(!genLines.length) expLines.forEach(line => genNode.innerHTML += '<div style="color:red">MISSING: ' + line + '</div>');

  document.body.style.backgroundColor = ok ? '#f4fff4' : '#fff4f4';
});

const genLines = generated.split(/\n/).filter(l=>!!l);
const expLines = expected.split(/\n/).filter(l=>!!l);
if(!generated) {
  console.warn('NOTHING GENERATED!');
} else {
  while(genLines.length && genLines[0] === expLines[0]) { genLines.shift(); expLines.shift(); }
  if(!genLines.length && !expLines.length) {
    ok = true;
    console.log('OK');
  } else {
    console.log('FAIL!');
    if(genLines.length) {
      //diff = genLines.join('\n');

      console.log('DIFF at:');
      let toShow = 5;
      let offset = 0;
      for(let i=0; toShow && genLines[i]; i++) {
        if(genLines[i] !== expLines[i+offset]) {
          if(genLines[i] === expLines[i+offset-1]) { offset--; continue; }
          diff.push(genLines[i]);
          console.log('GEN: ' +  genLines[i]);
          console.log('EXP: ' + (expLines[i+offset] || ''));
          console.log('');
          toShow--;
        }
      }
      //console.log((diff=genLines.join('\n')));
    } else if(expLines.length) {
      console.log('Expected but NOT GENERATED:');
      console.log(expLines.join('\n'));
    }
  }
}
