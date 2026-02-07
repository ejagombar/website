# Recipe Database API

A secure PHP-based REST API for managing and querying a recipe database. All endpoints use prepared statements to prevent SQL injection attacks and return data in XML format (except image endpoints which return binary PNG data).

## Table of Contents

- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Common Usage Patterns](#common-usage-patterns)
- [Error Handling](#error-handling)

## Overview

This API provides four main endpoints for interacting with a MySQL recipe database:

- Search and filter recipes
- Retrieve complete recipe details
- Fetch recipe images
- List available recipe types

All endpoints support UTF-8 encoding and include CORS headers where appropriate for cross-origin requests.

## API Endpoints

### 1. Search Recipes

**Endpoint**: `recipeQuery.php`

Search and filter recipes by type and keyword.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by recipe type. Defaults to all types if omitted. |
| `keyword` | string | No | Search term to match. Defaults to all recipes if omitted. |
| `searchIngredients` | flag | No | If present, searches both recipe names and ingredients. Otherwise only searches names. |

#### Response

```xml
<?xml version="1.0"?>
<xml>
  <recipe>
    <name>Chocolate Chip Cookies</name>
    <index>42</index>
  </recipe>
  <recipe>
    <name>Chocolate Cake</name>
    <index>87</index>
  </recipe>
</xml>
```

#### Examples

```bash
# Find all desserts
https://api.recipes.eagombar.uk/recipeQuery/recipeQuery.php?type=dessert

# Find recipes with "chocolate" in the name
https://api.recipes.eagombar.uk/recipeQuery/recipeQuery.php?keyword=chocolate

# Find desserts with "chocolate" in name or ingredients
https://api.recipes.eagombar.uk/recipeQuery/recipeQuery.php?type=dessert&keyword=chocolate&searchIngredients=1

# Find all recipes with "chicken" in ingredients
https://api.recipes.eagombar.uk/recipeQuery/recipeQuery.php?keyword=chicken&searchIngredients=1
```

---

### 2. Get Recipe Details

**Endpoint**: `recipeGet.php`

Retrieve complete details for a specific recipe.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The unique index identifier of the recipe |

#### Response

```xml
<?xml version="1.0"?>
<xml>
  <recipe>
    <name>Chocolate Chip Cookies</name>
    <ingredients>flour, sugar, ...</ingredients>
    <description>Classic homemade cookies</description>
    <type>dessert</type>
    <instructions_1>Preheat oven to 180°C</instructions_1>
    <instructions_2>Mix dry ingredients</instructions_2>
    <instructions_3>Cream butter and sugar</instructions_3>
    <preparation_time>15 minutes</preparation_time>
    <cooking_time>12 minutes</cooking_time>
    <temperature>180°C</temperature>
    <serves>24</serves>
    <makes>24 cookies</makes>
    <source>Family Recipe</source>
    <image>[binary data]</image>
  </recipe>
</xml>
```

**Note**: Only fields containing data will be included in the response. Empty fields are omitted.

#### Examples

```bash
# Get full details for recipe ID 42
https://api.recipes.eagombar.uk/recipeQuery/recipeGet.php?id=42
```

---

### 3. Get Recipe Image

**Endpoint**: `recipeGetImage.php`

Retrieve the recipe image as a PNG file.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The unique index identifier of the recipe |

#### Response

- **Content-Type**: `image/png`
- **Body**: Binary PNG image data

#### Examples

```bash
# Download image for recipe 42
https://api.recipes.eagombar.uk/recipeQuery/recipeGetImage.php?id=42

# Use in HTML img tag
<img src="https://api.recipes.eagombar.uk/recipeQuery/recipeGetImage.php?id=42" alt="Recipe Image">
```

---

### 4. List Recipe Types

**Endpoint**: `typeQuery.php`

Retrieve all distinct recipe types available in the database.

#### Parameters

None

#### Response

```xml
<?xml version="1.0"?>
<xml>
  <type>appetizer</type>
  <type>dessert</type>
  <type>main course</type>
  <type>side dish</type>
  <type>soup</type>
</xml>
```

#### Examples

```bash
# Get all available recipe types
https://api.recipes.eagombar.uk/recipeQuery/typeQuery.php
```

---

## Common Usage Patterns

### Building a Recipe Search Interface

```javascript
// 1. Populate type dropdown
fetch('typeQuery.php')
  .then(response => response.text())
  .then(xml => {
    // Parse XML and populate dropdown
  });

// 2. Search recipes
fetch('recipeQuery.php?type=dessert&keyword=chocolate')
  .then(response => response.text())
  .then(xml => {
    // Parse XML and display results
  });

// 3. Show recipe details
fetch('recipeGet.php?id=42')
  .then(response => response.text())
  .then(xml => {
    // Parse XML and display full recipe
  });

// 4. Display recipe image
document.querySelector('img').src = 'recipeGetImage.php?id=42';
```

### Typical Workflow

1. **Initialize**: Call `typeQuery.php` to get available recipe categories
2. **Search**: Use `recipeQuery.php` with filters to find recipes
3. **Details**: Get full recipe information using `recipeGet.php` with the recipe's `index`
4. **Display**: Show recipe image using `recipeGetImage.php` with the same `index`

## Error Handling

### Connection Errors

If database connection fails, the API returns:
```
Database connection failed: [error message]
```

### Missing Parameters

If required parameters are missing:
```
Must specify an id
```

### Image Errors

If image retrieval fails:
```
An error occurred.
Recipe not found.
No image found.
```

### General Best Practices

- Always check for empty responses
- Handle XML parsing errors gracefully
- Validate user input before sending to API
- Implement retry logic for network failures
- Cache recipe type list as it changes infrequently

## Configuration

Database configuration is defined in .env file
