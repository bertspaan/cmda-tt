# Data & scripts for CMD presentation

This repository contains data & scripts for a presentation about data visualization with
D3.js and Observable on Friday November 2nd, 2018.

- Slides: https://bertspaan.nl/talks/cmda-tt
- Observable Notebook: https://beta.observablehq.com/@bertspaan/gebouwen-in-amsterdam

## Data

The file [`buildings-amsterdam.csv`](buildings-amsterdam.csv) contains all buildings in Amsterdam, from Amsterdam's
[buildings and addresses API](https://api.data.amsterdam.nl/bag/). You can download all buildings from the API, or, if you have access to the database, use the SQL query below.

This repository contains 3 GeoJSON files:

1. [`buildings-amsterdam-2-buurten.geojson`](buildings-amsterdam-2-buurten.geojson)
2. [`buildings-amsterdam-5-buurten.geojson`](buildings-amsterdam-5-buurten.geojson)
3. [`buildings-amsterdam-10-buurten.geojson`](buildings-amsterdam-10-buurten.geojson)

The first file contains buildings for the following neighbourhoods (buurten in Dutch):

- `03630000000433`: Westelijke Eilanden
- `03630023753973`: Dorp Sloten

Create this file by running:

    node index.js -b 03630000000433,03630023753973 buildings-amsterdam.csv

The second file contains 3 more neighbourhoods:

- `03630000000640`:  Van der Pekbuurt
- `03630000000724`:  G-buurt Oost
- `03630000000538`:  Teleport

To create this file:

    node index.js -b 03630000000433,03630000000640,03630000000724,03630023753973,03630000000538 buildings-amsterdam.csv

The largest GeoJSON files contains 5 more neighbourhoods:

- `03630000000774`: Betondorp
- `03630000000598`: Steigereiland Zuid
- `03630023753971`: Duivelseiland
- `03630000000498`: Driehoekbuurt
- `03630000000855`: Buitenveldert Zuidoost

Create this file with this command:

    node index.js -b 03630000000433,03630000000640,03630000000724,03630023753973,03630000000538,03630000000774,03630000000598,03630023753971,03630000000498,03630000000855 buildings-amsterdam.csv

To run `node index.js`, you need to install its dependencies first by running `npm install`.

## SQL

Use the following query to convert all building data to CSV:

```sql
CREATE VIEW buildings_cmda AS
  SELECT DISTINCT ON (p.id)
    p.id,
    bouwjaar,
    buurt_id,
    b.naam AS buurtnaam,
    stadsdeel_id,
    ST_AsGeoJSON(ST_ForceRHR(ST_Force2D(ST_Transform(p.geometrie, 4326)))) AS geojson,
    _openbare_ruimte_naam AS openbareruimtenaam,
    _huisnummer AS huisnummer,
    _huisletter AS huisletter,
    _huisnummer_toevoeging AS huisnummertoevoeging
  FROM bag_verblijfsobject v
  JOIN bag_verblijfsobjectpandrelatie vp
    ON vp.verblijfsobject_id = v.id
  JOIN bag_pand p
    ON vp.pand_id = p.id
  JOIN bag_buurt b
    ON buurt_id = b.id;
```

From [psql](https://www.postgresql.org/docs/current/static/app-psql.html), you can
turn a query into a CSV file:

    \copy (SELECT * FROM buildings_cmda) TO 'buildings-amsterdam.csv' CSV HEADER
