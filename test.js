let i = require('./src/lib/third-party/imgur');

i.createAlbum().then(res => console.log(res.data.id));
