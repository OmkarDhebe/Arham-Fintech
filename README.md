# \# Arham Fintech Trade Dashboard

# 

# A full-stack trade dashboard built with \*\*Java, Spring Boot, React, and PostgreSQL\*\*. The application displays existing trade records and asynchronously fetches new trades from a mock BSE API. Server-Sent Events (SSE) notify connected dashboards when new trades are saved.

# 

# \## Features

# 

# \- Displays existing trades from PostgreSQL.

# \- Seeds the database with 2,000 initial trades when it is empty.

# \- Fetches mock exchange trades through a REST API.

# \- Runs trade pulls in the background without holding an HTTP request open.

# \- Pushes newly saved trades to connected dashboards using SSE.

# \- Prevents simultaneous pull requests while a pull is in progress.

# \- Configurable pull delay and batch size.

# 

# \## Technology Stack

# 

# \- \*\*Backend:\*\* Java, Spring Boot, Spring Data JPA

# \- \*\*Frontend:\*\* React, Vite

# \- \*\*Database:\*\* PostgreSQL

# \- \*\*Live updates:\*\* Server-Sent Events

# \- \*\*Build tools:\*\* Maven, npm

# \- \*\*Version control:\*\* Git and GitHub

# 

# \## Architecture

# 

# The React dashboard requests existing trades from the Spring Boot REST API. The backend retrieves them from PostgreSQL and returns them immediately.

# 

# When a trade pull is requested, the backend starts a background task. After the configured delay, it requests trades from the mock exchange endpoint, saves them to PostgreSQL, and publishes the new records to connected clients through SSE.

# 

# See \[ARCHITECTURE.md](ARCHITECTURE.md) for the architecture diagram, endpoints, and workflow.

# 

# \## Prerequisites

# 

# \- Java 21 or a compatible newer JDK

# \- Node.js and npm

# \- PostgreSQL

# \- Git

# 

# \## Configuration

# 

# Configure the following in `backend/src/main/resources/application.properties`:

# 

# ```properties

# server.port=8085

# 

# spring.datasource.url=jdbc:postgresql://localhost:5434/tradesdb

# spring.datasource.username=postgres

# spring.datasource.password=${DB\_PASSWORD}

# 

# spring.jpa.hibernate.ddl-auto=update

# spring.jpa.show-sql=false

# spring.jpa.open-in-view=false

# 

# trades.pull.delay-ms=30000

# trades.pull.initial-count=2000

# trades.mock-bse.base-url=http://localhost:8085

# ```

# 

# Set `DB\_PASSWORD` to your local PostgreSQL password before starting the backend. Do not commit actual database credentials.

# 

# The example configuration uses a 30-second delay for demonstrations. To simulate a 15-minute pull, set `trades.pull.delay-ms=900000`.

# 

# Ensure PostgreSQL is running and the `tradesdb` database exists before launching the backend.

# 

# \## Running the Application

# 

# \### 1. Start the backend

# 

# Open PowerShell in the project root:

# 

# ```powershell

# $env:DB\_PASSWORD = Read-Host "Enter your PostgreSQL password"

# cd .\\backend

# .\\mvnw.cmd spring-boot:run

# ```

# 

# The backend starts at `http://localhost:8085`.

# 

# \### 2. Start the frontend

# 

# Open a second PowerShell terminal:

# 

# ```powershell

# cd C:\\Users\\lenovo\\arham-trades-dashboard\\frontend

# npm install

# npm run dev

# ```

# 

# Open the local URL printed by Vite, normally `http://localhost:5173`.

# 

# \### 3. Test the mock exchange API

# 

# ```powershell

# Invoke-RestMethod "http://localhost:8085/getTrades?count=3"

# ```

# 

# \### 4. Test the dashboard API

# 

# ```powershell

# Invoke-RestMethod "http://localhost:8085/api/trades/count"

# ```

# 

# Start a background pull:

# 

# ```powershell

# Invoke-RestMethod -Method Post "http://localhost:8085/api/trades/pull"

# ```

# 

# Check pull status:

# 

# ```powershell

# Invoke-RestMethod "http://localhost:8085/api/trades/pull/status"

# ```

# 

# The count should increase after the configured delay if the pull succeeds. Keep the dashboard open to verify that new trades arrive without manually refreshing it.

# 

# \## API Endpoints

# 

# | Method | Endpoint | Purpose |

# |---|---|---|

# | GET | `/getTrades?count=2000` | Generate mock exchange trades |

# | GET | `/api/trades` | Retrieve stored trades |

# | GET | `/api/trades/count` | Get the stored trade count |

# | GET | `/api/trades/stream` | Subscribe to SSE updates |

# | POST | `/api/trades/pull` | Start an asynchronous trade pull |

# | GET | `/api/trades/pull/status` | Check whether a pull is in progress |

# 

# \## Testing

# 

# Run backend tests from the `backend` directory:

# 

# ```powershell

# .\\mvnw.cmd test

# ```

# 

# Verify the following manually:

# 

# 1\. Existing trades load when the dashboard opens.

# 2\. A pull request returns promptly rather than waiting for the simulated delay.

# 3\. Newly fetched trades are saved in PostgreSQL.

# 4\. Connected dashboards receive new trades through SSE without a page refresh.

# 5\. A second pull request is rejected while the first pull is running.

# 

# \## Repository Structure

# 

# ```text

# arham-trades-dashboard/

# ├── ARCHITECTURE.md

# ├── README.md

# ├── backend/

# │   ├── pom.xml

# │   └── src/

# └── frontend/

# &#x20;   ├── package.json

# &#x20;   └── src/

# ```

# 

# \## Assessment Notes

# 

# This project demonstrates a REST-based backend, database persistence, asynchronous background processing, and server-pushed frontend updates. The mock exchange endpoint is intended for assessment and demonstration purposes, not for production market data.

# 

# \## Author

# 

# Omkar Dhebe

