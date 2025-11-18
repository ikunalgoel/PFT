# CSV Upload Format Guide

This guide explains how to format CSV files for bulk transaction uploads in the AI Finance Tracker.

## Quick Start

The simplest CSV format requires only three columns:

```csv
date,amount,category
2024-01-15,45.50,Groceries
2024-01-16,12.00,Transportation
2024-01-17,85.00,Utilities
```

## Complete Format

For maximum detail, include all available columns:

```csv
date,amount,category,merchant,notes
2024-01-15,45.50,Groceries,Whole Foods,Weekly shopping
2024-01-16,12.00,Transportation,Uber,Ride to work
2024-01-17,85.00,Utilities,PG&E,Monthly electric bill
2024-01-18,25.99,Entertainment,Netflix,Monthly subscription
```

## Column Specifications

### Required Columns

| Column | Type | Format | Description | Example |
|--------|------|--------|-------------|---------|
| `date` | Date | YYYY-MM-DD | Transaction date | `2024-01-15` |
| `amount` | Number | Decimal | Transaction amount (positive) | `45.50` |
| `category` | Text | String | Spending category | `Groceries` |

### Optional Columns

| Column | Type | Format | Description | Example |
|--------|------|--------|-------------|---------|
| `merchant` | Text | String | Merchant or vendor name | `Whole Foods` |
| `notes` | Text | String | Additional notes or description | `Weekly shopping` |

## Column Details

### Date Column

**Format**: `YYYY-MM-DD` (ISO 8601)

**Valid Examples**:
- `2024-01-15`
- `2024-12-31`
- `2023-06-01`

**Invalid Examples**:
- `01/15/2024` (US format - not supported)
- `15-01-2024` (European format - not supported)
- `2024/01/15` (Wrong separator)
- `Jan 15, 2024` (Text format - not supported)

**Tips**:
- Use leading zeros for single-digit months and days
- Dates must be in the past or present (future dates may be rejected)
- Ensure dates are valid (e.g., no February 30th)

### Amount Column

**Format**: Decimal number (positive values only)

**Valid Examples**:
- `45.50`
- `12.00`
- `100`
- `0.99`
- `1234.56`

**Invalid Examples**:
- `-45.50` (negative values not supported)
- `$45.50` (currency symbols not allowed)
- `45,50` (comma as decimal separator not supported)
- `1,234.56` (thousand separators not allowed)
- `45.5.0` (multiple decimal points)

**Tips**:
- Use period (`.`) as decimal separator
- Do not include currency symbols ($, €, £, etc.)
- Do not use thousand separators (commas)
- Maximum 2 decimal places recommended
- Amounts must be positive (expenses only)

### Category Column

**Format**: Text string

**Recommended Categories**:
- `Groceries`
- `Transportation`
- `Utilities`
- `Entertainment`
- `Dining`
- `Shopping`
- `Healthcare`
- `Housing`
- `Insurance`
- `Education`
- `Personal Care`
- `Travel`
- `Subscriptions`
- `Other`

**Tips**:
- Use consistent category names for better analytics
- Categories are case-sensitive
- Avoid special characters
- Keep categories concise (under 50 characters)
- Create custom categories as needed

### Merchant Column (Optional)

**Format**: Text string

**Examples**:
- `Whole Foods`
- `Uber`
- `Amazon`
- `Starbucks`
- `Shell Gas Station`

**Tips**:
- Use consistent merchant names
- Avoid abbreviations when possible
- Maximum 255 characters
- Can be left empty if unknown

### Notes Column (Optional)

**Format**: Text string

**Examples**:
- `Weekly shopping`
- `Ride to work`
- `Monthly subscription`
- `Birthday gift for mom`

**Tips**:
- Keep notes concise but descriptive
- Avoid special characters that might break CSV format
- Maximum 500 characters recommended
- Can be left empty

## File Format Requirements

### File Extension
- Must be `.csv`
- Plain text format

### Encoding
- UTF-8 encoding recommended
- ASCII also supported

### Line Endings
- Unix (LF) or Windows (CRLF) line endings both supported

### Header Row
- First row must contain column names
- Column names are case-sensitive
- Must include at least: `date`, `amount`, `category`

### Delimiters
- Comma (`,`) as field separator
- Double quotes (`"`) for fields containing commas or quotes

## Example Files

### Minimal Example

```csv
date,amount,category
2024-01-15,45.50,Groceries
2024-01-16,12.00,Transportation
2024-01-17,85.00,Utilities
```

### Complete Example

```csv
date,amount,category,merchant,notes
2024-01-01,125.50,Groceries,Whole Foods,Weekly groceries
2024-01-02,45.00,Dining,Olive Garden,Dinner with family
2024-01-03,15.00,Transportation,Uber,Ride to office
2024-01-04,89.99,Shopping,Amazon,New headphones
2024-01-05,12.50,Entertainment,AMC Theaters,Movie ticket
2024-01-06,200.00,Utilities,PG&E,Monthly electric bill
2024-01-07,75.00,Healthcare,CVS Pharmacy,Prescription refill
2024-01-08,50.00,Personal Care,Supercuts,Haircut
2024-01-09,30.00,Groceries,Trader Joes,Snacks and drinks
2024-01-10,18.99,Subscriptions,Spotify,Monthly premium
```

