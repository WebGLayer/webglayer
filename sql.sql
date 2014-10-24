select count(speed), round(speed) from 
(select * from gpx_points limit 1000000) as g
 where speed > 60 AND speed <100 and ST_Contains(
 ST_GeomFromText(
 'POLYGON((0 55,50 55, 40 10, 41 9, 55 0,0 0,0 55))',4326),
 the_geom) 
 group by round(speed);