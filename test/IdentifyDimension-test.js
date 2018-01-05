/**
 * Tests for class IdentifyDimension
 */
QUnit.test("IdentifyDimension", function( assert ) {

  //WGL.cleanAll();

  var data = {
    pts: [100,100, 150,150, 100,150, 150,100],
    pts_id: [1, 2, 3, 4]
  };

  data.num = data.pts_id.length;

  WGL.init(data.num, '../', 'map');
  var md = WGL.addMapDimension(data.pts, "aaa");
  md.pointSize = function (zoom) {
    return 80;
  };

  var idt = WGL.addIdentifyDimension(data.pts, data.pts_id, "idt", "./");
  //idt.dataPath = "./";
  idt.pointSize = 80;
  idt.onlySelected = false;

  var val1 = {data: data.pts_id, domain: data.pts_id, name:'pts_idd', type:'ordinal', label : "pts_id"};
  var dim = WGL.addOrdinalHistDimension(val1);
  WGL.addLinearFilter( val1, 4 , 'val1F');
  WGL.exactFilterDim('pts_idd', 'val1F', 1);

  WGL.render();
  WGL.render();

  $.ajaxSetup({async:false});
  var res1 = idt.identify(100,100);
  var res2 = idt.identify(130,130);

  var res = res1[0] === 1 && res1[1] === 1 && res2[0] === 4 && res2[1] === 4;
  assert.equal(res,true,"correct value in several pixel");


  cleanTest();
});