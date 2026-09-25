-- ============================================================
-- Wishlist de Casey — esquema de Supabase
-- Pega TODO este archivo en Supabase > SQL Editor > New query > Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- TABLAS ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  icon text not null default '🎁',
  order_index int not null default 0
);

create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  slug text not null,
  label text not null,
  unique (category_id, slug)
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric not null default 0,
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references subcategories(id) on delete set null,
  brand text not null default '',
  model text not null default '',
  size text not null default '',
  color text not null default '',
  image_url text not null default '',
  link_url text not null default '',
  priority text not null default 'normal' check (priority in ('love', 'like', 'normal')),
  visible boolean not null default true,
  order_index int not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- ROW LEVEL SECURITY ----------
alter table categories enable row level security;
alter table subcategories enable row level security;
alter table products enable row level security;

-- Cualquiera (incluso sin sesión) puede LEER categorías y subcategorías
create policy "categorias: lectura publica" on categories for select using (true);
create policy "subcategorias: lectura publica" on subcategories for select using (true);

-- Solo un usuario autenticado (tú, el admin) puede escribir categorías/subcategorías
create policy "categorias: escritura admin" on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "subcategorias: escritura admin" on subcategories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Los productos VISIBLES son públicos; el admin autenticado ve todos (incluidos ocultos)
create policy "productos: lectura publica de visibles" on products for select
  using (visible = true or auth.role() = 'authenticated');

-- Solo el admin autenticado puede crear/editar/eliminar productos
create policy "productos: escritura admin" on products for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------- REALTIME ----------
-- Para que la vista pública se actualice sola cuando el admin hace cambios
alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table subcategories;
alter publication supabase_realtime add table products;

-- ---------- DATOS INICIALES: CATEGORÍAS Y SUBCATEGORÍAS ----------
insert into categories (slug, label, icon, order_index) values
  ('ropa', 'Ropa', '👕', 1),
  ('accesorios', 'Accesorios', '⌚', 2),
  ('videojuegos', 'Videojuegos', '🎮', 3),
  ('tecnologia', 'Tecnología', '💻', 4),
  ('running', 'Running', '🏃', 5),
  ('otros', 'Otros', '✨', 6)
on conflict (slug) do nothing;

insert into subcategories (category_id, slug, label)
  select id, s.slug, s.label from categories, (values
    ('running','Running'), ('casual','Casual'), ('interior','Ropa interior')
  ) as s(slug, label) where categories.slug = 'ropa'
on conflict do nothing;

insert into subcategories (category_id, slug, label)
  select id, s.slug, s.label from categories, (values
    ('garmin','Garmin'), ('relojes','Relojes'), ('carteras','Carteras'),
    ('mochilas','Mochilas'), ('gorras','Gorras'), ('gafas','Gafas'), ('otros','Otros')
  ) as s(slug, label) where categories.slug = 'accesorios'
on conflict do nothing;

insert into subcategories (category_id, slug, label)
  select id, s.slug, s.label from categories, (values
    ('fc','EA Sports FC'), ('pc','Juegos PC'), ('consola','Juegos consola'), ('gaming','Accesorios gaming')
  ) as s(slug, label) where categories.slug = 'videojuegos'
on conflict do nothing;

insert into subcategories (category_id, slug, label)
  select id, s.slug, s.label from categories, (values
    ('auriculares','Auriculares'), ('teclados','Teclados'), ('ratones','Ratones'),
    ('gadgets','Gadgets'), ('otros','Otros')
  ) as s(slug, label) where categories.slug = 'tecnologia'
on conflict do nothing;

insert into subcategories (category_id, slug, label)
  select id, s.slug, s.label from categories, (values
    ('zapatillas','Zapatillas'), ('camisetas','Camisetas'), ('shorts','Shorts'),
    ('relojesgps','Relojes GPS'), ('calcetines','Calcetines'), ('mochilas','Mochilas')
  ) as s(slug, label) where categories.slug = 'running'
