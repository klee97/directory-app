create extension if not exists "postgis" with schema "public" version '3.3.7';

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."tag_type" AS ENUM (
    'SERVICE',
    'SKILL'
);


ALTER TYPE "public"."tag_type" OWNER TO "postgres";


CREATE TYPE "public"."vendor_type" AS ENUM (
    'BASIC',
    'PREMIUM',
    'TRIAL'
);


ALTER TYPE "public"."vendor_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user"() RETURNS "void"
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
	--delete from public.profiles where id = auth.uid();
	delete from auth.users where id = auth.uid();
$$;


ALTER FUNCTION "public"."delete_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_vendor_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    next_id INT;
BEGIN
    next_id := nextval('vendor_seq');
    RETURN 'HMUA-' || next_id;
END;$$;


ALTER FUNCTION "public"."generate_vendor_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_active_locations"("min_vendor_count" integer DEFAULT 1) RETURNS TABLE("city" "text", "state" "text", "country" "text", "state_id" integer, "metro_id" integer, "metro_region_id" integer, "lat" double precision, "lon" double precision, "vendor_count" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.city,
    v.state,
    v.country,
    (ARRAY_AGG(v.state_id))[1] as state_id,
    (ARRAY_AGG(v.metro_id))[1] as metro_id,
    (ARRAY_AGG(v.metro_region_id))[1] as metro_region_id,
    AVG(ST_Y(v.gis::geometry)) as lat,
    AVG(ST_X(v.gis::geometry)) as lon,
    COUNT(*) as vendor_count
  FROM vendors v
  WHERE v.city IS NOT NULL 
    AND v.state IS NOT NULL 
    AND v.country IS NOT NULL
    AND v.gis IS NOT NULL
  GROUP BY v.city, v.state, v.country  -- Removed gis and IDs from GROUP BY
  HAVING COUNT(*) >= min_vendor_count
  ORDER BY vendor_count DESC, v.state, v.city;
END;
$$;


ALTER FUNCTION "public"."get_active_locations"("min_vendor_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_id_by_email"("p_email" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
    return (
        select id
        from auth.users
        where lower(email) = lower(p_email)
        limit 1
    );
end;
$$;


ALTER FUNCTION "public"."get_user_id_by_email"("p_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vendors_by_distance"("lat" double precision, "lon" double precision, "radius_miles" double precision, "limit_results" integer) RETURNS TABLE("business_name" "text", "bridal_hair_price" integer, "bridal_makeup_price" integer, "cover_image" "text", "id" "text", "lists_prices" boolean, "location_coordinates" "text", "region" "text", "specialization" "text", "travels_world_wide" boolean, "city" "text", "state" "text", "country" "text", "slug" "text", "gis" "public"."geometry", "state_id" integer, "metro_id" integer, "metro_region_id" integer, "distance_miles" double precision)
    LANGUAGE "sql"
    AS $$
  select 
    v.business_name,
    v.bridal_hair_price,
    v.bridal_makeup_price,
    v.cover_image,
    v.id,
    v.lists_prices,
    v.location_coordinates,
    v.region,
    v.specialization,
    v.travels_world_wide,
    v.city,
    v.state,
    v.country,
    v.slug,
    v.gis,
    v.state_id,
    v.metro_id,
    v.metro_region_id,
    ST_Distance(
      v.gis::geography,
      ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
    ) * 0.000621371 as distance_miles
  from vendors v
  where ST_DWithin(
    v.gis::geography,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
    radius_miles * 1609.34
  )
  order by distance_miles
  limit limit_results;
$$;


ALTER FUNCTION "public"."get_vendors_by_distance"("lat" double precision, "lon" double precision, "radius_miles" double precision, "limit_results" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vendors_by_location_with_distinct_tags_and_media"("lon" double precision, "lat" double precision, "radius_miles" double precision, "limit_results" integer) RETURNS TABLE("business_name" "text", "bridal_hair_price" numeric, "bridal_makeup_price" numeric, "cover_image" "text", "id" "text", "lists_prices" boolean, "location_coordinates" "text", "region" "text", "specialization" "text", "travels_world_wide" boolean, "city" "text", "state" "text", "country" "text", "slug" "text", "gis" "public"."geometry", "state_id" integer, "metro_id" integer, "metro_region_id" integer, "distance_miles" double precision, "vendor_type" "text", "tags" "json", "vendor_media" "json")
    LANGUAGE "sql"
    AS $$SELECT 
  v.business_name,
  v.bridal_hair_price,
  v.bridal_makeup_price,
  v.cover_image,
  v.id,
  v.lists_prices,
  v.location_coordinates,
  v.region,
  v.specialization,
  v.travels_world_wide,
  v.city,
  v.state,
  v.country,
  v.slug,
  v.gis,
  v.state_id,
  v.metro_id,
  v.metro_region_id,
  ST_Distance(
    v.gis::geography,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
  ) * 0.000621371 as distance_miles,
  v.vendor_type,

  -- Aggregate tags into JSON array with DISTINCT
  COALESCE(
    (SELECT json_agg(
       json_build_object(
         'id', tag_data.id,
         'name', tag_data.name,
         'display_name', tag_data.display_name,
         'is_visible', tag_data.is_visible,
         'style', tag_data.style
       )
     )
     FROM (
       SELECT DISTINCT t.id, t.name, t.display_name, t.is_visible, t.style
       FROM vendor_tags vt2
       JOIN tags t ON t.id = vt2.tag_id
       WHERE vt2.vendor_id = v.id
     ) tag_data
    ), 
    '[]'::json
  ) as tags,

  -- Aggregate vendor_media into JSON array with DISTINCT
  COALESCE(
    (SELECT json_agg(
       json_build_object(
         'id', media_data.id,
         'media_url', media_data.media_url,
         'is_featured', media_data.is_featured,
         'consent_given', media_data.consent_given,
         'credits', media_data.credits
       )
     )
     FROM (
       SELECT DISTINCT vm.id, vm.media_url, vm.created_at, vm.is_featured, vm.consent_given, vm.credits
       FROM vendor_media vm
       WHERE vm.vendor_id = v.id
       ORDER BY vm.created_at
     ) media_data
    ),
    '[]'::json
  ) as vendor_media

FROM vendors v

WHERE ST_DWithin(
  v.gis::geography,
  ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
  radius_miles * 1609.34
)

ORDER BY distance_miles
LIMIT limit_results;$$;


ALTER FUNCTION "public"."get_vendors_by_location_with_distinct_tags_and_media"("lon" double precision, "lat" double precision, "radius_miles" double precision, "limit_results" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vendors_by_location_with_tags"("lat" double precision, "lon" double precision, "radius_miles" double precision, "limit_results" integer DEFAULT 50) RETURNS TABLE("business_name" "text", "bridal_hair_price" numeric, "bridal_makeup_price" numeric, "cover_image" "text", "id" "text", "lists_prices" boolean, "location_coordinates" "text", "region" "text", "specialization" "text", "travels_world_wide" boolean, "city" "text", "state" "text", "country" "text", "slug" "text", "gis" "public"."geometry", "state_id" integer, "metro_id" integer, "metro_region_id" integer, "distance_miles" double precision, "vendor_type" "public"."vendor_type", "tags" "json")
    LANGUAGE "sql"
    AS $$
  SELECT 
    v.business_name,
    v.bridal_hair_price,
    v.bridal_makeup_price,
    v.cover_image,
    v.id,
    v.lists_prices,
    v.location_coordinates,
    v.region,
    v.specialization,
    v.travels_world_wide,
    v.city,
    v.state,
    v.country,
    v.slug,
    v.gis,
    v.state_id,
    v.metro_id,
    v.metro_region_id,
    ST_Distance(
      v.gis::geography,
      ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
    ) * 0.000621371 as distance_miles,
    v.vendor_type,
    -- Aggregate tags into JSON array
    COALESCE(
      json_agg(
        json_build_object(
          'id', t.id,
          'name', t.name,
          'display_name', t.display_name,
          'is_visible', t.is_visible,
          'style', t.style
        )
      ) FILTER (WHERE t.id IS NOT NULL), 
      '[]'::json
    ) as tags
  FROM vendors v
  LEFT JOIN vendor_tags vt ON vt.vendor_id = v.id
  LEFT JOIN tags t ON t.id = vt.tag_id
  WHERE ST_DWithin(
    v.gis::geography,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
    radius_miles * 1609.34
  )
  GROUP BY v.id, v.business_name, v.bridal_hair_price, v.bridal_makeup_price, 
           v.cover_image, v.lists_prices, v.location_coordinates, v.region, 
           v.specialization, v.travels_world_wide, v.city, v.state, v.country, 
           v.slug, v.gis, v.state_id, v.metro_id, v.metro_region_id, v.vendor_type
  ORDER BY distance_miles
  LIMIT limit_results;
$$;


ALTER FUNCTION "public"."get_vendors_by_location_with_tags"("lat" double precision, "lon" double precision, "radius_miles" double precision, "limit_results" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_vendors_by_location_with_tags_and_media"("lon" double precision, "lat" double precision, "radius_miles" double precision, "limit_results" integer) RETURNS TABLE("business_name" "text", "bridal_hair_price" numeric, "bridal_makeup_price" numeric, "cover_image" "text", "id" "text", "lists_prices" boolean, "location_coordinates" "text", "region" "text", "specialization" "text", "travels_world_wide" boolean, "city" "text", "state" "text", "country" "text", "slug" "text", "gis" "public"."geometry", "state_id" integer, "metro_id" integer, "metro_region_id" integer, "distance_miles" double precision, "vendor_type" "text", "tags" "json", "vendor_media" "json")
    LANGUAGE "sql"
    AS $$
  SELECT 
  v.business_name,
  v.bridal_hair_price,
  v.bridal_makeup_price,
  v.cover_image,
  v.id,
  v.lists_prices,
  v.location_coordinates,
  v.region,
  v.specialization,
  v.travels_world_wide,
  v.city,
  v.state,
  v.country,
  v.slug,
  v.gis,
  v.state_id,
  v.metro_id,
  v.metro_region_id,
  ST_Distance(
    v.gis::geography,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
  ) * 0.000621371 as distance_miles,
  v.vendor_type,

  -- Aggregate tags into JSON array
  COALESCE(
    json_agg(
      json_build_object(
        'id', t.id,
        'name', t.name,
        'display_name', t.display_name,
        'is_visible', t.is_visible,
        'style', t.style
      )
    ) FILTER (WHERE t.id IS NOT NULL), 
    '[]'::json
  ) as tags,

  -- Aggregate vendor_media into JSON array
  COALESCE(
    json_agg(
      json_build_object(
        'id', vm.id,
        'media_url', vm.media_url
      )
    ) FILTER (WHERE vm.id IS NOT NULL),
    '[]'::json
  ) as vendor_media

FROM vendors v

LEFT JOIN vendor_tags vt ON vt.vendor_id = v.id
LEFT JOIN tags t ON t.id = vt.tag_id
LEFT JOIN vendor_media vm ON vm.vendor_id = v.id

WHERE ST_DWithin(
  v.gis::geography,
  ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
  radius_miles * 1609.34
)

GROUP BY 
  v.id, v.business_name, v.bridal_hair_price, v.bridal_makeup_price, 
  v.cover_image, v.lists_prices, v.location_coordinates, v.region, 
  v.specialization, v.travels_world_wide, v.city, v.state, v.country, 
  v.slug, v.gis, v.state_id, v.metro_id, v.metro_region_id, v.vendor_type

ORDER BY distance_miles
LIMIT limit_results;

$$;


ALTER FUNCTION "public"."get_vendors_by_location_with_tags_and_media"("lon" double precision, "lat" double precision, "radius_miles" double precision, "limit_results" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_approved_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.consent_given = true then
    if TG_OP = 'INSERT' or old.consent_given is distinct from true then
      new.approved_at := now();
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."set_approved_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_profile_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_vendor_location"("vendor_id" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  UPDATE vendors v
  SET metro_region_id = (
      SELECT id FROM regions r
      WHERE ST_Contains(r.geom, v.gis)
      LIMIT 1
  ),
  metro_id = (
      SELECT gid FROM usmetro m
      WHERE ST_Contains(m.geom, v.gis)
      LIMIT 1
  ),
  state_id = (
      SELECT gid FROM usstates s
      WHERE ST_Contains(s.geom, v.gis)
      LIMIT 1
  )
  WHERE v.id = vendor_id;
END;$$;


ALTER FUNCTION "public"."update_vendor_location"("vendor_id" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rating" integer,
    "comment" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "feedback_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 3)))
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."hmau_vendor_seq"
    START WITH 135
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."hmau_vendor_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."location_slugs" (
    "slug" "text" NOT NULL,
    "city" "text",
    "state" "text",
    "country" "text",
    "vendor_count" integer DEFAULT 0 NOT NULL,
    "lat" double precision,
    "lon" double precision,
    "type" "text" GENERATED ALWAYS AS (
CASE
    WHEN ("city" IS NOT NULL) THEN 'city'::"text"
    WHEN ("state" IS NOT NULL) THEN 'state'::"text"
    ELSE 'country'::"text"
END) STORED
);


ALTER TABLE "public"."location_slugs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "is_admin" boolean DEFAULT false,
    "vendor_id" "text",
    "is_test" boolean DEFAULT false NOT NULL,
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text", 'vendor'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."regions" (
    "id" integer NOT NULL,
    "name" "text",
    "geom" "public"."geometry"(MultiPolygon,4326)
);


ALTER TABLE "public"."regions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "is_visible" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "display_name" "text",
    "style" "text",
    "type" "public"."tag_type" DEFAULT 'SKILL'::"public"."tag_type" NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_favorites" (
    "id" bigint NOT NULL,
    "inserted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "vendor_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "is_favorited" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."user_favorites" OWNER TO "postgres";


ALTER TABLE "public"."user_favorites" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_favorites_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."usmetro" (
    "gid" integer NOT NULL,
    "csafp" character varying(3),
    "cbsafp" character varying(5),
    "metdivfp" character varying(5),
    "geoidfq" character varying(19),
    "geoid" character varying(10),
    "name" character varying(100),
    "namelsad" character varying(100),
    "lsad" character varying(2),
    "aland" double precision,
    "awater" double precision,
    "geom" "public"."geometry"(MultiPolygon,4326),
    "display_name" "text"
);


ALTER TABLE "public"."usmetro" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."usmetro_gid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."usmetro_gid_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."usmetro_gid_seq" OWNED BY "public"."usmetro"."gid";



CREATE SEQUENCE IF NOT EXISTS "public"."usmetro_regions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."usmetro_regions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."usmetro_regions_id_seq" OWNED BY "public"."regions"."id";



CREATE TABLE IF NOT EXISTS "public"."usstates" (
    "gid" integer NOT NULL,
    "statefp" character varying(2),
    "statens" character varying(8),
    "geoidfq" character varying(11),
    "geoid" character varying(2),
    "stusps" character varying(2),
    "name" character varying(100),
    "lsad" character varying(2),
    "aland" double precision,
    "awater" double precision,
    "geom" "public"."geometry"(MultiPolygon,4326)
);


ALTER TABLE "public"."usstates" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."usstates_gid_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."usstates_gid_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."usstates_gid_seq" OWNED BY "public"."usstates"."gid";



CREATE TABLE IF NOT EXISTS "public"."vendor_drafts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vendor_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "business_name" "text",
    "website" "text",
    "email" "text",
    "ig_handle" "text",
    "google_maps_place" "text",
    "description" "text",
    "location_data" "jsonb",
    "travels_world_wide" boolean,
    "lists_prices" boolean,
    "bridal_hair_price" integer,
    "bridal_makeup_price" integer,
    "bridal_hair_&_makeup_price" integer,
    "bridesmaid_hair_price" integer,
    "bridesmaid_makeup_price" integer,
    "bridesmaid_hair_&_makeup_price" integer,
    "cover_image" "text",
    "profile_image" "text",
    "logo" "text",
    "tags" "jsonb",
    "images" "jsonb",
    "last_saved_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_published" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vendor_drafts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "media_url" "text" NOT NULL,
    "vendor_id" "text" NOT NULL,
    "approved_at" timestamp with time zone,
    "credits" "text",
    "consent_given" boolean DEFAULT false NOT NULL,
    "is_featured" boolean DEFAULT false
);


ALTER TABLE "public"."vendor_media" OWNER TO "postgres";


COMMENT ON COLUMN "public"."vendor_media"."approved_at" IS 'Timestamp when photo IP rights were verified';



COMMENT ON COLUMN "public"."vendor_media"."credits" IS 'Photo credits';



CREATE TABLE IF NOT EXISTS "public"."vendor_recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vendor_id" "text",
    "business_name" "text" NOT NULL,
    "website" "text",
    "region" "text" NOT NULL,
    "ig_handle" "text",
    "recommended_by" "text",
    "notes" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "vendor_recommendations_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."vendor_recommendations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."vendor_seq"
    START WITH 135
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."vendor_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_tags" (
    "vendor_id" "text" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."vendor_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_testimonials" (
    "id" bigint NOT NULL,
    "inserted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "vendor_id" "text" NOT NULL,
    "author" "text",
    "review" "text"
);


ALTER TABLE "public"."vendor_testimonials" OWNER TO "postgres";


ALTER TABLE "public"."vendor_testimonials" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."vendor_testimonials_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."vendors" (
    "business_name" "text",
    "bridal_hair_&_makeup_price" integer,
    "bridal_hair_price" integer,
    "bridal_makeup_price" integer,
    "bridesmaid_hair_&_makeup_price" integer,
    "bridesmaid_hair_price" integer,
    "bridesmaid_makeup_price" integer,
    "cover_image" "text",
    "email" "text",
    "google_maps_place" "text",
    "id" "text" DEFAULT "public"."generate_vendor_id"() NOT NULL,
    "ig_handle" "text",
    "lists_prices" boolean,
    "location_coordinates" "text",
    "logo" "text",
    "region" "text",
    "specialization" "text",
    "travels_world_wide" boolean,
    "website" "text",
    "city" "text",
    "state" "text",
    "country" "text",
    "slug" "text",
    "gis" "public"."geometry",
    "state_id" integer,
    "metro_id" integer,
    "metro_region_id" integer,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "vendor_type" "public"."vendor_type" DEFAULT 'BASIC'::"public"."vendor_type" NOT NULL,
    "profile_image" "text",
    "description" "text",
    "access_token" "uuid" DEFAULT "gen_random_uuid"(),
    "latitude" double precision,
    "longitude" double precision,
    "gis_computed" "public"."geometry"(Point,4326) GENERATED ALWAYS AS (
CASE
    WHEN (("latitude" IS NOT NULL) AND ("longitude" IS NOT NULL)) THEN "public"."st_setsrid"("public"."st_makepoint"("longitude", "latitude"), 4326)
    ELSE NULL::"public"."geometry"
END) STORED,
    "include_in_directory" boolean DEFAULT true NOT NULL,
    "verified_at" timestamp with time zone,
    "approved_inquiries_at" timestamp with time zone,
    CONSTRAINT "valid_latitude" CHECK ((("latitude" >= ('-90'::integer)::double precision) AND ("latitude" <= (90)::double precision))),
    CONSTRAINT "valid_longitude" CHECK ((("longitude" >= ('-180'::integer)::double precision) AND ("longitude" <= (180)::double precision)))
);


ALTER TABLE "public"."vendors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendors_test" (
    "business_name" "text",
    "bridal_hair_&_makeup_price" integer,
    "bridal_hair_price" integer,
    "bridal_makeup_price" integer,
    "bridesmaid_hair_&_makeup_price" integer,
    "bridesmaid_hair_price" integer,
    "bridesmaid_makeup_price" integer,
    "cover_image" "text",
    "email" "text",
    "google_maps_place" "text",
    "id" "text" DEFAULT "public"."generate_vendor_id"() NOT NULL,
    "ig_handle" "text",
    "lists_prices" boolean,
    "location_coordinates" "text",
    "logo" "text",
    "region" "text",
    "specialization" "text",
    "travels_world_wide" boolean,
    "website" "text",
    "city" "text",
    "state" "text",
    "country" "text",
    "slug" "text",
    "gis" "public"."geometry",
    "state_id" integer,
    "metro_id" integer,
    "metro_region_id" integer
);


ALTER TABLE "public"."vendors_test" OWNER TO "postgres";


COMMENT ON TABLE "public"."vendors_test" IS 'This is a duplicate of vendors';



ALTER TABLE ONLY "public"."regions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."usmetro_regions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."usmetro" ALTER COLUMN "gid" SET DEFAULT "nextval"('"public"."usmetro_gid_seq"'::"regclass");



ALTER TABLE ONLY "public"."usstates" ALTER COLUMN "gid" SET DEFAULT "nextval"('"public"."usstates_gid_seq"'::"regclass");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."location_slugs"
    ADD CONSTRAINT "location_slugs_pkey" PRIMARY KEY ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_display_name_key" UNIQUE ("display_name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usmetro"
    ADD CONSTRAINT "usmetro_pkey" PRIMARY KEY ("gid");



ALTER TABLE ONLY "public"."regions"
    ADD CONSTRAINT "usmetro_regions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usstates"
    ADD CONSTRAINT "usstates_pkey" PRIMARY KEY ("gid");



ALTER TABLE ONLY "public"."vendor_drafts"
    ADD CONSTRAINT "vendor_drafts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_drafts"
    ADD CONSTRAINT "vendor_drafts_vendor_id_user_id_key" UNIQUE ("vendor_id", "user_id");



ALTER TABLE ONLY "public"."vendor_media"
    ADD CONSTRAINT "vendor_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_recommendations"
    ADD CONSTRAINT "vendor_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_tags"
    ADD CONSTRAINT "vendor_tags_pkey" PRIMARY KEY ("vendor_id", "tag_id");



ALTER TABLE ONLY "public"."vendor_testimonials"
    ADD CONSTRAINT "vendor_testimonials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_acesss_token_key" UNIQUE ("access_token");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."vendors_test"
    ADD CONSTRAINT "vendors_test_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."vendors_test"
    ADD CONSTRAINT "vendors_test_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendors_test"
    ADD CONSTRAINT "vendors_test_slug_key" UNIQUE ("slug");



CREATE UNIQUE INDEX "idx_one_featured_per_vendor" ON "public"."vendor_media" USING "btree" ("vendor_id") WHERE ("is_featured" = true);



CREATE INDEX "idx_vendor_media_featured" ON "public"."vendor_media" USING "btree" ("vendor_id", "is_featured") WHERE ("is_featured" = true);



CREATE UNIQUE INDEX "idx_vendor_media_unique" ON "public"."vendor_media" USING "btree" ("media_url", "vendor_id");



CREATE INDEX "idx_vendors_coordinates" ON "public"."vendors" USING "btree" ("latitude", "longitude");



CREATE INDEX "metro_geom_idx" ON "public"."usmetro" USING "gist" ("geom");



CREATE INDEX "metro_regions_geom_idx" ON "public"."regions" USING "gist" ("geom");



CREATE INDEX "profiles_vendor_id_idx" ON "public"."profiles" USING "btree" ("vendor_id");



CREATE INDEX "states_geom_idx" ON "public"."usstates" USING "gist" ("geom");



CREATE INDEX "user_favorites_user_id_idx" ON "public"."user_favorites" USING "btree" ("user_id", "is_favorited");



CREATE UNIQUE INDEX "user_favorites_user_vendor_unique_idx" ON "public"."user_favorites" USING "btree" ("user_id", "vendor_id");



CREATE INDEX "usmetro_geom_idx" ON "public"."usmetro" USING "gist" ("geom");



CREATE INDEX "usstates_geom_idx" ON "public"."usstates" USING "gist" ("geom");



CREATE INDEX "vendor_geom_idx" ON "public"."vendors" USING "gist" ("gis");



CREATE INDEX "vendor_media_vendor_idx" ON "public"."vendor_media" USING "btree" ("vendor_id");



CREATE INDEX "vendor_testimonials_vendor_id_idx" ON "public"."vendor_testimonials" USING "btree" ("vendor_id");



CREATE INDEX "vendors_gis_idx" ON "public"."vendors" USING "gist" ("gis");



CREATE INDEX "vendors_state_ci_idx" ON "public"."vendors" USING "btree" ("lower"("state"));



CREATE INDEX "vendors_state_idx" ON "public"."vendors" USING "btree" ("state");



CREATE INDEX "vendors_test_gis_idx" ON "public"."vendors_test" USING "gist" ("gis");



CREATE INDEX "vendors_test_gis_idx1" ON "public"."vendors_test" USING "gist" ("gis");



CREATE OR REPLACE TRIGGER "trigger_set_approved_at" BEFORE INSERT OR UPDATE ON "public"."vendor_media" FOR EACH ROW EXECUTE FUNCTION "public"."set_approved_at"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_profile_updated_at"();



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "fk_vendors_metro_region" FOREIGN KEY ("metro_region_id") REFERENCES "public"."regions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."vendor_drafts"
    ADD CONSTRAINT "vendor_drafts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_media"
    ADD CONSTRAINT "vendor_media_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id");



ALTER TABLE ONLY "public"."vendor_recommendations"
    ADD CONSTRAINT "vendor_recommendations_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vendor_tags"
    ADD CONSTRAINT "vendor_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vendor_tags"
    ADD CONSTRAINT "vendor_tags_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vendor_testimonials"
    ADD CONSTRAINT "vendor_testimonials_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_metro_id_fkey" FOREIGN KEY ("metro_id") REFERENCES "public"."usmetro"("gid");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "public"."usstates"("gid");



ALTER TABLE ONLY "public"."vendors_test"
    ADD CONSTRAINT "vendors_test_metro_id_fkey" FOREIGN KEY ("metro_id") REFERENCES "public"."usmetro"("gid");



ALTER TABLE ONLY "public"."vendors_test"
    ADD CONSTRAINT "vendors_test_metro_region_id_fkey" FOREIGN KEY ("metro_region_id") REFERENCES "public"."regions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."vendors_test"
    ADD CONSTRAINT "vendors_test_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "public"."usstates"("gid");



CREATE POLICY "Admin access" ON "public"."vendor_drafts" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admin access" ON "public"."vendors" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admin access" ON "public"."vendors_test" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admin can delete" ON "public"."vendor_media" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admin can insert" ON "public"."vendor_media" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admin can update " ON "public"."vendor_media" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admin can update tags" ON "public"."vendor_tags" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can add tags" ON "public"."vendor_tags" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can create vendors" ON "public"."vendors" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can create vendors" ON "public"."vendors_test" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can delete profiles" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("is_admin" = true));



CREATE POLICY "Admins can delete vendors" ON "public"."vendors" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can delete vendors" ON "public"."vendors_test" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can insert profiles" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("is_admin" = true));



CREATE POLICY "Admins can update profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" WITH CHECK (("is_admin" = true));



CREATE POLICY "Admins can update vendors" ON "public"."vendors" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can update vendors" ON "public"."vendors_test" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("is_admin" = true));



CREATE POLICY "Admins can view vendors" ON "public"."vendors" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Admins can view vendors" ON "public"."vendors_test" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."is_admin" = true)))));



CREATE POLICY "Allow read access to everyone" ON "public"."location_slugs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."tags" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."vendor_tags" FOR SELECT USING (true);



CREATE POLICY "No public deletes" ON "public"."feedback" FOR DELETE USING (true);



CREATE POLICY "No public deletes" ON "public"."regions" FOR DELETE USING (false);



CREATE POLICY "No public deletes" ON "public"."tags" FOR DELETE USING (false);



CREATE POLICY "No public deletes" ON "public"."usmetro" FOR DELETE USING (false);



CREATE POLICY "No public deletes" ON "public"."usstates" FOR DELETE USING (false);



CREATE POLICY "No public deletes" ON "public"."vendor_recommendations" FOR DELETE USING (false);



CREATE POLICY "No public deletes" ON "public"."vendor_testimonials" FOR DELETE USING (false);



CREATE POLICY "No public deletes" ON "public"."vendors" FOR DELETE USING (false);



CREATE POLICY "No public inserts" ON "public"."regions" FOR INSERT WITH CHECK (false);



CREATE POLICY "No public inserts" ON "public"."tags" FOR INSERT WITH CHECK (false);



CREATE POLICY "No public inserts" ON "public"."usmetro" FOR INSERT WITH CHECK (false);



CREATE POLICY "No public inserts" ON "public"."usstates" FOR INSERT WITH CHECK (false);



CREATE POLICY "No public inserts" ON "public"."vendor_testimonials" FOR INSERT WITH CHECK (false);



CREATE POLICY "No public inserts" ON "public"."vendors" FOR INSERT WITH CHECK (false);



CREATE POLICY "No public updates" ON "public"."feedback" FOR UPDATE USING (false);



CREATE POLICY "No public updates" ON "public"."regions" FOR UPDATE USING (false);



CREATE POLICY "No public updates" ON "public"."tags" FOR UPDATE USING (false);



CREATE POLICY "No public updates" ON "public"."usmetro" FOR UPDATE USING (false);



CREATE POLICY "No public updates" ON "public"."usstates" FOR UPDATE USING (false);



CREATE POLICY "No public updates" ON "public"."vendor_recommendations" FOR UPDATE USING (false);



CREATE POLICY "No public updates" ON "public"."vendor_testimonials" FOR UPDATE USING (false);



CREATE POLICY "No public updates" ON "public"."vendors" FOR UPDATE USING (false);



CREATE POLICY "Public insert" ON "public"."feedback" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public insert" ON "public"."vendor_recommendations" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public read" ON "public"."feedback" FOR SELECT USING (true);



CREATE POLICY "Public read" ON "public"."vendor_recommendations" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."regions" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."usmetro" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."usstates" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."vendor_testimonials" FOR SELECT USING (true);



CREATE POLICY "Public read access" ON "public"."vendors" FOR SELECT USING (true);



CREATE POLICY "Read for all users" ON "public"."vendor_media" FOR SELECT USING (true);



CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view/modify own data" ON "public"."user_favorites" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Vendor can update own media" ON "public"."vendor_media" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."vendor_id" = "vendor_media"."vendor_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."vendor_id" = "vendor_media"."vendor_id")))));



CREATE POLICY "Vendors can update their own drafts" ON "public"."vendor_drafts" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Vendors can update their own row" ON "public"."vendor_tags" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."vendor_id" = "vendor_tags"."vendor_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."vendor_id" = "vendor_tags"."vendor_id")))));



