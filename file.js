const RNFS = require('react-native-fs');

const writeFile = () => {
    // create a path you want to write to
    // :warning: on iOS, you cannot write into `RNFS.MainBundlePath`,
    // but `RNFS.DocumentDirectoryPath` exists on both platforms and is writable
    var path = RNFS.DocumentDirectoryPath + '/test.txt';

    // write the file
    RNFS.writeFile(path, 'Lorem ipsum dolor sit amet', 'utf8')
        .then((success) => {
            console.log('FILE WRITTEN!');
        })
        .catch((err) => {
            console.log(err.message);
        });
}

const downloadFile = () => {

    for(i = 0; i < 10; i++) {
        const path = '/' + (45913+i);

        RNFS.mkdir(RNFS.DocumentDirectoryPath + path);
        const promises = [];
        for(j = 0; j < 100; j++) {
            const file =  path + '/' + (70343+j) +  '.png'
            fromUrl = 'https://feuerwehreinsatz.info/basemap/geolandbasemap/normal/google3857/17' + file + '?rc=220210';
            console.log(fromUrl);
            toFile = RNFS.DocumentDirectoryPath + file;
            const option = {fromUrl, toFile};
            const {promise} = RNFS.downloadFile(option);
            promise.then(result => console.log(result));
        }
    }
}

const readFile = async () => {

    // get a list of files and directories in the main bundle
    await RNFS.readDir(RNFS.DocumentDirectoryPath + '/45913') // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
        .then((result) => {
            console.log('GOT RESULT', result);

            // stat the first file
            return Promise.all([RNFS.stat(result[1].path), result[1].path]);
        })
        .then((statResult) => {
            if (statResult[0].isFile()) {
                // if we have a file, read it
                return RNFS.readFile(statResult[1], 'utf8');
            }

            return 'no file';
        })
        .then((contents) => {
            // log the file contents
            console.log(contents);
        })
        .catch((err) => {
            console.log(err.message, err.code);
        });

}

export {
    readFile,
    writeFile,
    downloadFile
}
