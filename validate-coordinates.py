#!/usr/bin/env python3
import os
import math
import time
import requests
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables from .env.local
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
MAPBOX_TOKEN = os.getenv('NEXT_PUBLIC_MAPBOX_TOKEN')

DISTANCE_THRESHOLD_KM = 0.5
MAPBOX_BATCH_DELAY = 0.1  # seconds

def geocode_address(address):
    """Geocode an address using Mapbox API"""
    try:
        encoded_address = requests.utils.quote(address)
        url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{encoded_address}.json?access_token={MAPBOX_TOKEN}&limit=1"
        
        response = requests.get(url)
        if response.status_code != 200:
            print(f"❌ Mapbox error for '{address}': {response.status_code}")
            return None
        
        data = response.json()
        if not data.get('features') or len(data['features']) == 0:
            return None
        
        lng, lat = data['features'][0]['geometry']['coordinates']
        return {'lat': lat, 'lng': lng}
    
    except Exception as e:
        print(f"❌ Geocoding error for '{address}': {e}")
        return None

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers"""
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat/2) * math.sin(dlat/2) + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon/2) * math.sin(dlon/2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def format_address(facility):
    """Format address from facility data"""
    parts = [
        facility.get('street_address'),
        facility.get('city'),
        facility.get('state'),
        facility.get('zip_code'),
        facility.get('country'),
    ]
    return ', '.join(filter(None, parts))

def main():
    print('🚀 Starting coordinate validation...')
    print(f'📍 Distance threshold: {DISTANCE_THRESHOLD_KM} km')
    print('')
    
    try:
        # Connect to Supabase
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Fetch all facilities with company names
        print('📋 Fetching facilities...')
        response = supabase.table('facilities').select(
            'id, company_id, street_address, city, state, zip_code, country, latitude, longitude, companies(company_name)'
        ).execute()
        
        facilities = response.data
        
        if not facilities:
            print('✅ No facilities found')
            return
        
        print(f'📋 Found {len(facilities)} facilities to validate')
        print('')
        
        results = []
        processed = 0
        updated = 0
        errors = 0
        
        for facility in facilities:
            processed += 1
            
            company_name = 'Unknown'
            if facility.get('companies') and isinstance(facility['companies'], dict):
                company_name = facility['companies'].get('company_name', 'Unknown')
            elif facility.get('companies') and isinstance(facility['companies'], list) and len(facility['companies']) > 0:
                company_name = facility['companies'][0].get('company_name', 'Unknown')
            
            address = format_address(facility)
            
            # Show progress
            if processed % 50 == 0:
                print(f'⏳ Processing {processed}/{len(facilities)}...')
            
            # Skip if missing critical address info
            if not address or len(address.split(',')) < 2:
                results.append({
                    'facilityId': facility['id'],
                    'companyName': company_name,
                    'address': address,
                    'currentCoords': {'lat': facility['latitude'], 'lng': facility['longitude']},
                    'newCoords': None,
                    'distance': None,
                    'status': 'error',
                    'error': 'Incomplete address'
                })
                errors += 1
                continue
            
            # Geocode the address
            new_coords = geocode_address(address)
            
            if not new_coords:
                results.append({
                    'facilityId': facility['id'],
                    'companyName': company_name,
                    'address': address,
                    'currentCoords': {'lat': facility['latitude'], 'lng': facility['longitude']},
                    'newCoords': None,
                    'distance': None,
                    'status': 'error',
                    'error': 'Geocoding failed'
                })
                errors += 1
                time.sleep(MAPBOX_BATCH_DELAY)
                continue
            
            # Calculate distance if current coordinates exist
            distance = None
            should_update = False
            
            if facility['latitude'] is not None and facility['longitude'] is not None:
                distance = calculate_distance(
                    facility['latitude'],
                    facility['longitude'],
                    new_coords['lat'],
                    new_coords['lng']
                )
                should_update = distance > DISTANCE_THRESHOLD_KM
            else:
                # No current coordinates, so update if we have new ones
                should_update = True
            
            if should_update:
                # Update the database
                try:
                    supabase.table('facilities').update({
                        'latitude': new_coords['lat'],
                        'longitude': new_coords['lng']
                    }).eq('id', facility['id']).execute()
                    
                    results.append({
                        'facilityId': facility['id'],
                        'companyName': company_name,
                        'address': address,
                        'currentCoords': {'lat': facility['latitude'], 'lng': facility['longitude']},
                        'newCoords': new_coords,
                        'distance': distance,
                        'status': 'updated'
                    })
                    updated += 1
                    
                    if distance:
                        print(f'✅ Updated {company_name}: {distance:.2f}km')
                    else:
                        print(f'✅ Updated {company_name}: missing coords')
                
                except Exception as e:
                    results.append({
                        'facilityId': facility['id'],
                        'companyName': company_name,
                        'address': address,
                        'currentCoords': {'lat': facility['latitude'], 'lng': facility['longitude']},
                        'newCoords': new_coords,
                        'distance': distance,
                        'status': 'error',
                        'error': f'Update failed: {str(e)}'
                    })
                    errors += 1
            else:
                results.append({
                    'facilityId': facility['id'],
                    'companyName': company_name,
                    'address': address,
                    'currentCoords': {'lat': facility['latitude'], 'lng': facility['longitude']},
                    'newCoords': new_coords,
                    'distance': distance,
                    'status': 'unchanged'
                })
            
            # Delay to avoid rate limiting
            time.sleep(MAPBOX_BATCH_DELAY)
        
        # Print summary
        print('')
        print('═════════════════════════════════════════')
        print('📊 VALIDATION SUMMARY')
        print('═════════════════════════════════════════')
        print(f'Total processed: {processed}')
        print(f'✅ Updated: {updated}')
        print(f'❌ Errors: {errors}')
        print(f'⏭️  Unchanged: {processed - updated - errors}')
        print('')
        
        # Show detailed results for updated records
        if updated > 0:
            print('Updated Facilities:')
            print('─────────────────────────────────────────')
            for r in results:
                if r['status'] == 'updated':
                    print(f"  {r['companyName']} ({r['facilityId']})")
                    old_lat = r['currentCoords']['lat'] if r['currentCoords']['lat'] else 'None'
                    old_lng = r['currentCoords']['lng'] if r['currentCoords']['lng'] else 'None'
                    print(f"    Old: {old_lat}, {old_lng}")
                    print(f"    New: {r['newCoords']['lat']:.6f}, {r['newCoords']['lng']:.6f}")
                    if r['distance']:
                        print(f"    Distance: {r['distance']:.2f}km")
                    print('')
        
        # Show errors if any
        if errors > 0:
            print('Failed Geocodings:')
            print('─────────────────────────────────────────')
            error_results = [r for r in results if r['status'] == 'error']
            for r in error_results[:10]:
                print(f"  {r['companyName']}: {r['error']}")
            if len(error_results) > 10:
                print(f"  ... and {len(error_results) - 10} more")
        
        print('═════════════════════════════════════════')
        print('✅ Validation complete!')
    
    except Exception as e:
        print(f'Fatal error: {e}')
        exit(1)

if __name__ == '__main__':
    main()
