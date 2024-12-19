from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
import pandas as pd
import json
from excel_reader_for_llm import read_excel_for_llm, excel_to_json
from chart_generation_multiple import ProcessDataExtractor, ChartGenerator

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
CHARTS_FOLDER = 'charts'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CHARTS_FOLDER, exist_ok=True)

@app.route('/charts/<path:filename>')
def serve_chart(filename):
    return send_from_directory(CHARTS_FOLDER, filename)

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
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        # Process the Excel file
        json_data = read_excel_for_llm(file_path)
        
        # Save JSON output
        json_output_path = os.path.join(UPLOAD_FOLDER, f"{os.path.splitext(file.filename)[0]}_output.json")
        with open(json_output_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
        
        return jsonify({
            "message": "File processed successfully",
            "json_path": json_output_path
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
        chart_gen = ChartGenerator(CHARTS_FOLDER)
        
        # Process each file
        processes = []
        for file_path, scenario_name in zip(json_files, scenario_names):
            extractor = ProcessDataExtractor(file_path, scenario_name)
            process_data = extractor.extract_process_data()
            processes.append(process_data)
        
        # Generate charts
        chart_paths = []
        
        # Generate comparative charts
        categories = {
            'Operating Costs': (lambda p: p.operating_costs, 'AOC.png'),
            'Material Costs': (lambda p: p.material_costs, 'Materials.png'),
            'Consumable Costs': (lambda p: p.consumable_costs, 'Consumables.png'),
            'Utility Costs': (lambda p: p.utility_costs, 'Utilities.png')
        }
        
        for title, (getter, filename) in categories.items():
            data = {p.name: getter(p) for p in processes}
            chart_gen.create_comparative_chart(
                data,
                f'Comparative {title}',
                f'Annual Cost ({processes[0].currency})',
                filename
            )
            chart_paths.append(filename)  # Only return the filename, not the full path
        
        # Generate stacked bar chart
        chart_gen.create_stacked_bar_chart(processes)
        chart_paths.append('stacked_bar_chart.png')
        
        return jsonify({
            "message": "Charts generated successfully",
            "chart_paths": chart_paths
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)