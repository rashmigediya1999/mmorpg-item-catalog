CREATE DATABASE game_catalog_test;
\c game_catalog_test;

-- Import the schema from main init.sql
\i /docker-entrypoint-initdb.d/init.sql