let str = '# Clean Code\nhellow';

let reg = /#\s[\s\S]+(\n|\r)/g;

let m = str.match(reg);

if (m) {
  let title = m[0];

  str = str.replace(title, '');
  title = title.replace('#', '').replace(/(\n|\r)/g, '');
  console.log(title, '\n\n', str);
}
