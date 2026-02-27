# Invoice System Backend

This is the backend for the Invoice System, built with Node.js, Express, and MongoDB. It provides RESTful APIs for user authentication, firm management, invoice type selection, and invoice generation for gold, silver, or both metals.

## Features

- **User Authentication**: Signup and login with JWT-based authentication.
- **Firm Management**: Create and list firms for each user.
- **Invoice Types**: Manage and select invoice types.
- **Invoice Generation**: Create invoices for gold, silver, or both, with dynamic forms based on type.
- **Invoice Listing & Details**: View all invoices, single invoice details, update, and delete invoices.
- **Printing Support**: (Handled on frontend; backend provides invoice data.)

## API Endpoints

### Auth

- `POST /api/auth/signup` — Register a new user
- `POST /api/auth/login` — Login and receive JWT

### Firms

- `POST /api/firms` — Create a new firm (auth required)
- `GET /api/firms` — List all firms for logged-in user

### Invoice Types

- `GET /api/invoice-types` — List all invoice types

### Invoices

- `POST /api/invoices` — Create a new invoice (auth required)
- `GET /api/invoices` — List all invoices for logged-in user
- `GET /api/invoices/:id` — Get single invoice details
- `PUT /api/invoices/:id` — Update invoice
- `DELETE /api/invoices/:id` — Delete invoice

## Setup

1. Clone the repo and navigate to `backend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with:
   ```env
   PORT=5000
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   node index.js
   ```

## Remaining Backend Tasks

- **Invoice Printing**: Backend provides invoice data; printing is handled on frontend.
- **Validation & Error Handling**: Basic validation is present. Add more as needed.
- **Role Management**: (Optional) Add admin/user roles if required.

## Project Flow (Backend)

1. User signs up/logs in.
2. User creates/selects a firm.
3. User selects metal type (gold/silver/both).
4. User selects invoice type.
5. User fills invoice form (fields depend on type/metal).
6. Invoice is generated and can be fetched for printing.

---

For frontend integration, use the above endpoints to build the UI flow as described.
