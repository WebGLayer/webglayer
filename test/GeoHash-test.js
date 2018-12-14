/**
 * Created by kolovsky on 2.5.17.
 */
QUnit.test("GeoHash", function( assert ) {
  let lon = 14;
  let lat = 50;
  let h = new WGL.ui.GeoHash();
  let hash = h.encode(lon, lat, 12);
  let bbox = h.decode(hash);
  let out =true;
  if (lat > bbox.ne.lat || lat < bbox.sw.lat ){
    out = false;
  }
  if (lon < bbox.sw.lon || lon > bbox.ne.lon){
    out = false;
  }
  assert.ok(out, "bbox range")
});