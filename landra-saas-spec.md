# Landra - AI-Powered Property Management Platform

_Intelligent Property Management for Property Owners_

## MVP Technical Specification

### 1. System Architecture

#### Tech Stack

```
Frontend:
├── Next.js 15.5 (App Router)
├── TypeScript
├── Tailwind CSS
├── Shadcn/UI Components
└── React Hook Form + Zod validation

Backend:
├── Next.js Server Actions (main backend logic)
├── Drizzle ORM
├── PostgreSQL (AWS RDS)
└── NextAuth.js (Authentication)

AI & External Services:
├── OpenAI Agents SDK (GPT-4 Agents)
├── AWS S3 (File Storage)
├── AWS SES (Email notifications)
└── multer, aws-sdk  (File uploads)

Infrastructure:
├── AWS EC2 (Hosting)
├── AWS RDS (Database)
├── AWS S3 (Static files)
└── CloudFront (CDN)
```

### 2. Database Schema

#### Core Tables

```sql
-- Properties
properties {
  id: uuid (PK)
  owner_id: uuid (FK)
  name: string
  address: text
  description: text
  total_units: integer
  amenities: json
  rules: text
  created_at: timestamp
  updated_at: timestamp
}

-- Units
units {
  id: uuid (PK)
  property_id: uuid (FK)
  unit_number: string
  monthly_rent: decimal
  deposit_required: decimal
  advance_required: decimal
  size_sqm: decimal
  bedrooms: integer
  bathrooms: integer
  is_available: boolean
  images: json
  created_at: timestamp
  updated_at: timestamp
}

-- Tenants
tenants {
  id: uuid (PK)
  property_id: uuid (FK)
  first_name: string
  last_name: string
  email: string
  phone: string
  emergency_contact: json
  created_at: timestamp
  updated_at: timestamp
}

-- Leases
leases {
  id: uuid (PK)
  unit_id: uuid (FK)
  tenant_id: uuid (FK)
  start_date: date
  end_date: date
  monthly_rent: decimal
  deposit_paid: decimal
  advance_paid: decimal
  due_date: integer (day of month)
  status: enum (active, terminated, expired)
  created_at: timestamp
  updated_at: timestamp
}

-- Payments
payments {
  id: uuid (PK)
  lease_id: uuid (FK)
  amount: decimal
  payment_method: enum (gcash, paymaya, bank_transfer, cash)
  payment_date: date
  due_date: date
  reference_number: string
  status: enum (pending, confirmed, overdue)
  notes: text
  created_at: timestamp
  updated_at: timestamp
}

-- Inquiries
inquiries {
  id: uuid (PK)
  property_id: uuid (FK)
  name: string
  email: string
  phone: string
  message: text
  source: enum (chatbot, direct, referral)
  status: enum (new, contacted, scheduled, converted, closed)
  created_at: timestamp
  updated_at: timestamp
}

-- Chat Conversations
chat_conversations {
  id: uuid (PK)
  property_id: uuid (FK)
  inquiry_id: uuid (FK)
  messages: json
  visitor_id: string
  created_at: timestamp
  updated_at: timestamp
}

-- Property Owners (Users)
users {
  id: uuid (PK)
  email: string (unique)
  name: string
  phone: string
  subscription_plan: enum (free, basic, premium)
  subscription_expires_at: timestamp
  created_at: timestamp
  updated_at: timestamp
}
```

### 3. API Endpoints Structure

#### Authentication (Server Actions)

```
signupUser()         // Register new user
signinUser()         // Sign in user
signoutUser()        // Sign out user
getSession()         // Get current session
```

#### Properties Management (Server Actions)

```
getProperties()              // List user's properties
createProperty()             // Create new property
getPropertyDetails(id)       // Get property details
updateProperty(id)           // Update property
deleteProperty(id)           // Delete property
uploadPropertyImages(id)     // Upload property images
```

#### Units Management (Server Actions)

```
getUnits(propertyId)         // List units in property
createUnit(propertyId)       // Create new unit
getUnitDetails(unitId)       // Get unit details
updateUnit(unitId)           // Update unit
deleteUnit(unitId)           // Delete unit
```

#### Tenants & Leases (Server Actions)

```
getTenants()                 // List all tenants
createTenant()               // Create new tenant
getTenantDetails(id)         // Get tenant details
updateTenant(id)             // Update tenant
createLease()                // Create new lease
getLeaseDetails(id)          // Get lease details
updateLease(id)              // Update lease
```

#### Payments (Server Actions)

```
getPayments(filters)         // List payments (with filters)
recordPayment()              // Record new payment
getPaymentDetails(id)        // Get payment details
updatePayment(id)            // Update payment
getOverduePayments()         // Get overdue payments
```

#### Chatbot & Inquiries (Server Actions & OpenAI Agents SDK)

```
sendChatbotMessage()         // Send message to chatbot (OpenAI Agents)
getInquiries()               // List inquiries
createInquiry()              // Create inquiry from chatbot
updateInquiryStatus(id)      // Update inquiry status
getInquiryHistory(id)        // Get conversation history
```

