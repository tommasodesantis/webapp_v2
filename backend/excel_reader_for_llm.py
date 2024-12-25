import pandas as pd
import json
import sys
import os
from openpyxl import load_workbook

def read_excel_for_llm(file_input):
    """
    Read Excel file from either a file path or BytesIO object
    
    Args:
        file_input: Either a string file path or BytesIO object containing Excel data
    """
    print(f"Attempting to read Excel data")
    
    try:
        # Determine if input is file path or BytesIO
        if isinstance(file_input, str):
            file_path = file_input
            _, ext = os.path.splitext(file_path)
            print(f"Reading from file path: {file_path}")
        else:
            # For BytesIO, we need to handle it differently since it's a stream
            file_path = file_input
            print("Reading from BytesIO object")
            # Try to read the first few bytes to check if it's an Excel file
            magic_bytes = file_path.read(8)
            file_path.seek(0)  # Reset position after reading magic bytes
            
            # Check magic bytes for Excel file types
            if magic_bytes.startswith(b'PK\x03\x04'):  # XLSX file
                ext = '.xlsx'
            elif magic_bytes.startswith(b'\xD0\xCF\x11\xE0'):  # XLS file
                ext = '.xls'
            else:
                raise Exception("Invalid Excel file format")
        
        if ext.lower() in ['.xlsx', '.xls']:
            sheets = {}
            
            # Try openpyxl first for all Excel files
            print("Attempting to read with openpyxl engine")
            try:
                sheets = pd.read_excel(file_path, sheet_name=None, engine='openpyxl')
                print("Successfully read with openpyxl engine")
            except Exception as e:
                print(f"openpyxl engine failed: {str(e)}")
                if isinstance(file_input, str) and ext.lower() == '.xls':
                    # Fallback to xlrd only for .xls files from file path
                    print("Attempting fallback to xlrd engine for .xls file")
                    try:
                        sheets = pd.read_excel(file_path, sheet_name=None, engine='xlrd')
                        print("Successfully read .xls file with xlrd engine")
                    except Exception as e2:
                        print(f"xlrd engine also failed: {str(e2)}")
                        raise Exception(f"Failed to read Excel file. openpyxl error: {str(e)}, xlrd error: {str(e2)}")
                else:
                    raise Exception(f"Failed to read Excel file: {str(e)}")
            
            print(f"Successfully read the Excel file: {file_path}")
            
            file_data = {}
            
            for sheet_name, df in sheets.items():
                print(f"Processing sheet: {sheet_name}")
                
                # Prepare the data structure
                data = {
                    "sheet_name": sheet_name,
                    "max_row": df.shape[0],
                    "max_column": df.shape[1],
                    "cells": []
                }
                
                # Iterate through the dataframe
                for row in range(df.shape[0]):
                    for col in range(df.shape[1]):
                        value = df.iat[row, col]
                        if pd.notna(value):  # Check if the cell is not empty
                            # Convert value to string with error handling
                            try:
                                str_value = str(value)
                            except UnicodeEncodeError:
                                str_value = str(value).encode('ascii', 'replace').decode('ascii')
                            
                            cell_data = {
                                "row": row + 1,  # Adding 1 to match Excel's 1-based indexing
                                "column": col + 1,
                                "column_letter": chr(65 + col % 26),  # Convert column number to letter (A, B, C, etc.)
                                "value": str_value
                            }
                            data["cells"].append(cell_data)
                
                file_data[sheet_name] = data
                print(f"Processed {len(data['cells'])} non-empty cells in sheet {sheet_name}")
            
            return file_data
        else:
            print(f"Unsupported file format: {ext}")
            return None
    
    except Exception as e:
        print(f"Error reading Excel file {file_path}: {str(e)}")
        raise  # Re-raise the exception to ensure proper error handling

def excel_to_json(input_file):
    try:
        # Read and convert Excel to structured JSON
        json_data = read_excel_for_llm(input_file)
        
        if json_data is None:
            raise Exception("Failed to read Excel file")
        
        # Create output filename in the same directory as the input file
        output_file = os.path.splitext(input_file)[0] + '_output.json'
        
        # Write JSON to file with UTF-8 encoding
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully created JSON output file: {output_file}")
        return output_file
    except Exception as e:
        print(f"Error in excel_to_json: {str(e)}")
        raise

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python excel_reader_for_llm.py <excel_file_path>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    try:
        output_file = excel_to_json(input_file)
        print(f"Successfully processed {input_file} to {output_file}")
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        sys.exit(1)
