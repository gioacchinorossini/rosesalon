# Veterinary Systems ER Diagrams

This document contains visual Entity-Relationship Diagrams (ERDs) and schema mappings for three distinct veterinary clinic platforms. The diagrams are generated using Mermaid.js syntax for clear rendering and structural analysis.

---

## 1. Integrated Veterinary Clinic Management and Patient Care System (IVCMPS)

The **IVCMPS** is structured around clinical workflows, patient care histories, medical records, billing, and inventory tracking.

### Mermaid ERD
```mermaid
erDiagram
    PET_OWNER ||--o{ PET : "owns"
    PET ||--o{ MEDICAL_RECORD : "has"
    PET ||--o{ APPOINTMENT : "schedules"
    MEDICAL_RECORD ||--|| BILLING : "generates"
    BILLING ||--o{ INVENTORY : "charges_for (logical)"

    PET_OWNER {
        int owner_id PK
        string name
        string contact_no
        string email
        string address
    }

    PET {
        int pet_id PK
        int owner_id FK
        string name
        string species
        string breed
        string sex
        date birthdate
    }

    MEDICAL_RECORD {
        int record_id PK
        int pet_id FK
        string diagnosis
        string prescription
        string allergy
        string treatment
        string lab_result
        string xray_image
    }

    APPOINTMENT {
        int appointment_id PK
        int pet_id FK
        date appointment_date
        time appointment_time
        int queue_no
        string status
    }

    BILLING {
        int bill_id PK
        int record_id FK
        decimal total_amount
        string payment_status
    }

    INVENTORY {
        int item_id PK
        string medicine_name
        int quantity
        decimal unit_price
        date expiry_date
    }
```

### Relationship Details & Cardinality
*   **PET_OWNER (1) ── owns ── (Many) PET**: An owner can register and own multiple pets. A pet belongs to exactly one owner.
*   **PET (1) ── has ── (Many) MEDICAL_RECORD**: Over time, a pet can accumulate multiple medical visit records.
*   **PET (1) ── schedules ── (Many) APPOINTMENT**: A pet can have multiple appointments scheduled over its lifecycle.
*   **MEDICAL_RECORD (1) ── generates ── (1) BILLING**: Each medical visit record generates exactly one billing transaction.
*   **BILLING (Many) ── charges_for ── (Many) INVENTORY (Logical)**:
    > [!TIP]
    > **Normalization Suggestion:** To link billing with inventory properly, introduce a junction/bridge table:
    > **BILL_ITEM** (`bill_item_id` [PK], `bill_id` [FK], `item_id` [FK], `quantity_billed`, `price_at_sale`). This avoids a direct un-normalized link.

---

## 2. VetiCare – Smart Clinic Platform for Real-Time Tracking & Telehealth

**VetiCare** is designed for real-time scheduling, patient flow tracking, telehealth sessions, AI image analysis, and post-consultation recovery monitoring.

### Mermaid ERD
```mermaid
erDiagram
    PET_OWNER ||--o{ PET : "owns"
    PET ||--o{ APPOINTMENT : "schedules"
    PET ||--o{ PATIENT_STATUS : "tracks"
    PET ||--o{ TELEHEALTH : "attends"
    PET ||--o{ RECOVERY_MONITOR : "monitors"
    TELEHEALTH ||--o| AI_IMAGE_ANALYSIS : "analyzes"

    PET_OWNER {
        int owner_id PK
        string name
        string contact_no
        string email
    }

    PET {
        int pet_id PK
        int owner_id FK
        string name
        string species
        string breed
        int age
    }

    APPOINTMENT {
        int appointment_id PK
        int pet_id FK
        date date
        time time
        string status
    }

    PATIENT_STATUS {
        int status_id PK
        int pet_id FK
        string current_stage
        datetime updated_at
    }

    TELEHEALTH {
        int telehealth_id PK
        int pet_id FK
        date date
        string video_link
        string notes
    }

    AI_IMAGE_ANALYSIS {
        int analysis_id PK
        int telehealth_id FK
        string uploaded_image
        string ai_result
        float confidence
        string recommendation
    }

    RECOVERY_MONITOR {
        int monitor_id PK
        int pet_id FK
        date followup_date
        string questionnaire
        string owner_response
        string risk_level
        boolean vet_alert
    }
```

