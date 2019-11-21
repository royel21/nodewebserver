const unrar = require('./build/Release/rcunrar')

module.exports = class RCUnrar {
    FilePath: String;
    constructor(Path: String) {
        this.FilePath = Path;
    }

    public ListFiles(): Array<any> {
        return unrar.ListFiles(this.FilePath);
    }

    public ExtractFile(Index: Number, Password?: String): Buffer {

        return unrar.ExtractFile(this.FilePath, Index, Password);
    }
}

