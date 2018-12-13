/**
 * Provide functionality for GeoHash
 * @constructor
 */
WGL.ui.GeoHash = function () {
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  const lon_min = -180.0;
  const lon_max = 180.0;
  const lat_min = -90.0;
  const lat_max = 90.0;

  /**
   * Encode position to the GeoHash
   * @param lon {number} longitude
   * @param lat {number} latitude
   * @param level {int} number of char in GeoHash
   * @returns {string} geohash
   */
  this.encode = function (lon, lat, level) {
    let a_lon = lon_min;
    let b_lon = lon_max;

    let a_lat = lat_min;
    let b_lat = lat_max;

    let idx = 0;
    let even = true;
    let n = 0;
    let i = 0;
    let hash = '';
    while(i < level){
      if (even){
        let mid = (a_lon+b_lon)/2;
        if (lon < mid){
          idx = idx * 2;
          b_lon = mid;
        }
        else{
          idx = idx * 2 + 1;
          a_lon = mid;
        }
      }
      else{
        let mid = (a_lat+b_lat)/2;
        if (lat < mid){
          idx = idx * 2;
          b_lat = mid;
        }
        else{
          idx = idx * 2 + 1;
          a_lat = mid;
        }
      }
      even = !even;
      n += 1;

      if(n === 5){
        hash += base32[idx];
        n = 0;
        idx = 0;
        i += 1;
      }
    }
    return hash;
  };

  /**
   * Decode GeoHash to bbox
   * @param hash {String} geohash
   * @returns {{sw: {lat: number, lon: number}, ne: {lat: number, lon: number}}}
   */
  this.decode = function (hash) {
    if (hash.length === 0) throw new Error('Invalid geohash');

    hash = hash.toLowerCase();

    let a_lon = lon_min;
    let b_lon = lon_max;

    let a_lat = lat_min;
    let b_lat = lat_max;

    let even = true;

    for (let i=0; i<hash.length; i++) {
      const chr = hash.charAt(i);
      const idx = base32.indexOf(chr);
      if (idx === -1){
        throw new Error('Invalid geohash');
      }

      for (let n = 4; n>=0; n--) {
        let bitN = idx >> n & 1;
        if (even) {
          let mid = (a_lon+b_lon) / 2;
          if (bitN === 1) {
            a_lon = mid;
          } else {
            b_lon = mid;
          }
        } else {
          let mid = (a_lat+b_lat) / 2;
          if (bitN === 1) {
            a_lat = mid;
          } else {
            b_lat = mid;
          }
        }
        even = !even;
      }
    }

    return {
      sw: { lat: a_lat, lon: a_lon },
      ne: { lat: b_lat, lon: b_lon },
    };
  };

  /**
   * Load CSV file with records
   * @param {number} lon longitude
   * @param {number} lat latitude
   * @param {int} level number of char in hash
   * @param {String} fp path to folder with data
   * @param callback callback function, one attribute with data
   */
  this.load = function (lon, lat, level, fp, callback) {
    let h = this.encode(lon, lat, level);

    d3.csv(fp+h, (err, data) => {
      if (err !== null && err.status === 404){
        //console.log("here is not any POI")
      }
      else{
        callback(data);
      }
    })
  }
  
};