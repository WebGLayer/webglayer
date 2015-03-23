CREATE OR REPLACE FUNCTION topixels_x(the_geom geometry)
  RETURNS double precision AS
$BODY$
DECLARE
 
BEGIN
	
	return (st_x(st_transform(the_geom,900913))
	+20037508.34) / (20037508.34*2)*256 ;
	

END; $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
  
  CREATE OR REPLACE FUNCTION toopixels_y(the_geom geometry)
  RETURNS double precision AS
$BODY$
DECLARE
 
BEGIN
	
	return (-st_y(st_transform(the_geom,900913))
-20037508.34) / (20037508.34*2)*256 +256 ;
	

END; $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;