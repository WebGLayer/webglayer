/**
 * Classic data loader
 * @param {string} datafile csv file with data
 * @param callback call back function
 * @constructor
 */
WGL.experimental.ClassicDataLoader = function (datafile, callback) {
  this.load = function(){
    d3.csv(datafile, function (err, data) {
      callback(data);
    });
  };
};