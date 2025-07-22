# LibNet
**LibNet** is a service that unifies the search of the books for a user, making it more simple. Libraries can plug into our system to keep track of available books and let users reserve them easily.  The aggregator is built to work with many libraries at once, so everything stays organized and simple to reach.

## 🎯 Planned Functionality

### 👥 User Roles

#### 🛡️ Admin
- Manage library manager permissions
- Add/remove libraries to the system
- Oversee platform-wide operations

#### 📚 Library Manager
- View and update book reservation statuses
- Manage library information (hours, location, policies)
- Add/edit/remove books in their assigned library

#### 👩💻 Reader (User)
- **Book Discovery**:
  - Search across all libraries
  - Filter by genre, availability, or location
  - Save favorites for quick access
- **Reservations**:
  - Book items at preferred libraries
  - Track reservation status
- **Self-Service**:
  - FAQ knowledge base
  - Account management

## Key Implemented Features

### For Readers
- 🔍 Unified book search across all partner libraries
- 📅 Online reservation system with status tracking
- ❤️ Favorites list for saved books
- 📱 Responsive design for devices

### For Library Staff
- 📊 Manager dashboard for reservations
- 📚 Book inventory management
- 🏢 Multi-library support

### Technical Highlights
- ⚡ FastAPI backend with JWT authentication
- 🎨 React frontend with Vite optimization
- 📊 Grafana/Loki monitoring stack
- 🔄 Automated database migration (Ollama)
- 🛡️ Role-based access control

### Impact
- Fast book discovery for users
- Centralized management for library networks

## 🔐 Demo Access

