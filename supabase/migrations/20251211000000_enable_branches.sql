/*
  # Enable Multi-Branch Support

  1. New Tables
    - `branches`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `address` (text, required)
      - `phone` (text, required)
      - `latitude` (text, required) - Store as text to match existing site_settings pattern or numeric
      - `longitude` (text, required)
      - `is_main` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to `orders`
    - Add `branch_id` (uuid, references branches)

  3. Security
    - Enable RLS on `branches`
    - Public read access
    - Admin all access
*/

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  latitude text NOT NULL, -- keeping as text to avoid precision issues and match Lalamove API needs often
  longitude text NOT NULL,
  is_main boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add branch_id to orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'branch_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN branch_id uuid REFERENCES branches(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Policies for branches
CREATE POLICY "Public can view active branches"
  ON branches
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage branches"
  ON branches
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
