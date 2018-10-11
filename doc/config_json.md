Application configuration file
=============================

The configuration file is description of the application which is created using this config file.

Structure
----------
**App object**
```json
{
  "appName": "",
  "dataFileName": "",
  "description": "",
  "language": "", // cs, uk
  "dimensions": [
  ]
}
```
**Dimension object**
```json
{
  "column": "",
  "domain": [], // optional
  "type": "day",
  "name": "days", // KEY
  "numBins": 12, // only for type: linear, date, hour
  "filter": {
    "numBins": 12 // filter granuality, only for type: linear, date, hour
  },
  "chart":{}  // optional
}
```
available type: day, hour, date, month, ordinal, linear

**Spatial dimension object**
```json
{
  "xColumn": "",
  "yColumn": "",
  "type": "",
  "filter": true,
  "identifyFileURL": "", // only for type: identify
  "radius": 300 
}
```
available type:  heatmap, dotmap, identify


**Chart object**
```json
{
  "label": "",
  "xLabel": "",
  "yLabel": "" // optional
}
```