### Relationship Details & Cardinality
*   **PET_OWNER (1) ── owns ── (Many) PET**: Standard ownership link.
*   **PET (1) ── tracks ── (Many) PATIENT_STATUS**: Tracks real-time clinical stages (e.g., Checked-In, In-Triage, With Doctor, Discharged).
*   **PET (1) ── attends ── (Many) TELEHEALTH**: Telehealth sessions associated with a specific pet.
*   **TELEHEALTH (1) ── analyzes ── (0 or 1) AI_IMAGE_ANALYSIS**: A telehealth session may optionally have a pet image uploaded and processed by the AI system.
*   **PET (1) ── monitors ── (Many) RECOVERY_MONITOR**: Recovery monitoring forms assigned to track follow-up progress.
    > [!NOTE]
    > **Workflow Note:** While the recovery monitoring logic is triggered by AI recommendations, the record is directly associated with the `PET` via `pet_id` to maintain patient history.

---

## 3. VetStream – Centralized Veterinary Operations & Client Engagement

**VetStream** focuses on clinic operations, staff shift schedules, automated patient assignments, and customer feedback loops with satisfaction analytics.

### Mermaid ERD
```mermaid
erDiagram
    STAFF ||--o{ PATIENT_ASSIGNMENT : "handles"
    PET ||--o{ PATIENT_ASSIGNMENT : "gets_assigned"
    PET_OWNER ||--o{ PET : "owns"
    PET_OWNER ||--o{ FEEDBACK : "submits"
    PET ||--o{ REMINDER : "receives"
    FEEDBACK ||--|| SERVICE_ANALYTICS : "generates"

    STAFF {
        int staff_id PK
        string name
        string position
        string specialization
        string shift
    }

    PATIENT_ASSIGNMENT {
        int assignment_id PK
        int staff_id FK
        int pet_id FK
        date date
        string status
    }

    PET_OWNER {
        int owner_id PK
        string name
        string contact_no
        string email
    }

    PET {
        int pet_id PK
        int owner_id FK
        string name
        string species
        string breed
    }

    REMINDER {
        int reminder_id PK
        int pet_id FK
        string type
        date date
        string status
    }

    FEEDBACK {
        int feedback_id PK
        int owner_id FK
        int rating
        string comments
        string sentiment
    }

    SERVICE_ANALYTICS {
        int analytics_id PK
        int feedback_id FK
        float overall_score
        int waiting_time
        int staff_rating
        int cleanliness_score
    }
```

### Relationship Details & Cardinality
*   **STAFF (1) ── handles ── (Many) PATIENT_ASSIGNMENT**: A staff member can be assigned to multiple patient care tasks.
*   **PET (1) ── gets_assigned ── (Many) PATIENT_ASSIGNMENT**: A pet can be assigned to staff members for care.
    *   *Note:* `PATIENT_ASSIGNMENT` serves as a many-to-many bridge table between `STAFF` and `PET`.
*   **PET_OWNER (1) ── owns ── (Many) PET**: Ownership relationship mapping.
*   **PET_OWNER (1) ── submits ── (Many) FEEDBACK**: Feedback is linked directly to the owner submitting it (`owner_id` is foreign key in `FEEDBACK`).
*   **PET (1) ── receives ── (Many) REMINDER**: Reminders (e.g., vaccine boosters, check-ups) target a specific pet.
*   **FEEDBACK (1) ── generates ── (1) SERVICE_ANALYTICS**: Customer feedback feeds into operations analytics for reporting.
