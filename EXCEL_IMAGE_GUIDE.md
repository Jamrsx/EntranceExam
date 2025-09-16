# Excel Image Insertion Guide

## Overview
This guide explains how to properly insert images into Excel files for uploading questions with images to the OCC Admission System.

## How to Insert Images in Excel

### Method 1: Using Shapes (Recommended)
1. **Open your Excel file** with the question template
2. **Navigate to the image column** (Column J for main images, Columns K-O for option images)
3. **Insert a shape:**
   - Go to the **Insert** tab
   - Click on **Shapes**
   - Choose a shape (rectangle or oval works well)
   - Draw the shape in the cell where you want the image
4. **Fill the shape with an image:**
   - Right-click on the shape
   - Select **Format Shape**
   - In the **Fill** section, select **Picture or texture fill**
   - Click **File** and browse to your image
   - Select your image and click **Insert**
5. **Resize the shape** to fit the cell properly
6. **Repeat for other images** in option columns (K, L, M, N, O) if needed

### Method 2: Direct Image Insertion (Alternative)
1. **Click on the cell** where you want the image
2. **Go to Insert** → **Pictures** → **Picture from File**
3. **Select your image** and click **Insert**
4. **The image will appear** as a floating object in the cell

### Method 3: Using Base64 Encoding (Advanced)
If you prefer to embed images as text:
1. **Convert your image to base64:**
   - Use an online base64 encoder
   - Or use a script to convert your image
2. **Paste the base64 string** directly into the image cell
3. **Format:** `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...`

## Excel Template Structure

| Column | Content | Required | Notes |
|--------|---------|----------|-------|
| A | Question | Yes | The question text |
| B | Option 1 | Yes | First answer choice |
| C | Option 2 | Yes | Second answer choice |
| D | Option 3 | Yes | Third answer choice |
| E | Option 4 | Yes | Fourth answer choice |
| F | Option 5 | Yes | Fifth answer choice |
| G | Correct Answer | Yes | A, B, C, D, or E |
| H | Category | Yes | Question category |
| I | Direction | Yes | Question directions |
| J | Main Image | No | Insert shape with image |
| K | Option 1 Image | No | Insert shape with image |
| L | Option 2 Image | No | Insert shape with image |
| M | Option 3 Image | No | Insert shape with image |
| N | Option 4 Image | No | Insert shape with image |
| O | Option 5 Image | No | Insert shape with image |

## Example Excel File

```
question,option1,option2,option3,option4,option5,correct_answer,category,direction,image,option1_image,option2_image,option3_image,option4_image,option5_image
What is the capital of the Philippines?,Manila,Cebu,Davao,Quezon City,Baguio,A,Geography,Directions(1-10) Find the correct meaning of the idiomatic expression,[SHAPE WITH IMAGE],,,,
Which programming language is this application built with?,PHP,Python,Java,JavaScript,C#,A,Programming,Directions(11-20) Choose the best answer,[SHAPE WITH IMAGE],,,,
```

## How Image Mapping Works

The system now uses **improved image mapping** that properly associates each drawing with its corresponding image file:

1. **Drawing Detection**: The system detects all shapes/drawings in your Excel file
2. **Image Extraction**: All images are extracted from the Excel file's media folder
3. **Proper Mapping**: Each drawing is mapped to its specific image file based on the order they appear
4. **Column Assignment**: Images are assigned to the correct database fields based on their column position

### Key Improvements:
- **No more cross-row contamination**: Images from one row won't appear in other rows
- **Proper association**: Each drawing gets its own specific image
- **Consistent mapping**: The same drawing will always get the same image
- **Better debugging**: Clear logging shows which image is assigned to which drawing

## Tips for Best Results

1. **Image Format:** Use JPG, PNG, or GIF formats for best compatibility
2. **Image Size:** Keep images reasonably sized (under 1MB each) for faster uploads
3. **Shape Size:** Make shapes large enough to be visible but not too large
4. **Cell Alignment:** Ensure shapes are properly aligned within cells
5. **File Size:** Keep the total Excel file size manageable
6. **Consistent Order:** Insert images in the same order across rows for consistent mapping

## Testing Your File

1. **Use the test page**: Visit `/test_main_upload.php` to test your Excel file
2. **Check the mapping**: The test will show you exactly which images are assigned to which columns
3. **Verify results**: Make sure each drawing gets its intended image
4. **Upload to main system**: If the test looks correct, upload to the main Question Bank

## Troubleshooting

### Images Not Extracting
- Ensure images are inserted as shapes, not just pasted into cells
- Check that the shape is properly filled with the image
- Verify the image file is not corrupted

### Wrong Image Mapping
- Check the test page to see the current mapping
- Ensure images are inserted in the correct order
- Try re-inserting images if the mapping is incorrect

### Upload Errors
- Check that all required columns are filled
- Ensure correct answer is A, B, C, D, or E
- Verify file format is .xlsx or .xls

### Performance Issues
- Reduce image sizes if uploads are slow
- Consider using fewer images per file
- Split large files into smaller batches

## Support

If you encounter issues:
1. Check the test page: `/test_main_upload.php`
2. Review the upload logs using: `php artisan check:upload-logs`
3. Contact the system administrator for assistance

## File Format Support

- **Excel (.xlsx, .xls):** Full support for embedded images
- **CSV:** Limited support (base64 encoded images only)
- **Maximum file size:** 10MB
- **Supported image formats:** JPG, PNG, GIF, BMP, WebP
