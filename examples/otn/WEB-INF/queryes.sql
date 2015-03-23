select 
to_char(topixels_x(first),'FM999D99999999') as x1, 
to_char(topixels_y(first),'FM999D99999999') as y1, 
to_char(topixels_x(second),'FM999D9999999') as x2,
to_char(topixels_y(second),'FM999D9999999') as y2,
inspireid,  validfrom from 
(select  
ST_pointN((ST_Dump(centerlinegeometry)).geom,1) as first,
ST_pointN((ST_Dump(centerlinegeometry)).geom,2) as second, validfrom,
inspireid from transport_network.roadlink where  validfrom < '1-1-2015'::timestamp with time zone 
order by inspireid)  as foo 
;
select roadlinkid, trafficvolume as value, fromtime 
from 
transport_network.trafficvolume, 
transport_network.roadlink 
where  validfrom < '1-1-2015'::timestamp 
and transport_network.roadlink.inspireid = transport_network.trafficvolume.roadlinkid
order by fromtime, roadlinkid
;
select 
to_char(topixels_x(first),'FM999D99999999') as x1, 
to_char(topixels_y(first),'FM999D99999999') as y1, 
to_char(topixels_x(second),'FM999D9999999') as x2,
to_char(topixels_y(second),'FM999D9999999') as y2,
inspireid,  validfrom from 
(select  
ST_pointN((ST_Dump(centerlinegeometry)).geom,1) as first,
ST_pointN((ST_Dump(centerlinegeometry)).geom,2) as second, validfrom,
inspireid from transport_network.roadlink where  validfrom > '1-1-2015'::timestamp with time zone 
order by inspireid)  as foo 
;
select roadlinkid, trafficvolume as value, fromtime 
from 
transport_network.trafficvolume, 
transport_network.roadlink 
where  validfrom > '1-1-2015'::timestamp 
and transport_network.roadlink.inspireid = transport_network.trafficvolume.roadlinkid
order by fromtime, roadlinkid
;



