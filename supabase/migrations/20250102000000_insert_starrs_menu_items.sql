/*
  # Insert Starr's Famous Shakes Menu Items

  1. Categories
    - Add categories for shakes, bake-shake, vip, drunken, yogurt, munchies

  2. Menu Items
    - Famous Shakes (₱140) - with variations for each flavor
    - Bake & Shake (₱170) - individual items
    - Mint Choco Chip (₱185)
    - Starr's V.I.P. (₱170) - individual items
    - Drunken Starrs (₱170) - individual items
    - Also Starring (Yogurt-based) (₱200) - individual items
    - Starr's Munchies - individual items
    - MMunch Box - individual item

  3. Features
    - Auto-generated UUIDs for all items
    - Appropriate pricing for each item
    - Proper categorization
*/

-- First, add the required categories for Starr's menu
INSERT INTO categories (id, name, icon, sort_order, active) VALUES
  ('shakes', 'Famous Shakes', '🥤', 1, true),
  ('bake-shake', 'Bake & Shake', '🍰', 2, true),
  ('vip', 'Starr''s V.I.P.', '⭐', 3, true),
  ('drunken', 'Drunken Starrs', '🍹', 4, true),
  ('yogurt', 'Also Starring (Yogurt)', '🍓', 5, true),
  ('munchies', 'Starr''s Munchies', '🍟', 6, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Famous Shakes (base item with variations)
DO $$
DECLARE
  famous_shakes_id uuid;
BEGIN
  -- Insert the Famous Shakes menu item
  INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) 
  VALUES ('Famous Shakes', 'Our signature milkshakes made with premium ingredients. Choose from a variety of delicious flavors.', 140, 'shakes', true, true, NULL)
  RETURNING id INTO famous_shakes_id;
  
  -- Insert variations for Famous Shakes
  INSERT INTO variations (menu_item_id, name, price) VALUES
    (famous_shakes_id, 'Banana', 0),
    (famous_shakes_id, 'Caramel', 0),
    (famous_shakes_id, 'Cherry', 0),
    (famous_shakes_id, 'Chocolate', 0),
    (famous_shakes_id, 'Cookies & Cream', 0),
    (famous_shakes_id, 'Latte', 0),
    (famous_shakes_id, 'Mixed Berries', 0),
    (famous_shakes_id, 'Strawberry', 0),
    (famous_shakes_id, 'Vanilla', 0),
    (famous_shakes_id, 'Toffee', 0)
  ON CONFLICT DO NOTHING;
END $$;

-- Insert Bake & Shake items (₱170)
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Strawberry Cheesecake', 'Creamy strawberry cheesecake shake with real cheesecake pieces', 170, 'bake-shake', true, true, NULL),
  ('Toffee Banoffee', 'Rich toffee and banana shake with banoffee pie flavors', 170, 'bake-shake', true, true, NULL),
  ('Oreo Cheesecake', 'Oreo cookies blended with creamy cheesecake shake', 170, 'bake-shake', true, true, NULL),
  ('Crunchy Cookie', 'Cookie crumble shake with crunchy texture', 170, 'bake-shake', false, true, NULL),
  ('Butter Choco Cookies & Almond Roca', 'Buttery chocolate cookies with almond roca pieces', 170, 'bake-shake', false, true, NULL),
  ('Choco Hazelnut & Mallows', 'Chocolate hazelnut shake with marshmallows', 170, 'bake-shake', false, true, NULL),
  ('Caramel Cookie Dough', 'Caramel shake with cookie dough chunks', 170, 'bake-shake', false, true, NULL),
  ('Oreo Series', 'Classic Oreo shake with cookie pieces', 170, 'bake-shake', true, true, NULL);

-- Insert Mint Choco Chip (₱185)
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Mint Choco Chip', 'Refreshing mint shake with chocolate chips', 185, 'bake-shake', true, true, NULL);

-- Insert Starr's V.I.P. items (₱170)
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Bubblegum', 'Fun and fruity bubblegum flavored shake', 170, 'vip', false, true, NULL),
  ('Cherry Choco Mint', 'Cherry, chocolate, and mint combination shake', 170, 'vip', false, true, NULL),
  ('Cherrylime & Peaches', 'Tart cherry lime with sweet peaches shake', 170, 'vip', false, true, NULL),
  ('Reese''s Overload', 'Peanut butter and chocolate overload shake', 170, 'vip', true, true, NULL),
  ('Choco Banana Split', 'Classic banana split flavors in shake form', 170, 'vip', true, true, NULL),
  ('Mixed Berries & Banana', 'Mixed berries with fresh banana shake', 170, 'vip', false, true, NULL),
  ('PB, Banana, Caramel', 'Peanut butter, banana, and caramel shake', 170, 'vip', false, true, NULL),
  ('Vanilla Blue Heaven', 'Vanilla shake with blueberry flavors', 170, 'vip', false, true, NULL),
  ('Toffee & Candied Walnuts', 'Toffee shake with candied walnuts', 170, 'vip', false, true, NULL);

-- Insert Drunken Starrs items (₱170)
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Drunken Caramel', 'Caramel shake with a boozy twist', 170, 'drunken', false, true, NULL),
  ('Cherry Amaretto', 'Cherry shake with amaretto flavor', 170, 'drunken', false, true, NULL),
  ('Latte Mudslide', 'Coffee latte shake with mudslide flavors', 170, 'drunken', true, true, NULL);

-- Insert Also Starring (Yogurt-based) items (₱200)
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Caramel Fudge Almond Roca (Yogurt)', 'Yogurt-based shake with caramel fudge and almond roca', 200, 'yogurt', false, true, NULL),
  ('Banana Cookie Dough & Caramel Fudge (Yogurt)', 'Yogurt shake with banana, cookie dough, and caramel fudge', 200, 'yogurt', false, true, NULL),
  ('Vanilla with Graham & Granola Crumbs (Yogurt)', 'Vanilla yogurt shake with graham and granola', 200, 'yogurt', false, true, NULL),
  ('Cherry Amaretto (Yogurt)', 'Yogurt-based cherry amaretto shake', 200, 'yogurt', false, true, NULL),
  ('Strawberry Cheesecake (Yogurt)', 'Yogurt-based strawberry cheesecake shake', 200, 'yogurt', true, true, NULL),
  ('Mixed Berry Banana (Yogurt)', 'Yogurt shake with mixed berries and banana', 200, 'yogurt', false, true, NULL);

-- Insert Starr's Munchies items
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Belgian Fries', 'Crispy golden Belgian-style fries', 90, 'munchies', true, true, NULL),
  ('Mini Corndogs', 'Bite-sized corndogs perfect for snacking', 100, 'munchies', true, true, NULL),
  ('Mozzarella Poppers', 'Crispy mozzarella cheese poppers', 115, 'munchies', true, true, NULL),
  ('Chix Fries', 'Crispy chicken fries', 115, 'munchies', true, true, NULL),
  ('Onion Rings', 'Golden crispy onion rings', 90, 'munchies', false, true, NULL),
  ('Crosskrax Fries', 'Crisscross cut seasoned fries', 90, 'munchies', false, true, NULL);

-- Insert MMunch Box
INSERT INTO menu_items (name, description, base_price, category, popular, available, image_url) VALUES
  ('Munch Box (Assorted)', 'Assorted munchies box with a variety of snacks', 190, 'munchies', true, true, NULL);

