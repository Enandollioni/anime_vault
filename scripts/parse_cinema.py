import csv
import json
import os
import re
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

CSV_PATH = r"C:\Users\dd\Desktop\backup_1568992_votes.csv"
OUTPUT_PATH = r"C:\Users\dd\source\repos\anime-vault\src\data\cinemaData.json"
TMDB_KEY = "1b5adf76a72a13bad99b8fc0c68cb085"

# Setup proxy opener
proxy_handler = urllib.request.ProxyHandler({'http': 'http://127.0.0.1:10809', 'https': 'http://127.0.0.1:10809'})
opener = urllib.request.build_opener(proxy_handler)

def get_tier(score):
    if not score or score <= 0:
        return 'unrated'
    if score >= 10.0:
        return 'S+'
    if score >= 9.0:
        return 'S'
    if score >= 8.0:
        return 'A'
    if score >= 7.0:
        return 'B'
    if score >= 5.0:
        return 'C'
    return 'D_F'

def fetch_tmdb_metadata(title, orig_title, year, item_type):
    search_queries = []
    if title:
        search_queries.append((title, year))
    if orig_title and orig_title != title:
        search_queries.append((orig_title, year))
    if title:
        search_queries.append((title, None))

    is_tv = 'сериал' in item_type.lower()
    endpoint = 'tv' if is_tv else 'movie'

    for q, y in search_queries:
        try:
            url = f"https://api.themoviedb.org/3/search/multi?api_key={TMDB_KEY}&query={urllib.parse.quote(q)}&language=ru-RU"
            if y:
                url += f"&year={y}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with opener.open(req, timeout=6) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                results = data.get('results', [])
                if results:
                    best = None
                    for r in results:
                        r_date = r.get('release_date') or r.get('first_air_date') or ''
                        r_year = r_date[:4] if len(r_date) >= 4 else ''
                        if y and r_year == str(y):
                            best = r
                            break
                    if not best:
                        best = results[0]

                    poster_path = best.get('poster_path')
                    backdrop_path = best.get('backdrop_path')
                    overview = best.get('overview') or ''

                    poster_url = f"https://image.tmdb.org/t/p/w600_and_h900_bestv2{poster_path}" if poster_path else None
                    backdrop_url = f"https://image.tmdb.org/t/p/original{backdrop_path}" if backdrop_path else None

                    return poster_url, backdrop_url, overview
        except Exception as e:
            continue
    return None, None, ''

def process_row(idx, row):
    my_rating = row.get('My rating', '').strip()
    score = float(my_rating) if my_rating.isdigit() else 0.0
    status = 'completed' if score > 0 else 'planned'
    tier = get_tier(score)

    title = row.get('Title', '').strip()
    title_orig = row.get('Original Title', '').strip()
    item_type = row.get('Type', 'Фильм').strip()
    year = int(row['Year']) if row.get('Year', '').isdigit() else None
    runtime = int(row['Runtime']) if row.get('Runtime', '').isdigit() else None

    # Genres list
    raw_genres = row.get('Genres', '')
    genres = [g.strip().capitalize() for g in raw_genres.split(',') if g.strip()]

    # Countries list
    raw_countries = row.get('Countries', '')
    countries = [c.strip() for c in raw_countries.split(',') if c.strip()]

    # Directors list
    raw_directors = row.get('Directors', '')
    directors = [d.strip() for d in raw_directors.split(',') if d.strip()]

    # Actors list
    raw_actors = row.get('Actors', '')
    actors = [a.strip() for a in raw_actors.split(',') if a.strip()]

    knrm_str = row.get('Knrm rating', '').replace(',', '.').strip()
    knrm_rating = None
    if knrm_str and knrm_str != '-':
        try:
            knrm_rating = float(knrm_str)
        except ValueError:
            pass

    imdb_str = row.get('IMDb rating', '').replace(',', '.').strip()
    imdb_rating = None
    if imdb_str and imdb_str != '-':
        try:
            imdb_rating = float(imdb_str)
        except ValueError:
            pass

    age_limit = row.get('Age limit', '').strip()
    if age_limit:
        age_limit = f"{age_limit}+"

    # Fetch TMDB art & synopsis
    poster_url, backdrop_url, tmdb_overview = fetch_tmdb_metadata(title, title_orig, year, item_type)

    if not poster_url:
        poster_url = 'https://shikimori.one/assets/globals/missing_original.jpg'

    # Note / review
    note = row.get('Note', '').strip()
    review = note if note else tmdb_overview

    return {
        'id': idx + 1000,
        'title': title,
        'title_orig': title_orig,
        'score': score,
        'status': status,
        'tier': tier,
        'type': item_type,
        'year': year,
        'runtime': runtime,
        'duration': runtime,
        'episodes': 1 if 'фильм' in item_type.lower() else (int(row.get('Audience', 0)) if row.get('Audience', '').isdigit() else None),
        'genres': genres,
        'countries': countries,
        'directors': directors,
        'actors': actors,
        'knrm_rating': knrm_rating,
        'imdb_rating': imdb_rating,
        'age_limit': age_limit,
        'poster_url': poster_url,
        'backdrop_url': backdrop_url,
        'review': review,
        'url_kinopoisk': f"https://www.kinopoisk.ru/index.php?kp_query={urllib.parse.quote(title)}",
        'url_kinorium': f"https://ru.kinorium.com/search/?q={urllib.parse.quote(title)}"
    }

def main():
    print(f"Reading {CSV_PATH}...")
    with open(CSV_PATH, 'r', encoding='utf-16') as f:
        reader = list(csv.DictReader(f, delimiter='\t'))

    print(f"Processing {len(reader)} rows with TMDB enrichment...")
    items = [None] * len(reader)

    with ThreadPoolExecutor(max_workers=12) as executor:
        future_to_idx = {executor.submit(process_row, i, row): i for i, row in enumerate(reader)}
        completed = 0
        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            try:
                res = future.result()
                items[idx] = res
            except Exception as e:
                print(f"Error at row {idx}: {e}")
            completed += 1
            if completed % 25 == 0 or completed == len(reader):
                print(f"  Progress: {completed}/{len(reader)}...")

    # Filter out any None
    items = [it for it in items if it]
    print(f"Successfully processed {len(items)} items.")

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    print(f"Saved to {OUTPUT_PATH}")

if __name__ == '__main__':
    main()
