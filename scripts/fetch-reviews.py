#!/usr/bin/env python3
"""Fetch Google Places reviews for all clinics and write JSON files."""
import json, urllib.request, urllib.parse, os, sys
from datetime import date

API_KEY = "AIzaSyCfWPREdPKF374Oof9erIOiotlLKAtDvAw"
REVIEWS_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'reviews')
TODAY = date.today().isoformat() + 'T00:00:00.000Z'

CLINICS = {
    'ChIJ77UO7K8lv0cRFQXzvxhCfeg': 'Dermatologie am Dom',
    'ChIJnX4erq8lv0cRgS7GNvNWuYk': 'Dr. Stephanie Rösing',
    'ChIJX9ZcEQElv0cRNol9fcxuDvI': 'MVZ Gefäßzentrum Rudolfplatz',
    'ChIJs0y27B0lv0cRanz1EUCp5nI': 'Dr. Kruppa & Dr. Larsen',
    'ChIJEczfE70lv0cRvWaW_r31jPI': 'Be esthetic Dr. Esfahani',
    'ChIJBxF7Yqwmv0cRHrktSpvsNh4': 'Dermatologikum Köln',
    'ChIJYVCTVzzKuEcRn4fFkzAPgAo': 'Dr. Hilton Medical Skin Center',
    'ChIJq9LAvSvLuEcRB4FbkwYjE2E': 'Gefäßpraxis Dr. Kusenack',
    'ChIJXzKEgiDKuEcRYyGdp6djiEo': 'Hautarztpraxis Funk Humke',
    'ChIJZ_yZefHJuEcRLC4hOHKqJug': 'PD Dr. Fritsch',
    'ChIJecnTKAAlv0cRQ6VEam6N7gE': 'Gefäßzentrum Köln Am Neumarkt',
    'ChIJIWiUZK4mv0cRUdEFYxECRtw': 'Dr. Julia Hölker',
    'ChIJmVOBx5wlv0cRR0-UUd5MZqo': 'Derma-Cologne Dr. Sobottka',
    'ChIJJUwHvtEkv0cRbKOAKsTCwqk': 'Dr. Neßeler & Partner',
    'ChIJ_-QlsB47v0cRBGCXVQCKwp8': 'HAUT & VENEN Kastanienhof',
    'ChIJl681MCPKuEcRL6FNfpWWZAs': 'Phlebologie an der KÖ',
    'ChIJ0fOFExbKuEcReiKKE-NzTss': 'Altstadt-Praxis Düsseldorf',
    'ChIJ_3MdfzvKuEcRruhm-Zs81Io': 'KÖ-KLINIK Düsseldorf',
    'ChIJDy8ySlHKuEcRxenD3dN1B8I': 'Prof. Dr. Gerber Luegplatz',
    'ChIJd7NvSq_JuEcRlqJcYXvfMOY': 'VENperfect Dr. Jawadi',
    'ChIJZYwxeOHJuEcR1bD1NNY-QyY': 'Dr. Manuel Cornely',
    'ChIJz3gLArItv0cR2q-yg0HTDgc': 'Hautnah Zentrum Dr. Omaj',
}

os.makedirs(REVIEWS_DIR, exist_ok=True)

for place_id, name in CLINICS.items():
    url = (
        f'https://maps.googleapis.com/maps/api/place/details/json'
        f'?place_id={urllib.parse.quote(place_id)}'
        f'&fields=name,rating,user_ratings_total,reviews'
        f'&key={API_KEY}'
        f'&language=de'
        f'&reviews_sort=newest'
    )
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f'ERROR {place_id} ({name}): {e}', file=sys.stderr)
        continue

    result = data.get('result', {})
    rating = result.get('rating', 0)
    total = result.get('user_ratings_total', 0)
    reviews_raw = result.get('reviews', [])

    # Preserve existing summary if file exists
    existing_summary = []
    out_file = os.path.join(REVIEWS_DIR, place_id + '.json')
    if os.path.exists(out_file):
        try:
            with open(out_file) as f:
                existing = json.load(f)
                existing_summary = existing.get('summary', [])
        except Exception:
            pass

    reviews = [
        {
            'author_name': r.get('author_name', ''),
            'rating': r.get('rating', 0),
            'relative_time_description': r.get('relative_time_description', ''),
            'text': r.get('text', ''),
            'time': r.get('time', 0),
        }
        for r in reviews_raw
    ]

    out = {
        'rating': rating,
        'reviewCount': total,
        'summary': existing_summary,
        'lastUpdated': TODAY,
        'reviews': reviews,
    }

    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f'✓ {name}: {rating}★ ({total} reviews, {len(reviews)} shown)')
