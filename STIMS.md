# Project Blueprint: EcoRoute Workspace (STIMS)

## 📌 Tech Stack & Architecture
- **Frontend Framework**: Next.js (Client Component Workspace architecture).
- **Styling**: Tailwind CSS (Slate-950 deep dark aesthetic, emerald/blue gradients, fade-in animations).
- **Backend Database & Auth**: Supabase (Cloud Project ID: `xddgwcehlbngysbrojsl`).
- **Core API Engine**: Carbon Interface Mock Engine running standalone on Node.js / Express.

## 🛠️ Environment Configuration (.env)
```ini
NEXT_PUBLIC_CARBON_INTERFACE_URL=https://stims.co.za
BASE_URL=https://stims.co.za
CARBON_INTERFACE_KEY=xq50V27sfV9wbySH6OQdQ
NEXT_PUBLIC_SUPABASE_URL=https://supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[truncated]
```

## 🔐 Supabase Configuration & DB Schema
### Auth Redirects
- **Site URL**: `https://stims.co.za`
- **Redirect URI**: `https://stims.co.za/update-password` (Handles secure `resetPasswordForEmail` flow).

### Database Tables
1. **`profiles`**: Stores corporate identity metadata. Fields: `id` (references auth.users), `name`, `company`.
2. **`user_vehicles`**: Custom corporate transport records. Strict real-time filtration rules require querying only where `is_active = true`. Fields: `id`, `user_id`, `make`, `model`, `year`, `is_active`, `created_at`.
3. **`emissions_logs`**: Historical performance repository tracking client queries. Fields: `id`, `category_display`, `carbon_kg`, `carbon_g`, `carbon_mt`, `carbon_lb`, `raw_payload`, `created_at`.

## ⚙️ Mock Carbon API Engine (`/api/v1`)
A standalone Node.js server executing behind an SSL reverse proxy to securely resolve Mixed Content restrictions. All endpoints require a Bearer token verification bypass lock (`Authorization: Bearer mock_secret_api_key_abc123`).
- **`GET /vehicle_makes`**: Fetches active brand list matching operational configurations.
- **`GET /vehicle_makes/:id/vehicle_models`**: Returns specific model maps indexed to the selected operational brand.
- **`POST /estimates`**: Performs automated mathematical conversions from payload specs (`distance_value`, `distance_unit`, `vehicle_make`, `vehicle_model`) using a standard 230g/km carbon baseline calculation.

## 🧰 Component Tool Descriptions

### 1. `Home (page.js)`
The master controller client workspace. It handles state coordination, hydrates data hooks directly from Supabase on mount, triggers the API calculators, and orchestrates user authentication views.

### 2. `AuthScreen`
The user access gateway. It provides a clean interface for secure user login, registration, and account recovery via Supabase Auth email bridges.

### 3. `Ticker`
A global utility dashboard asset that handles system logging contexts. It displays operational streaming data hooks across the application view.

### 4. `DispatchForm`
The primary mathematical configuration form. It aggregates distance metrics, metric standardizations (`mi`/`km`), and links drop-down hooks to active corporate fleet pools for emission tracking.

### 5. `Ledger`
The immediate calculation feedback module. It receives raw calculations from the Carbon API and translates the data into multiple units (`g`, `kg`, `lb`, `mt`) inside an clean card view.

### 6. `FleetManager` & `FleetList`
The corporate vehicle management portal. `FleetManager` runs an overlay workspace to provision new vehicle assets, while `FleetList` handles real-time removal queries matching active tracking states (`is_active = true`).

### 7. `CarbonChart`
A historical trend visualization tool. It plots operational footprints over time by mapping dates against historical `emissions_logs` entries.
