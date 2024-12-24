from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import pandas as pd
import json
import uuid
from io import BytesIO
from excel_reader_for_llm import read_excel_for_llm, excel_to_json
from chart_generation_multiple import ProcessDataExtractor, ChartGenerator
from supabase import create_client, Client

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not file.filename.endswith(('.xls', '.xlsx')):
        return jsonify({"error": "Invalid file format"}), 400
    
    try:
        # Read file into memory
        file_bytes = file.read()
        unique_filename = f"{str(uuid.uuid4())}_{file.filename}"
        
        # Upload Excel file to Supabase
        excel_response = supabase.storage \
            .from_('excel-uploads') \
            .upload(unique_filename, file_bytes)
            
        if excel_response.get('error'):
            return jsonify({'error': excel_response['error']['message']}), 500
            
        # Create a temporary file for processing
        temp_file = BytesIO(file_bytes)
        
        # Process the Excel file
        json_data = read_excel_for_llm(temp_file)
        
        # Convert JSON to bytes
        json_bytes = json.dumps(json_data, indent=2, ensure_ascii=False).encode('utf-8')
        json_filename = f"{os.path.splitext(unique_filename)[0]}_output.json"
        
        # Upload JSON to Supabase
        json_response = supabase.storage \
            .from_('excel-uploads') \
            .upload(json_filename, json_bytes)
            
        if json_response.get('error'):
            return jsonify({'error': json_response['error']['message']}), 500
        
        # Get the public URL for the JSON file
        json_url = supabase.storage \
            .from_('excel-uploads') \
            .get_public_url(json_filename)
        
        return jsonify({
            "message": "File processed successfully",
            "json_path": json_url
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-charts', methods=['POST'])
def generate_charts():
    try:
        data = request.get_json()
        if not data or 'files' not in data:
            return jsonify({"error": "No files provided"}), 400
        
        json_files = data['files']
        scenario_names = data.get('scenarios', [f"Scenario {i+1}" for i in range(len(json_files))])
        
        # Create chart generator
        chart_gen = ChartGenerator()
        
        # Process each file
        processes = []
        for json_url, scenario_name in zip(json_files, scenario_names):
            extractor = ProcessDataExtractor(json_url, scenario_name)
            process_data = extractor.extract_process_data()
            processes.append(process_data)
        
        # Generate charts
        chart_urls = []
        
        # Generate comparative charts
        categories = {
            'Operating Costs': (lambda p: p.operating_costs, 'AOC.png'),
            'Material Costs': (lambda p: p.material_costs, 'Materials.png'),
            'Consumable Costs': (lambda p: p.consumable_costs, 'Consumables.png'),
            'Utility Costs': (lambda p: p.utility_costs, 'Utilities.png')
        }
        
        for title, (getter, filename) in categories.items():
            data = {p.name: getter(p) for p in processes}
            chart_bytes = BytesIO()
            chart_gen.create_comparative_chart(
                data,
                f'Comparative {title}',
                f'Annual Cost ({processes[0].currency})',
                chart_bytes,
                format='png'
            )
            chart_bytes.seek(0)
            
            # Generate unique filename
            unique_filename = f"chart_{str(uuid.uuid4())}_{filename}"
            
            # Upload chart to Supabase
            response = supabase.storage \
                .from_('charts') \
                .upload(unique_filename, chart_bytes.read())
                
            if response.get('error'):
                return jsonify({'error': response['error']['message']}), 500
                
            # Get public URL
            chart_url = supabase.storage \
                .from_('charts') \
                .get_public_url(unique_filename)
            chart_urls.append(chart_url)
        
        # Generate stacked bar chart
        stacked_chart_bytes = BytesIO()
        chart_gen.create_stacked_bar_chart(processes, stacked_chart_bytes, format='png')
        stacked_chart_bytes.seek(0)
        
        # Upload stacked bar chart
        stacked_filename = f"chart_{str(uuid.uuid4())}_stacked_bar_chart.png"
        response = supabase.storage \
            .from_('charts') \
            .upload(stacked_filename, stacked_chart_bytes.read())
            
        if response.get('error'):
            return jsonify({'error': response['error']['message']}), 500
            
        # Get public URL for stacked chart
        stacked_url = supabase.storage \
            .from_('charts') \
            .get_public_url(stacked_filename)
        chart_urls.append(stacked_url)
        
        return jsonify({
            "message": "Charts generated successfully",
            "chart_paths": chart_urls
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