### Example with Special Characters

When fields contain commas or quotes, wrap them in double quotes:

```csv
date,amount,category,merchant,notes
2024-01-15,45.50,Groceries,Whole Foods,"Milk, eggs, and bread"
2024-01-16,25.00,Dining,"Joe's Pizza, Inc.",Lunch special
2024-01-17,100.00,Shopping,Amazon,"New book: ""The Great Gatsby"""
```

## Common Errors and Solutions

### Error: "Invalid date format"

**Problem**: Date not in YYYY-MM-DD format

**Solution**: Convert dates to ISO format
```
Wrong: 01/15/2024
Right: 2024-01-15
```

### Error: "Amount must be a positive number"

**Problem**: Amount includes currency symbols or is negative

**Solution**: Remove symbols and use positive values
```
Wrong: $45.50 or -45.50
Right: 45.50
```

### Error: "Missing required column: category"

**Problem**: CSV doesn't have all required columns

**Solution**: Ensure header row includes `date`, `amount`, and `category`
```csv
date,amount,category
2024-01-15,45.50,Groceries
```

### Error: "Invalid CSV format"

**Problem**: File is not properly formatted as CSV

**Solution**: 
- Check that fields are comma-separated
- Ensure no extra commas at end of lines
- Verify file is saved as `.csv` not `.xlsx`

### Error: "Row X: Invalid data"

**Problem**: Specific row has formatting issues

**Solution**: Check that row for:
- Missing required fields
- Invalid date format
- Non-numeric amount
- Extra or missing commas

## Exporting from Other Applications

### From Excel

1. Open your spreadsheet in Excel
2. Format date column as `YYYY-MM-DD`
3. Remove currency formatting from amount column
4. File → Save As → CSV (Comma delimited) (*.csv)
5. Choose UTF-8 encoding if prompted

### From Google Sheets

1. Open your spreadsheet in Google Sheets
2. Format date column as `YYYY-MM-DD`
3. Remove currency formatting from amount column
4. File → Download → Comma Separated Values (.csv)

### From Bank Statements

Most banks allow CSV export. After downloading:

1. Open in Excel or Google Sheets
2. Map columns to required format:
   - Date → `date` (convert to YYYY-MM-DD)
   - Amount → `amount` (remove currency symbols)
   - Description → `category` (categorize manually)
   - Merchant → `merchant`
3. Remove any negative amounts (credits/refunds)
4. Save as CSV

## Validation Rules

Before uploading, ensure:

- [ ] File has `.csv` extension
- [ ] First row contains column headers
- [ ] All required columns present: `date`, `amount`, `category`
- [ ] All dates in YYYY-MM-DD format
- [ ] All amounts are positive numbers without symbols
- [ ] No empty rows
- [ ] No duplicate headers
- [ ] File size under 5MB (approximately 50,000 transactions)

## Upload Limits

- **Maximum file size**: 5MB
- **Maximum transactions per upload**: 10,000
- **Rate limit**: 10 uploads per 15 minutes
- **Supported format**: CSV only (no Excel .xlsx files)

## Testing Your CSV

Before uploading a large file, test with a small sample:

```csv
date,amount,category,merchant,notes
2024-01-15,45.50,Groceries,Test Store,Test transaction
```

1. Save as `test.csv`
2. Upload to the application
3. Verify transaction appears correctly
4. If successful, upload your full file

## Sample CSV Files

Download sample CSV files from the repository:

- [Minimal Sample](../examples/transactions-minimal.csv) - Basic format
- [Complete Sample](../examples/transactions-complete.csv) - All columns
- [Large Sample](../examples/transactions-large.csv) - 100+ transactions

## Troubleshooting

### CSV Opens in Excel Instead of Text Editor

**Solution**: Right-click file → Open With → Notepad or TextEdit

### Special Characters Display Incorrectly

**Solution**: Save file with UTF-8 encoding

### Upload Fails with "Invalid Format"

**Solution**: 
1. Open CSV in text editor
2. Verify comma separation
3. Check for extra blank lines
4. Ensure proper header row

### Some Transactions Missing After Upload

**Solution**:
1. Check application logs for errors
2. Verify all rows have required fields
3. Ensure dates are valid
4. Check for duplicate transactions (may be filtered)

## Best Practices

1. **Consistent Categories**: Use the same category names across all transactions
2. **Regular Uploads**: Upload transactions weekly or monthly for best results
3. **Backup Original**: Keep original bank statements before converting
4. **Validate First**: Test with small file before uploading large datasets
5. **Clean Data**: Remove any unnecessary columns before upload
6. **Date Range**: Upload transactions in chronological order
7. **Categorize Carefully**: Accurate categories improve AI insights

## Need Help?

- Check the [API Documentation](API.md) for bulk upload endpoint details
- Review [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues
- Open an issue on [GitHub](https://github.com/ikunalgoel/PFT/issues)

---

**Last Updated**: January 2024