#### Analytics & Dashboard (Server Actions)

```
getAnalyticsOverview()       // Dashboard overview data
getRevenueAnalytics()        // Revenue analytics
getOccupancyAnalytics()      // Occupancy analytics
getInquiryAnalytics()        // Inquiry analytics
```

### 4. MVP Feature Implementation Plan

#### Phase 1 (Weeks 1-3): Foundation

- [ ] User authentication & registration (NextAuth.js, Server Actions)
- [ ] Property creation and basic management (Drizzle ORM, Server Actions)
- [ ] Unit management (CRUD operations, Drizzle ORM, Server Actions)
- [ ] File upload for property images (multer, aws-sdk, AWS S3)
- [ ] Basic responsive UI with Tailwind

#### Phase 2 (Weeks 4-5): Core Property Management

- [ ] Tenant management system (Drizzle ORM, Server Actions)
- [ ] Lease creation and management (Drizzle ORM, Server Actions)
- [ ] Due date calculation and tracking (Server Actions)
- [ ] Basic dashboard with key metrics (Server Actions)

#### Phase 3 (Weeks 6-7): Payment System

- [ ] Manual payment recording (Drizzle ORM, Server Actions)
- [ ] Payment history tracking (Server Actions)
- [ ] Overdue payment identification (Server Actions)
- [ ] Payment receipt generation (PDF)
- [ ] Email notifications for due dates (AWS SES)

#### Phase 4 (Weeks 8-9): AI Chatbot

- [ ] Basic chatbot UI (embedded widget)
- [ ] OpenAI Agents SDK integration
- [ ] Property-specific knowledge base
- [ ] Inquiry capture and lead generation (Server Actions)
- [ ] Image sharing capability in chat

#### Phase 5 (Weeks 10-11): Analytics & Polish

- [ ] Dashboard analytics implementation (Server Actions)
- [ ] Mobile responsive optimization
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] User testing and bug fixes

#### Phase 6 (Week 12): Deployment

- [ ] AWS infrastructure setup
- [ ] Production deployment
- [ ] SSL certificate and domain setup
- [ ] Monitoring and logging
- [ ] User onboarding flow

### 5. Chatbot Knowledge Base Structure

#### Property Information Categories

```javascript
const knowledgeBase = {
  rental_info: {
    monthly_rent: "₱15,000 - ₱25,000 depending on unit size",
    deposit: "1 month deposit required",
    advance: "1 month advance payment required",
    minimum_stay: "6 months minimum lease term",
  },

  amenities: [
    "24/7 Security",
    "Parking Space",
    "WiFi Ready",
    "Water and Electricity Included",
    "Laundry Area",
  ],

  requirements: [
    "Valid Government ID",
    "Proof of Income (3 months payslips)",
    "Employment Certificate",
    "Emergency Contact Details",
  ],

  policies: {
    pets: "Small pets allowed with additional deposit",
    visitors: "Visitor hours: 6AM - 10PM",
    noise: "Quiet hours: 10PM - 6AM",
  },
};
```

### 6. Key Components Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn components
│   ├── property/              # Property management components
│   ├── tenant/                # Tenant management components
│   ├── payment/               # Payment components
│   ├── chatbot/               # Chatbot widget & components
│   └── dashboard/             # Analytics & dashboard components
├── pages/
│   ├── api/                   # API routes
│   ├── dashboard/             # Main dashboard pages
│   ├── properties/            # Property management pages
│   └── chatbot/               # Chatbot interface
├── lib/
│   ├── auth.ts                # Authentication config
│   ├── db.ts                  # Database connection
│   ├── utils.ts               # Utility functions
│   └── validations.ts         # Zod schemas
└── types/
    └── index.ts               # TypeScript type definitions
```

### 7. Success Metrics for MVP

#### Technical Metrics

- Page load time < 2 seconds
- Chatbot response time < 3 seconds
- 99% uptime
- Mobile responsiveness score > 90

#### Business Metrics

- User registration conversion > 20%
- Property setup completion > 80%
- Chatbot inquiry capture > 60%
- Monthly user retention > 70%

### 8. Security Considerations

- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF tokens
- Rate limiting on API endpoints
- Secure file uploads with type validation
- Environment variables for sensitive data
- Regular security updates

### 9. Testing Strategy

- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Chatbot conversation testing
- Mobile device testing
- Performance testing under load

---

## Next Steps

1. **Domain & Branding**: Secure domain name and create brand identity
2. **Development Environment**: Set up AWS accounts, databases, and CI/CD
3. **MVP Development**: Follow the 12-week implementation plan
4. **Beta Testing**: Recruit 5-10 property owners for testing
5. **Launch Preparation**: Marketing website, pricing strategy, support documentation

---

_This specification serves as the foundation for building Landra. Regular updates and iterations based on user feedback will be essential for success._
