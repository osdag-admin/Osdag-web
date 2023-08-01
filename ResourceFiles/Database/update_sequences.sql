/* PRAGMA foreign_keys=OFF; */

/*
#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################
*/ 

BEGIN TRANSACTION;

SELECT setval('public."Material_id_seq"', (select max("id") from public."Material"), true);
SELECT setval('public."Bolt_id_seq"', (select max("id") from public."Bolt"), true);
SELECT setval('public."Anchor_Bolt_id_seq"', (select max("id") from public."Anchor_Bolt"), true);
SELECT setval('public."Angle_Pitch_id_seq"', (select max("id") from public."Angle_Pitch"), true);
SELECT setval('public."Bolt_fy_fu_id_seq"', (select max("id") from public."Bolt_fy_fu"), true);
SELECT setval('public."UnequalAngle_id_seq"', (select max("id") from public."UnequalAngle"), true);
SELECT setval('public."EqualAngle_id_seq"', (select max("id") from public."EqualAngle"), true);
SELECT setval('public."Columns_id_seq"', (select max("id") from public."Columns"), true);
SELECT setval('public."Beams_id_seq"', (select max("id") from public."Beams"), true);
SELECT setval('public."Channels_id_seq"', (select max("id") from public."Channels"), true);
SELECT setval('public."SHS_id_seq"', (select max("id") from public."SHS"), true);
SELECT setval('public."RHS_id_seq"', (select max("id") from public."RHS"), true);
SELECT setval('public."CHS_id_seq"', (select max("id") from public."CHS"), true);
SELECT setval('public."Angles_id_seq"', (select max("id") from public."Angles"), true);

END TRANSACTION;