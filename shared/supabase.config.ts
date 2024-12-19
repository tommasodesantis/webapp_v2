import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema
export const TABLES = {
  UPLOADS: 'uploads',
  CHARTS: 'charts',
  USER_DATA: 'user_data'
};

// SQL for creating tables
export const CREATE_TABLES_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Uploads table
CREATE TABLE IF NOT EXISTS ${TABLES.UPLOADS} (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  json_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Charts table
CREATE TABLE IF NOT EXISTS ${TABLES.CHARTS} (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  upload_id UUID REFERENCES uploads(id),
  chart_path TEXT NOT NULL,
  chart_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- User data table
CREATE TABLE IF NOT EXISTS ${TABLES.USER_DATA} (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON ${TABLES.UPLOADS}(user_id);
CREATE INDEX IF NOT EXISTS idx_charts_user_id ON ${TABLES.CHARTS}(user_id);
CREATE INDEX IF NOT EXISTS idx_charts_upload_id ON ${TABLES.CHARTS}(upload_id);
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON ${TABLES.USER_DATA}(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE ${TABLES.UPLOADS} ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${TABLES.CHARTS} ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${TABLES.USER_DATA} ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own uploads"
  ON ${TABLES.UPLOADS}
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own charts"
  ON ${TABLES.CHARTS}
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own data"
  ON ${TABLES.USER_DATA}
  FOR ALL
  USING (auth.uid() = user_id);
`;

// Helper functions for database operations
export const dbHelpers = {
  async createUploadRecord(userId: string, filename: string, filePath: string, jsonPath: string) {
    return await supabase
      .from(TABLES.UPLOADS)
      .insert([
        {
          user_id: userId,
          filename,
          file_path: filePath,
          json_path: jsonPath
        }
      ])
      .select()
      .single();
  },

  async createChartRecord(userId: string, uploadId: string, chartPath: string, chartType: string) {
    return await supabase
      .from(TABLES.CHARTS)
      .insert([
        {
          user_id: userId,
          upload_id: uploadId,
          chart_path: chartPath,
          chart_type: chartType
        }
      ])
      .select()
      .single();
  },

  async getUserUploads(userId: string) {
    return await supabase
      .from(TABLES.UPLOADS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async getUserCharts(userId: string) {
    return await supabase
      .from(TABLES.CHARTS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }
};