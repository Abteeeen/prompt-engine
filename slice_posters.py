from PIL import Image
import os

# Define the source and destination
source_path = r"D:\Abhiram Work Space\My Pro\poster.png"
dest_folder = r"c:\Users\Codev\mcp-github-workspace\prompt-engineering-science\web-app\frontend\public\assets\posters"

if not os.path.exists(dest_folder):
    os.makedirs(dest_folder)

# Load the image
img = Image.open(source_path)
width, height = img.size

print(f"Original dimensions: {width}x{height}")

# Split the image into top and bottom halves
half_height = height // 2

# Row 1: 4 posters
row1_cols = 4
row1_w = width // row1_cols
row1_names = ["luffy_poster.png", "zoro_poster.png", "nami_poster.png", "sanji_poster.png"]

for i in range(row1_cols):
    left = i * row1_w
    top = 0
    right = (i + 1) * row1_w
    bottom = half_height
    poster = img.crop((left, top, right, bottom))
    poster.save(os.path.join(dest_folder, row1_names[i]))
    print(f"Saved {row1_names[i]}")

# Row 2: 5 posters
row2_cols = 5
row2_w = width // row2_cols
row2_names = ["usopp_poster.png", "robin_poster.png", "chopper_poster.png", "franky_poster.png", "brook_poster.png"]

for i in range(row2_cols):
    left = i * row2_w
    top = half_height
    right = (i + 1) * row2_w
    bottom = height
    poster = img.crop((left, top, right, bottom))
    poster.save(os.path.join(dest_folder, row2_names[i]))
    print(f"Saved {row2_names[i]}")

print("Slicing complete.")
