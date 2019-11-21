var unrar = require('./build/Release/rcunrar');
var RCUnrar = /** @class */ (function () {
    function RCUnrar(Path) {
        this.FilePath = Path;
    }
    RCUnrar.prototype.ListFiles = function () {
        return unrar.ListFiles(this.FilePath);
    };
    RCUnrar.prototype.ExtractFile = function (Entry, Password) {
        return unrar.ExtractFile(this.FilePath, Entry.Index, Password);
    };
    return RCUnrar;
}());
module.exports  = RCUnrar;
