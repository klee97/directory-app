import pandas as pd
import json
from datetime import datetime
import os
from pathlib import Path
import sys
import re
from geopy.geocoders import Nominatim

columns_to_drop = []
# Initialize geocoder
geolocator = Nominatim(user_agent="geo_lookup")

def create_export_file(directory: str = "exports") -> str:
    """
    Create a new export file with timestamp in specified directory.
    
    Args:
        directory: Directory to store exports (default: 'exports')
    Returns:
        Path to new export file
    """
    # Create exports directory if it doesn't exist
    Path(directory).mkdir(parents=True, exist_ok=True)
    
    # Generate timestamp-based filename
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"supabase_import_{timestamp}.csv"
    print("created export file")
    return os.path.join(directory, filename)

# def extract_coords_from_google_url(url):
#     # Look for coordinates in the URL
#     coord_pattern = r'@([-\d.]+),([-\d.]+),'
#     place_pattern = r'!3d([-\d.]+)!4d([-\d.]+)!'
    
#     coord_match = re.search(coord_pattern, url)
#     if coord_match:
#         lat, lon = coord_match.groups()
#         return f"{lat},{lon}"
    
#     place_match = re.search(place_pattern, url)
#     if place_match:
#         lat, lon = place_match.groups()
#         return f"{lat},{lon}"
    
#     return None

def convert_to_postgis_point(coord_input):
    if pd.isna(coord_input):
        return pd.Series([None, None, None, None])
        
    # If input is a Google Maps URL
    # if isinstance(coord_input, str) and 'google.com/maps' in coord_input:
    #     coords = extract_coords_from_google_url(coord_input)
    #     if not coords:
    #         return None
    # else:
    gis = None

    city = None
    state = None 
    country = None
    # print(f"Attempting to geo locate {lat}, {lon}")
    try:
        lat, lon = map(float, coord_input.split(','))
        gis = f"POINT({lon} {lat})"
        location = geolocator.reverse((lat, lon), exactly_one=True)
        if location:
            address = location.raw.get("address", {})
            # print(address)
            city = address.get("city") or address.get("town") or address.get("village")
            state = address.get("state")  
            country = address.get("country")
    # except GeocoderTimedOut:
    #     city = None
    #     state = None
    except:
        print("error occurred when reverse geocoding")


    return pd.Series([gis, city, state, country])

def clean_notion_export(input_file: str, output_file: str = None) -> pd.DataFrame:
    """
    Clean Notion table export data for Supabase import.
    
    Args:
        input_file: Path to Notion CSV export
        output_file: Path for output file (optional)
    Returns:
        Cleaned DataFrame ready for Supabase import
    """
    # Verify input file exists
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found: {input_file}")
    
    # Read CSV export
    df = pd.read_csv(input_file)
    
    def clean_column_name(col: str) -> str:
        """Convert Notion column names to Supabase-friendly format"""
        return col.lower().replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '')
    
    # Clean column names
    df.columns = [clean_column_name(col) for col in df.columns]
    
    # Handle common Notion field types
    for col in df.columns:
        # Convert JSON string fields to proper format
        if df[col].dtype == 'object':
            try:
                df[col] = df[col].apply(json.loads)
            except:
                pass
        
        # Convert Notion dates to ISO format
        if 'date' in col or col.endswith('_at'):
            try:
                df[col] = pd.to_datetime(df[col]).dt.strftime('%Y-%m-%d %H:%M:%S')
            except:
                pass
                
        # Clean up multi-select fields
        if col.endswith('_select'):
            df[col] = df[col].apply(lambda x: 
                json.dumps(x) if isinstance(x, list) 
                else json.dumps([x]) if pd.notna(x)
                else '[]'
            )

        # # Clean up decimal prices to ints
        if col.endswith('_price'):
            print("Column name " + col + " type " + str(df[col].dtype))
            df[col] =  df[col].astype('Int64')



    df[['gis', 'city', 'state', 'country']] = df['location_coordinates'].apply(convert_to_postgis_point)
    # df['city'] = df['location_coordinates'].apply(convert_to_city)


    print(f"ready to output file to {output_file}")
    # Save to output file if specified
    if output_file:
        output_dir = os.path.dirname(output_file)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        df.to_csv(output_file, index=False)
        print(f"Cleaned data saved to: {output_file}")
    
    return df

if __name__ == '__main__':
    try:
        # Get input file from command line or use default
        input_file = sys.argv[1] if len(sys.argv) > 1 else 'notion_export.csv'
        
        # Create new export file
        output_file = create_export_file()
        
        # Process the data
        cleaned_df = clean_notion_export(input_file, output_file)
        print(f"Successfully processed {len(cleaned_df)} rows")
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
        sys.exit(1)
    # except Exception as e:
    #     print(f"An error occurred: {e}")
    #     print(e.message)
    #     print(e.args)
    #     sys.exit(1)