CREATE POLICY "Vendors may update own row" ON "public"."vendors" TO "authenticated" USING (("id" = ( SELECT "profiles"."vendor_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))) WITH CHECK (("id" = ( SELECT "profiles"."vendor_id"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"()))));



ALTER TABLE "public"."feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."location_slugs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."regions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usmetro" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usstates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_drafts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendor_testimonials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vendors_test" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_vendor_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_vendor_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_vendor_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_active_locations"("min_vendor_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_active_locations"("min_vendor_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_active_locations"("min_vendor_count" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_user_id_by_email"("p_email" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_user_id_by_email"("p_email" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_user_id_by_email"("p_email" "text") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."get_vendors_by_distance"("lat" double precision, "lon" double precision, "radius_miles" double precision, "limit_results" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_vendors_by_distance"("lat" double precision, "lon" double precision, "radius_miles" double precision, "limit_results" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vendors_by_distance"("lat" double precision, "lon" double precision, "radius_miles" double precision, "limit_results" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_vendors_by_location_with_distinct_tags_and_media"("lon" double precision, "lat" double precision, "radius_miles" double precision, "limit_results" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_vendors_by_location_with_distinct_tags_and_media"("lon" double precision, "lat" double precision, "radius_miles" double precision, "limit_results" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vendors_by_location_with_distinct_tags_and_media"("lon" double precision, "lat" double precision, "radius_miles" double precision, "limit_results" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_vendors_by_location_with_tags"("lat" double precision, "lon" double precision, "radius_miles" double precision, "limit_results" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_vendors_by_location_with_tags"("lat" double precision, "lon" double precision, "radius_miles" double precision, "limit_results" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vendors_by_location_with_tags"("lat" double precision, "lon" double precision, "radius_miles" double precision, "limit_results" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_vendors_by_location_with_tags_and_media"("lon" double precision, "lat" double precision, "radius_miles" double precision, "limit_results" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_vendors_by_location_with_tags_and_media"("lon" double precision, "lat" double precision, "radius_miles" double precision, "limit_results" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_vendors_by_location_with_tags_and_media"("lon" double precision, "lat" double precision, "radius_miles" double precision, "limit_results" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_approved_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_approved_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_approved_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_vendor_location"("vendor_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_vendor_location"("vendor_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_vendor_location"("vendor_id" "text") TO "service_role";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";



GRANT ALL ON SEQUENCE "public"."hmau_vendor_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."hmau_vendor_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."hmau_vendor_seq" TO "service_role";



GRANT ALL ON TABLE "public"."location_slugs" TO "anon";
GRANT ALL ON TABLE "public"."location_slugs" TO "authenticated";
GRANT ALL ON TABLE "public"."location_slugs" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."regions" TO "anon";
GRANT ALL ON TABLE "public"."regions" TO "authenticated";
GRANT ALL ON TABLE "public"."regions" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."user_favorites" TO "anon";
GRANT ALL ON TABLE "public"."user_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_favorites" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_favorites_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_favorites_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_favorites_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."usmetro" TO "anon";
GRANT ALL ON TABLE "public"."usmetro" TO "authenticated";
GRANT ALL ON TABLE "public"."usmetro" TO "service_role";



GRANT ALL ON SEQUENCE "public"."usmetro_gid_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."usmetro_gid_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."usmetro_gid_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."usmetro_regions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."usmetro_regions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."usmetro_regions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."usstates" TO "anon";
GRANT ALL ON TABLE "public"."usstates" TO "authenticated";
GRANT ALL ON TABLE "public"."usstates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."usstates_gid_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."usstates_gid_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."usstates_gid_seq" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_drafts" TO "anon";
GRANT ALL ON TABLE "public"."vendor_drafts" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_drafts" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_media" TO "anon";
GRANT ALL ON TABLE "public"."vendor_media" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_media" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."vendor_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_recommendations" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vendor_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vendor_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vendor_seq" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_tags" TO "anon";
GRANT ALL ON TABLE "public"."vendor_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_tags" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_testimonials" TO "anon";
GRANT ALL ON TABLE "public"."vendor_testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_testimonials" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vendor_testimonials_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vendor_testimonials_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vendor_testimonials_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."vendors" TO "anon";
GRANT ALL ON TABLE "public"."vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."vendors" TO "service_role";



GRANT ALL ON TABLE "public"."vendors_test" TO "anon";
GRANT ALL ON TABLE "public"."vendors_test" TO "authenticated";
GRANT ALL ON TABLE "public"."vendors_test" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






