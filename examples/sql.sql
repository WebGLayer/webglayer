drop table gpx10k;
drop table gpx100k;
drop table gpx1000k;
create table gpx10k as select * from gpx_points where speed >0 and speed < 200 limit 10000;
create table gpx100k as select * from gpx_points where speed >0 and speed < 200 limit 100000;
create table gpx500k as select * from gpx_points where speed >0 and speed < 200 limit 500000;
create table gpx1000k as select * from gpx_points where speed >0 and speed < 200 limit 1000000;



select count(speed), round(speed) from 
(select * from gpx_points limit 1000000) as g
 where speed > 60 AND speed <100 and ST_Contains(
 ST_GeomFromText(
 'POLYGON((0 55,50 55, 40 10, 41 9, 55 0,0 0,0 55))',4326),
 the_geom) 
 group by round(speed);



select count(speed), round(speed/5)*5 as s from 
gpx100k 
group by s;


select count(the_hour), the_hour from 
gpx100k where speed < 10
group by the_hour;



