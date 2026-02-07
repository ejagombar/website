#!/usr/bin/env python3
"""
Recipe Parser Script
Extracts recipe data from URLs using recipe-scrapers library

Install dependencies:
    pip install recipe-scrapers

Usage:
    python recipe_parser.py <url>

Output:
    JSON object with recipe data
"""

import sys
import json
import re
from recipe_scrapers import scrape_me


def parse_time(time_str):
    """Convert time to readable format"""
    if not time_str:
        return ""
    # If it's already a string, return as-is
    if isinstance(time_str, str):
        return time_str
    # If it's minutes (int), convert to readable format
    if isinstance(time_str, int):
        if time_str >= 60:
            hours = time_str // 60
            mins = time_str % 60
            if mins > 0:
                return f"{hours}h {mins}m"
            return f"{hours}h"
        return f"{time_str} mins"
    return str(time_str)


def extract_temperature(instructions):
    """Try to extract temperature from instructions"""
    if not instructions:
        return ""

    text = " ".join(instructions) if isinstance(instructions, list) else str(instructions)

    # Common patterns for temperature
    patterns = [
        r'(\d+)\s*°?\s*[Cc](?:elsius)?',
        r'(\d+)\s*°?\s*[Ff](?:ahrenheit)?',
        r'(\d+)\s*degrees?\s*[Cc]',
        r'(\d+)\s*degrees?\s*[Ff]',
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            temp = match.group(0)
            # Normalize format
            temp = re.sub(r'degrees?\s*', '°', temp)
            if '°' not in temp:
                temp = temp.replace('C', '°C').replace('F', '°F')
            return temp

    return ""


def guess_type(title, ingredients):
    """Try to guess recipe type from title and ingredients"""
    title_lower = title.lower() if title else ""
    ing_text = " ".join(ingredients).lower() if ingredients else ""

    # Check title first
    if any(word in title_lower for word in ['cake', 'cookie', 'brownie', 'pie', 'tart', 'pudding', 'ice cream', 'chocolate', 'sweet']):
        return 'dessert'
    if any(word in title_lower for word in ['breakfast', 'pancake', 'waffle', 'omelette', 'omelet', 'eggs', 'porridge', 'granola']):
        return 'breakfast'
    if any(word in title_lower for word in ['smoothie', 'juice', 'cocktail', 'lemonade', 'coffee', 'tea', 'drink']):
        return 'drink'
    if any(word in title_lower for word in ['sauce', 'dressing', 'dip', 'marinade', 'gravy']):
        return 'sauce'
    if any(word in title_lower for word in ['salad', 'side', 'rice', 'potato', 'vegetable']):
        return 'side'
    if any(word in title_lower for word in ['snack', 'chips', 'popcorn', 'nuts']):
        return 'snack'

    # Default to main
    return 'main'


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "URL argument required"}))
        sys.exit(1)

    url = sys.argv[1]

    try:
        scraper = scrape_me(url)

        # Extract basic info
        title = scraper.title() if hasattr(scraper, 'title') else ""

        # Get ingredients
        try:
            ingredients = scraper.ingredients()
        except:
            ingredients = []

        # Get instructions
        try:
            instructions_raw = scraper.instructions()
            # Split by newlines or numbered steps
            if instructions_raw:
                # Try to split into steps
                instructions = re.split(r'\n+|\d+\.\s+', instructions_raw)
                instructions = [i.strip() for i in instructions if i.strip()]
            else:
                instructions = []
        except:
            instructions = []

        # Get times
        try:
            prep_time = parse_time(scraper.prep_time())
        except:
            prep_time = ""

        try:
            cook_time = parse_time(scraper.cook_time())
        except:
            cook_time = ""

        # Get yields/servings
        try:
            yields = scraper.yields()
            # Parse yields - could be "4 servings" or "12 cookies"
            serves = ""
            makes = ""
            if yields:
                yields_lower = yields.lower()
                if 'serving' in yields_lower or 'person' in yields_lower or 'people' in yields_lower:
                    serves = re.sub(r'\s*(servings?|persons?|people)\s*', '', yields, flags=re.IGNORECASE).strip()
                else:
                    makes = yields
        except:
            serves = ""
            makes = ""

        # Get image
        try:
            image = scraper.image()
        except:
            image = ""

        # Get description
        try:
            description = scraper.description() if hasattr(scraper, 'description') else ""
        except:
            description = ""

        # Extract temperature from instructions if possible
        temperature = extract_temperature(instructions)

        # Guess type
        recipe_type = guess_type(title, ingredients)

        result = {
            "name": title,
            "description": description,
            "type": recipe_type,
            "source": url,
            "preparation_time": prep_time,
            "cooking_time": cook_time,
            "temperature": temperature,
            "serves": serves,
            "makes": makes,
            "image": image,
            "ingredients": ingredients,
            "instructions": instructions[:16]  # Limit to 16
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": f"Failed to parse recipe: {str(e)}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()

