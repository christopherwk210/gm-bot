let term = process.argv[2];

http.get("http://docs2.yoyogames.com/files/searchdat.js", (res) => {
    res.setEncoding('utf8');
    res.pipe(concat({encoding: 'string'}, function (remoteSrc) {
        vm.runInThisContext(remoteSrc, 'remote_modules/searchdat.js');
        for (var i = 0; i < SearchTitles.length; i++) {
            if (SearchTitles[i] == term) {
                console.log('http://docs2.yoyogames.com/' + SearchFiles[i]);
            }
        }
    }));
});