### User Account
The live demo is publicly available with **standard user access**:  
🌐 [libnet.site](https://libnet.site)  

### Admin/Manager Accounts
For testing privileged access:
- **Manager panel**  
- **Admin dashboard**  
📩 Contact via Telegram: [@alliumpro](https://t.me/alliumpro) to request credentials  

*Access is restricted to prevent unauthorized system changes.*

## Monitoring Setup

### Loki Logs Configuration
1. Install the Docker logging plugin:
To launch our service. First download the plugin.:
```bash
docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions
```
Then do:
```bash
docker compose up --build -d
```
⚠️ **Note**: The system won't launch without the required `.env` file configuration.

## Accessing Grafana

To access the Grafana monitoring dashboard:

1. Open in your browser:  
   `http://<your-server-ip>:3000`

2. Authentication:  
   Credentials are restricted to team members only

3. Request access:  
   Contact project maintainers:  
   - **Telegram**: [@alliumpro](https://t.me/alliumpro) (Ivan Murzin)  
   - **Email**: [i.murzin@innopolis.university](mailto:i.murzin@innopolis.university)  

⚠️ **Note**: Some dashboard features require environment variables and may not be fully accessible without proper configuration.


#### Deployment Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/IU-Capstone-Project-2025/libnet.git
   cd libnet
   ```
2. Configure environment

    ```bash
    cd backend
    nano  .env  # Create environment file
    ```
3. Google SMTP Setup:
   * Enable 2FA on your Google account
   * Get a key for the application via Google
   * Enter the key in SMTP_PASS, SMTP_USER as email
  
    
4. Edit `.env` file:
    
    Create a database, make a secret key, create a database user.
    ```ini
    DATABASE_URL=database-url 
    SECRET_KEY=your-secret-key 
    POSTGRES_USER=your_db_user
    POSTGRES_PASSWORD=your_db_password
    POSTGRES_DB=your_db_name
    SMTP_USER=your-email@gmail.com
    SMTP_PASS=your-google-app-password
    ```
5. Remove lines 12-20 inclusive from `/libnet/frontend/nginx.conf` and change `libnet.site` to `localhost` in line 11.

6. Launch services

    ```bash
    docker-compose up -d --build
   ```
The project has been launched!


## Roadmap
### 🚀 Week 1 Foundation & Planning 

#### Team Setup
- [x] Finalize team members 
- [x] Assign initial roles (Dev, PM, UX, etc.)  

#### Project Definition
- [x] Pick 1 idea from brainstorm (with problem validation)  
- [x] Define:  
  - Target users  
  - Problem statement  
  - Writing user stories  

#### Tech Foundation
- [x] Setup Git repo:  
  - Basic structure (`/frontend`, `/backend`, `.gitignore`)  
  - Runnable proof-of-concept  
- [x] Docker support:  
  - `Dockerfile` per component  
  - `docker-compose.yml` for local orchestration  
- [x] Design development started

### 🚀 Week 2 Initial Design & Elaboration
#### Requirements & Planning
- [X] Expand MVP user stories with detailed acceptance criteria  
- [X] Create prioritized backlog (e.g., GitHub Projects/Jira)  

#### Design
- [x] Development of the main part of the Design  
- [x] User Flow Diagrams  

#### Frontend
- [x] Setup project structure (components, pages, assets)  
- [x] Implement static versions of:  
  - Main page  
  - Book search page  
  - User profile skeleton  

#### Backend  
- [x] Define API spec (OpenAPI/Swagger) for MVP endpoints  
- [x] Implementation of part of MVP 
- [x] Implement endpoints

### 🚀 Week 3 MVP Development

#### Core Features
- [x] Implement the highest priority features from the backlog  
  - Book covers upload (file/URL)  
  - Favorites functionality  
  - Multi-library support 
  - Booking date calculation

#### Frontend
- [x] Connect key pages to backend APIs  
  - User orders & favorites 
  - Library selection 
  - Manager panel 
- [x] Implement high-priority features  
  - City/library switching 
  - Component styling 
  - Layout restructuring  
#### Backend
- [x] Complete essential API endpoints    
  - Book quantity management 
- [x] Implement high-priority features  
  - JWT token protection   
  - Image handling 


### 🚀 Week 4 Priorities: Testing & Deployment

#### Core Features
- [x] Implement search & filtering system  
  - Book search functionality  
  - Deduplication endpoint  
- [x] Finalize admin controls  
  - Library editing flows  
  - Manager assignment system  

#### Frontend
- [x] Connect admin interfaces to backend  
  - Admin login/dashboard  
  - Library management UI  
- [x] Implement responsive design  
  - Adaptive breakpoints  
  - Admin panel styling  
  - Cross-page style refinement  

#### Backend
- [x] Complete testing suite  
- [x] Enhance book operations  
  - Search/filter endpoints  
  - Duplicate prevention  

#### Infrastructure
- [x] Deployment preparation  
  - Domain configuration  
  - CI/CD pipeline setup  
- [x] Observability  
  - Logging system  
  - Monitoring integration  


### 🚀 Week 5 Priorities: Refinement & Polish

#### Core Features
- [x] Security enhancements  
  - Token-based endpoint protection  
  - Role-based access control  
- [x] User management  
  - Password update functionality  
  - Unauthorized user flows  

#### Frontend
- [x] UI/UX improvements  
  - Mobile responsiveness (width < 450px)  
  - Search/filter styling  
  - Scrollbar fixes  
  - Navbar/book centering  
- [x] Book management  
  - Add/delete books interface  
  - Image loading fixes  

#### Backend
- [x] Data operations  
  - Cross-database migration tool  
  - City-based book retrieval  
- [x] Testing updates  
  - Password update tests  
  - Token validation tests  

#### Infrastructure
- [x] Security  
  - HTTPS configuration  
- [x] Monitoring  
  - Grafana/Loki access setup 

### 🚀 Week 6 Priorities: User Experience & System Refinement

#### Core Features
- [x] User workflow improvements
  - FAQ implementation
  - Booking cancellation flow
  - Email verification system
  - Library contact information

#### Frontend
- [x] UI enhancements
  - Library info pages redesign
  - Manager/Admin page styling fixes
  - Button and list-item styling
  - Login popup slider fix
  - Back button for Book pages
  - Cursor pointers for select lists

- [x] Filter system
  - City/library filters implementation
  - Author/genre search filters
  - Responsive filter behavior

#### Backend
- [x] Booking management
  - Booking sorting
  - Quantity adjustment
  - Optimized booking retrieval
  - Manager booking search

- [x] Security
  - DDOS protection
  - Admin self-deletion prevention
  - Verification code endpoints

#### Documentation
- [x] System updates
  - Roadmap maintenance
  - Demo recordings
  - Report documentation



>## Contacts
>
>>### Artem Ostapenko
>>- Telegram: [@ostxxp](https://t.me/ostxxp)
>>- Email: [a.ostapenko@innopolis.university](mailto:a.ostapenko@innopolis.university)
>
>>### Aliya Sagdieva
>>- Telegram: [@aliushka_sgdv](https://t.me/aliushka_sgdv)
>>- Email: [a.sagdieva@innopolis.university](mailto:a.sagdieva@innopolis.university)
>
>>### Anna Serova
>>- Telegram: [@kbvsp](https://t.me/kbvsp)
>>- Email: [a.serova@innopolis.university](mailto:a.serova@innopolis.university)
>
>>### Alena Averina
>>- Telegram: [@flowelx](https://t.me/flowelx)
>>- Email: [a.averina@innopolis.university](mailto:a.averina@innopolis.university)
>
>>### Ivan Murzin
>>- Telegram: [@alliumpro](https://t.me/alliumpro)
>>- Email: [i.murzin@innopolis.university](mailto:i.murzin@innopolis.university)
