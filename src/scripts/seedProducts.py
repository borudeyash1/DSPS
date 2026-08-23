
```python
import json
from pymongo import MongoClient

# Load mock product data from a JSON file
with open('mock_products.json', 'r') as file:
    mock_products = json.load(file)

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['botam_apparels']
products_collection = db['products']

# Insert mock products into the database
for product in mock_products:
    products_collection.insert_one(product)

# Load mock user data from a JSON file
with open('mock_users.json', 'r') as file:
    mock_users = json.load(file)

# Connect to MongoDB
users_collection = db['users']

# Insert mock users into the database
for user in mock_users:
    users_collection.insert_one(user)

print("Mock products and users inserted successfully!")
```
