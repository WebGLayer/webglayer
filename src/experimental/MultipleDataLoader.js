/**
 * Data loader for multiple files
 * @param {string} metafile metadata file
 * @param callback call back function, one parameter for data
 * @constructor
 */
WGL.experimental.MultipleDataLoader = function (metafile, callback) {
  this.load = function(){
    let patha = metafile.split("/");
    let path = metafile.replace(patha[patha.length - 1], "");

    d3.json(metafile, function (err, config) {
      let q = queue();
      config.files.forEach(function (data, i) {
        q.defer(d3.csv, path+config.files[i]);
      });
      q.awaitAll(function (err, datas) {
        callback(datas.flat());
      });
    });
  };
};