on conflict do nothing;

insert into subcategories (category_id, slug, label)
  select id, s.slug, s.label from categories, (values ('otros','Otros')) as s(slug, label)
  where categories.slug = 'otros'
on conflict do nothing;

-- ---------- PRODUCTOS DE EJEMPLO (is_demo = true, para identificarlos y borrarlos fácil) ----------
insert into products (name, description, price, category_id, subcategory_id, brand, priority, order_index, is_demo)
select 'Camiseta técnica Nike', 'Camiseta transpirable para entrenar.', 35,
  c.id, sc.id, 'Nike', 'like', 1, true
from categories c join subcategories sc on sc.category_id = c.id
where c.slug='ropa' and sc.slug='running';

insert into products (name, description, price, category_id, subcategory_id, brand, priority, order_index, is_demo)
select 'Shorts Nike Running', 'Shorts ligeros con malla interior.', 32,
  c.id, sc.id, 'Nike', 'normal', 2, true
from categories c join subcategories sc on sc.category_id = c.id
where c.slug='ropa' and sc.slug='running';

insert into products (name, description, price, category_id, subcategory_id, brand, priority, order_index, is_demo)
select 'Zapatillas ASICS', 'Amortiguación para tiradas largas.', 120,
  c.id, sc.id, 'ASICS', 'love', 3, true
from categories c join subcategories sc on sc.category_id = c.id
where c.slug='running' and sc.slug='zapatillas';

insert into products (name, description, price, category_id, subcategory_id, priority, order_index, is_demo)
select 'Calcetines deportivos', 'Pack de 3 pares antiampollas.', 12,
  c.id, sc.id, 'normal', 4, true
from categories c join subcategories sc on sc.category_id = c.id
where c.slug='running' and sc.slug='calcetines';

insert into products (name, description, price, category_id, subcategory_id, brand, model, priority, order_index, is_demo)
select 'Garmin Forerunner', 'Reloj GPS para entrenamientos y running.', 299,
  c.id, sc.id, 'Garmin', 'Forerunner 255', 'love', 5, true
from categories c join subcategories sc on sc.category_id = c.id
where c.slug='accesorios' and sc.slug='garmin';

insert into products (name, description, price, category_id, subcategory_id, priority, order_index, is_demo)
select 'Gafas de sol', 'Para correr y para el día a día.', 60,
  c.id, sc.id, 'like', 6, true
from categories c join subcategories sc on sc.category_id = c.id
where c.slug='accesorios' and sc.slug='gafas';

insert into products (name, description, price, category_id, subcategory_id, priority, order_index, is_demo)
select 'Cartera de piel', 'Cartera minimalista.', 45,
  c.id, sc.id, 'normal', 7, true
from categories c join subcategories sc on sc.category_id = c.id
where c.slug='accesorios' and sc.slug='carteras';

insert into products (name, description, price, category_id, subcategory_id, brand, size, priority, order_index, is_demo)
select 'Calvin Klein Boxer', 'Pack de boxers.', 28,
  c.id, sc.id, 'Calvin Klein', 'M', 'like', 8, true
from categories c join subcategories sc on sc.category_id = c.id
where c.slug='ropa' and sc.slug='interior';

insert into products (name, description, price, category_id, subcategory_id, brand, priority, order_index, is_demo)
select 'EA Sports FC', 'Edición estándar, para PS5.', 70,
  c.id, sc.id, 'EA', 'love', 9, true
from categories c join subcategories sc on sc.category_id = c.id
where c.slug='videojuegos' and sc.slug='fc';

insert into products (name, description, price, category_id, subcategory_id, priority, order_index, is_demo)
select 'Auriculares inalámbricos', 'Cancelación de ruido para trabajar y viajar.', 150,
  c.id, sc.id, 'like', 10, true
from categories c join subcategories sc on sc.category_id = c.id
where c.slug='tecnologia' and sc.slug='auriculares';
