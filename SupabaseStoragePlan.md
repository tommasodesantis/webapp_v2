1. Create a Supabase Bucket
Sign into Supabase and open your project’s dashboard.
Go to Storage on the left sidebar.
Create a new Bucket (e.g., excel-uploads or charts-outputs).
Optionally configure your bucket’s access policies (e.g., public or restricted) depending on your security requirements.
Tip: You can have one bucket for uploads and charts, or two separate buckets (e.g., excel-uploads and charts). It depends on how you plan to organize your files.

2. Configure Supabase Credentials (Backend)
Install or verify that the supabase-py dependency is in your backend’s requirements.txt (it already is, as supabase-py==0.0.2).
Create a new file (or reuse supabase.config.ts in /shared/) with your Supabase backend environment variables:
bash
Copy code
# .env (example)
SUPABASE_URL = https://qggrsnnupngwtutmjcjb.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZ3Jzbm51cG5nd3R1dG1qY2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5Mjg2NTEsImV4cCI6MjA0NjUwNDY1MX0.VYPN0Rtkax5hkaCTy-ebETDPuPbL50Kz9aY2dgPGaZQ
Ensure that Flask can load environment variables from .env. You can use python-dotenv (already included as python-dotenv==1.0.1) in app.py:
python
Copy code
from dotenv import load_dotenv
import os

load_dotenv()  # This reads variables from .env

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
Initialize a Supabase client in app.py (or a dedicated module):
python
Copy code
from supabase import create_client, Client

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

3. Remove Local Uploads Directory Usage
A) Replace Local Upload Logic with Supabase Storage
In the current file upload route (/api/upload), remove or comment out logic that saves files to uploads/:
python
Copy code
# old: file.save(os.path.join(UPLOAD_FOLDER, filename))
Instead, read the file into a bytes stream in Python, then upload to Supabase Storage:
python
Copy code
from werkzeug.utils import secure_filename

@app.route('/api/upload', methods=['POST'])
def upload_files():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filename = secure_filename(file.filename)
    file_bytes = file.read()

    # Upload to your chosen Supabase bucket
    response = supabase.storage \
        .from_('excel-uploads') \
        .upload(filename, file_bytes)

    if response.get('error'):
        return jsonify({'error': response['error']['message']}), 500

    # Optionally get a public URL or stored path
    stored_path = response.get('data', {}).get('path', '')

    return jsonify({'message': 'File uploaded successfully', 'file_path': stored_path}), 200
Validate file extensions as before but skip storing them locally.
B) Store Chart Images in Supabase
When generating charts, you currently write them as .png or .jpg into charts/.
Convert the existing logic to:
Create the chart locally in memory or temporarily on disk.
Upload the resulting binary data to Supabase in a similar fashion, e.g.:
python
Copy code
from io import BytesIO

# After creating the matplotlib chart:
chart_bytes = BytesIO()
plt.savefig(chart_bytes, format='png')
chart_bytes.seek(0)

# Upload to Supabase
chart_filename = "chart_" + str(uuid.uuid4()) + ".png"
response = supabase.storage \
    .from_('charts') \
    .upload(chart_filename, chart_bytes.read())
Return the newly generated chart’s public or private URL to the frontend instead of a local file path.

4. Make Bucket Files Publicly Accessible (If Desired)
If you want the frontend to directly load the files using a public URL:
Go to Storage Policies in Supabase and allow public read for the bucket or specific folder path.
Or, generate a signed URL from the backend to pass to the frontend:
python
Copy code
signed_url_response = supabase.storage \
    .from_('charts') \
    .create_signed_url(chart_filename, 3600) # 1 hour
Return the signed_url_response to the frontend.

5. Update Frontend to Fetch Files from Supabase
Currently, your frontend likely fetches file paths from http://<backend>/charts/....
Replace those references with the Supabase URL or the signed URL returned by your Flask endpoints.
For example, if your Flask endpoint returns a chart_url, you can just render the chart in the frontend with:
tsx
Copy code
<img src={chart_url} alt="Chart Image" />
Ensure you handle any authentication or expiration logic (if using signed URLs).

6. Verify Upload and Access Policies
Test uploading various files to ensure they appear in the Supabase bucket under the correct path.
Check generated charts in Supabase to confirm they match your naming scheme.
Load them in the frontend to verify correct URLs and display.

7. Clean Up Old File Handling Logic
Remove or deprecate the uploads/ and charts/ directories if you’re no longer using them.
Delete code segments or environment variables referencing local file paths.
Adjust logging and error handling to reflect the new storage approach.