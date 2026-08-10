CREATE OR REPLACE FUNCTION public.get_vendors_by_location_with_distinct_tags_and_media_v3(
  lat double precision,
  lon double precision,
  radius_miles double precision,
  limit_results integer
) RETURNS TABLE (
  business_name text,
  bridal_hair_price integer,
  bridal_makeup_price integer,
  cover_image text,
  id text,
  lists_prices boolean,
  location_coordinates text,
  region text,
  specialization text,
  travels_world_wide boolean,
  city text,
  state text,
  country text,
  slug text,
  gis geometry,
  state_id integer,
  metro_id integer,
  metro_region_id integer,
  distance_miles double precision,
  vendor_type public.vendor_type,
  verified_at timestamptz,
  tags json,
  vendor_media json,
  latitude double precision,
  longitude double precision
)
LANGUAGE sql
AS $function$
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
  v.verified_at,

  -- Aggregate tags into JSON array
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

  -- Aggregate vendor_media into JSON array
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
  ) as vendor_media,
  
  v.latitude,
  v.longitude

FROM vendors v

WHERE ST_DWithin(
  v.gis::geography,
  ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
  radius_miles * 1609.34
)

ORDER BY distance_miles
LIMIT limit_results;
$function$
;