# OCCUPATION_CLUSTERS.md — ATLAS Occupation Taxonomy

This document defines the 51 occupation clusters used in ATLAS, their role/seniority sub-differentiation, primary AI capability exposure, and default BFCS threshold values.

---

## Cluster Structure

Each cluster contains:
- **BLS SOC Codes**: Standard Occupational Classification codes that map to this cluster (for BLS API queries)
- **Roles**: Seniority/role breakdown within the cluster where automation timelines diverge
- **Primary Capabilities**: Which of the 3 AI capability vectors (generative, agentic, embodied) most affect this cluster, with weights summing to 1.0
- **Default BFCS Thresholds**: Per role, the B*, F*, C*, S* values
- **Employment Multiplier**: Second-order multiplier from BEA data
- **Deployment Type**: software | robotics | autonomous_vehicle | hybrid

---

## 1. TECHNOLOGY

### 1.1 Software Engineering
- **SOC**: 15-1252, 15-1253, 15-1254, 15-1256
- **Roles**:
  - Junior/Mid Developer (r=0.7): B*=0.6, F*=0.7, C*=0.5, S*=0.7
  - Senior Developer (r=0.85): B*=0.8, F*=0.8, C*=0.6, S*=0.85
  - Staff/Principal/Architect (r=0.95): B*=0.9, F*=0.85, C*=0.7, S*=0.95
- **Primary Capabilities**: generative (0.50), agentic (0.45), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 4.3x
- **Notes**: Junior devs already approaching BFCS threshold. Senior architects are significantly further out. The "Safer" threshold for architects reflects that critical system design errors are extremely costly.

### 1.2 Data / ML Engineering
- **SOC**: 15-2051, 15-2098
- **Roles**:
  - Junior Data Analyst (r=0.6): B*=0.5, F*=0.6, C*=0.4, S*=0.5
  - ML Engineer (r=0.8): B*=0.75, F*=0.75, C*=0.6, S*=0.8
  - Research Scientist (r=0.95): B*=0.9, F*=0.8, C*=0.7, S*=0.9
- **Primary Capabilities**: generative (0.50), agentic (0.45), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 4.0x

### 1.3 IT Support / Sysadmin
- **SOC**: 15-1231, 15-1244, 15-1232
- **Roles**:
  - Tier 1 Support (r=0.5): B*=0.5, F*=0.6, C*=0.4, S*=0.4
  - Sysadmin (r=0.7): B*=0.65, F*=0.7, C*=0.5, S*=0.7
  - DevOps/SRE (r=0.85): B*=0.8, F*=0.8, C*=0.6, S*=0.85
- **Primary Capabilities**: agentic (0.55), generative (0.25), embodied (0.20)
- **Deployment Type**: software
- **Multiplier**: 3.0x

### 1.4 QA / Testing
- **SOC**: 15-1253 (partial)
- **Roles**:
  - Manual QA (r=0.5): B*=0.4, F*=0.5, C*=0.3, S*=0.5
  - Automation QA (r=0.7): B*=0.6, F*=0.65, C*=0.5, S*=0.65
- **Primary Capabilities**: agentic (0.55), generative (0.40), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 3.5x

---

## 2. FINANCE

### 2.1 Trading / Quantitative
- **SOC**: 13-2051, 13-2054
- **Roles**:
  - Execution Trader (r=0.6): B*=0.6, F*=0.8, C*=0.5, S*=0.7
  - Quant Analyst (r=0.85): B*=0.8, F*=0.85, C*=0.6, S*=0.85
  - Portfolio Manager (r=0.95): B*=0.9, F*=0.8, C*=0.7, S*=0.9
- **Primary Capabilities**: agentic (0.55), generative (0.40), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 3.8x

### 2.2 Banking
- **SOC**: 13-2071, 13-2072, 43-3071
- **Roles**:
  - Teller / Service Rep (r=0.4): B*=0.4, F*=0.5, C*=0.3, S*=0.3
  - Junior Analyst (r=0.6): B*=0.55, F*=0.6, C*=0.4, S*=0.5
  - Senior Banker / Relationship Mgr (r=0.85): B*=0.8, F*=0.7, C*=0.6, S*=0.7
- **Primary Capabilities**: agentic (0.65), generative (0.30), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 3.2x

### 2.3 Accounting / Bookkeeping
- **SOC**: 13-2011, 43-3031
- **Roles**:
  - Bookkeeper (r=0.5): B*=0.4, F*=0.5, C*=0.3, S*=0.5
  - Accountant (r=0.7): B*=0.6, F*=0.65, C*=0.5, S*=0.7
  - CPA / Audit Senior (r=0.85): B*=0.8, F*=0.75, C*=0.6, S*=0.85
- **Primary Capabilities**: agentic (0.60), generative (0.35), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 2.5x

### 2.4 Insurance / Underwriting
- **SOC**: 13-2053, 13-2022
- **Roles**:
  - Claims Processor (r=0.5): B*=0.4, F*=0.5, C*=0.3, S*=0.4
  - Underwriter (r=0.75): B*=0.65, F*=0.7, C*=0.5, S*=0.7
- **Primary Capabilities**: agentic (0.65), generative (0.30), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 2.3x

---

## 3. HEALTHCARE

### 3.1 Physicians / Surgeons
- **SOC**: 29-1210 through 29-1249
- **Roles**:
  - Primary Care (r=0.85): B*=0.85, F*=0.7, C*=0.7, S*=0.99
  - Specialist (r=0.9): B*=0.9, F*=0.75, C*=0.75, S*=0.995
  - Surgeon (r=0.95): B*=0.95, F*=0.8, C*=0.8, S*=0.999
- **Primary Capabilities**: embodied (0.50), generative (0.25), agentic (0.25)
- **Deployment Type**: hybrid
- **Multiplier**: 2.1x
- **Notes**: Extremely high Safer thresholds. Physicians will be among the last fully displaced, but AI-assisted diagnostics will erode tasks early.

### 3.2 Nurses
- **SOC**: 29-1141, 29-1151, 29-2061
- **Roles**:
  - LPN (r=0.6): B*=0.6, F*=0.6, C*=0.5, S*=0.95
  - RN (r=0.75): B*=0.7, F*=0.65, C*=0.6, S*=0.97
  - Nurse Practitioner (r=0.85): B*=0.8, F*=0.7, C*=0.7, S*=0.98
- **Primary Capabilities**: embodied (0.70), agentic (0.20), generative (0.10)
- **Deployment Type**: hybrid
- **Multiplier**: 2.0x

### 3.3 Technicians / Diagnostics
- **SOC**: 29-2010 through 29-2099
- **Roles**:
  - Lab Technician (r=0.6): B*=0.5, F*=0.6, C*=0.4, S*=0.85
  - Radiologic/Imaging (r=0.7): B*=0.6, F*=0.7, C*=0.5, S*=0.9
- **Primary Capabilities**: embodied (0.65), agentic (0.20), generative (0.15)
- **Deployment Type**: hybrid
- **Multiplier**: 1.8x

### 3.4 Home Health / Aides
- **SOC**: 31-1120, 31-1131, 39-9021
- **Roles**:
  - Home Health Aide (r=0.4): B*=0.4, F*=0.4, C*=0.3, S*=0.95
  - Personal Care Aide (r=0.35): B*=0.35, F*=0.35, C*=0.25, S*=0.995
- **Primary Capabilities**: embodied (0.80), agentic (0.15), generative (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 1.5x
- **Notes**: Elder care has extremely high Safer threshold. Physical presence and emotional component resist automation.

### 3.5 Healthcare Administration
- **SOC**: 11-9111, 43-6013, 29-2071
- **Roles**:
  - Medical Coder/Biller (r=0.5): B*=0.4, F*=0.5, C*=0.3, S*=0.5
  - Admin Staff (r=0.5): B*=0.4, F*=0.5, C*=0.3, S*=0.4
  - Hospital Administrator (r=0.75): B*=0.6, F*=0.6, C*=0.5, S*=0.6
- **Primary Capabilities**: agentic (0.60), generative (0.35), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 1.5x
- **Notes**: HIGH DISPLACEMENT TARGET. Administrative bloat in healthcare is a policy priority for cost reduction.

---

## 4. EDUCATION

### 4.1 Teachers / Professors
- **SOC**: 25-1000 through 25-3099
- **Roles**:
  - K-12 Teacher (r=0.7): B*=0.9, F*=0.8, C*=0.8, S*=0.95
  - College Professor (r=0.85): B*=0.9, F*=0.8, C*=0.7, S*=0.9
- **Primary Capabilities**: generative (0.45), agentic (0.40), embodied (0.15)
- **Deployment Type**: software (but PROTECTED)
- **Multiplier**: 1.8x
- **Notes**: PROTECTED BY POLICY. AI tutors augment but don't replace teachers. `productivity_to_headcount_ratio = 0.1`. Each student gets AI tutor + human teacher oversight.

### 4.2 Education Administration
- **SOC**: 11-9032, 11-9033, 11-9039
- **Roles**:
  - School Admin Staff (r=0.5): B*=0.4, F*=0.5, C*=0.3, S*=0.4
  - District/University Admin (r=0.7): B*=0.5, F*=0.55, C*=0.4, S*=0.5
- **Primary Capabilities**: agentic (0.65), generative (0.30), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 1.3x
- **Notes**: HIGH DISPLACEMENT TARGET. Policy assumption: administrators are bloat and will be removed in AI era to drive down education costs. `productivity_to_headcount_ratio = 1.0`.

### 4.3 Education Support
- **SOC**: 25-9000, 25-4000
- **Roles**:
  - Teaching Assistants (r=0.4): B*=0.5, F*=0.5, C*=0.4, S*=0.7
  - Librarians/Media (r=0.6): B*=0.5, F*=0.6, C*=0.4, S*=0.5
- **Primary Capabilities**: agentic (0.40), generative (0.35), embodied (0.25)
- **Deployment Type**: software
- **Multiplier**: 1.3x

---

## 5. LEGAL

### 5.1 Attorneys
- **SOC**: 23-1011, 23-1021, 23-1022
- **Roles**:
  - Junior Associate (r=0.65): B*=0.6, F*=0.65, C*=0.5, S*=0.7
  - Senior Attorney (r=0.85): B*=0.8, F*=0.75, C*=0.65, S*=0.85
  - Partner/Litigator (r=0.95): B*=0.9, F*=0.8, C*=0.75, S*=0.9
- **Primary Capabilities**: generative (0.50), agentic (0.45), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 3.0x

### 5.2 Paralegals / Legal Assistants
- **SOC**: 23-2011, 23-2099
- **Roles**:
  - Legal Secretary (r=0.4): B*=0.4, F*=0.5, C*=0.3, S*=0.4
  - Paralegal (r=0.6): B*=0.5, F*=0.6, C*=0.4, S*=0.6
- **Primary Capabilities**: agentic (0.50), generative (0.45), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 2.5x

---

## 6. TRANSPORTATION

### 6.1 Trucking / Long-Haul
- **SOC**: 53-3032
- **Roles**:
  - Long-Haul Driver (r=0.5): B*=0.7, F*=0.7, C*=0.6, S*=0.99
  - Local/Short-Haul (r=0.5): B*=0.6, F*=0.6, C*=0.5, S*=0.97
- **Primary Capabilities**: embodied (0.85), agentic (0.10), generative (0.05)
- **Deployment Type**: autonomous_vehicle
- **Multiplier**: 3.4x (ATA estimate)
- **Notes**: Tesla Semi anchors deployment timeline. Fleet conversion takes 10-15 years even after full capability.

### 6.2 Local Delivery
- **SOC**: 53-3031, 43-5021
- **Roles**:
  - Delivery Driver (r=0.4): B*=0.5, F*=0.6, C*=0.4, S*=0.95
  - Courier/Last-Mile (r=0.35): B*=0.45, F*=0.5, C*=0.35, S*=0.9
- **Primary Capabilities**: embodied (0.85), agentic (0.10), generative (0.05)
- **Deployment Type**: autonomous_vehicle + robotics hybrid
- **Multiplier**: 2.0x

### 6.3 Taxi / Rideshare
- **SOC**: 53-3041, 53-3054
- **Roles**:
  - Taxi/Rideshare Driver (r=0.4): B*=0.5, F*=0.6, C*=0.4, S*=0.97
- **Primary Capabilities**: embodied (0.85), agentic (0.10), generative (0.05)
- **Deployment Type**: autonomous_vehicle
- **Multiplier**: 2.2x
- **Notes**: Tesla Cybercab is the anchor. Regulatory approval is the primary lag factor.

### 6.4 Warehousing / Logistics
- **SOC**: 53-7062, 53-7064, 43-5071
- **Roles**:
  - Warehouse Worker (r=0.4): B*=0.4, F*=0.5, C*=0.3, S*=0.5
  - Forklift/Equipment Operator (r=0.5): B*=0.5, F*=0.6, C*=0.4, S*=0.7
  - Logistics Coordinator (r=0.7): B*=0.6, F*=0.7, C*=0.5, S*=0.6
- **Primary Capabilities**: embodied (0.80), agentic (0.15), generative (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 2.5x

---

## 7. MANUFACTURING

### 7.1 Assembly / Production
- **SOC**: 51-2000 through 51-2099
- **Roles**:
  - Line Worker (r=0.4): B*=0.4, F*=0.5, C*=0.3, S*=0.6
  - Skilled Assembler (r=0.6): B*=0.55, F*=0.6, C*=0.45, S*=0.7
- **Primary Capabilities**: embodied (0.85), agentic (0.10), generative (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 1.6x (Moretti 2010)

### 7.2 Skilled Machinists
- **SOC**: 51-4041, 51-4011, 51-4111
- **Roles**:
  - CNC Operator (r=0.6): B*=0.5, F*=0.6, C*=0.4, S*=0.75
  - Master Machinist (r=0.85): B*=0.8, F*=0.75, C*=0.6, S*=0.9
- **Primary Capabilities**: embodied (0.85), agentic (0.10), generative (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 1.8x

### 7.3 Quality Control
- **SOC**: 51-9061
- **Roles**:
  - Inspector (r=0.6): B*=0.5, F*=0.7, C*=0.4, S*=0.8
- **Primary Capabilities**: embodied (0.55), agentic (0.25), generative (0.20)
- **Deployment Type**: hybrid
- **Multiplier**: 1.5x

---

## 8. CONSTRUCTION / TRADES

### 8.1 Electricians
- **SOC**: 47-2111
- **Roles**:
  - Apprentice (r=0.5): B*=0.5, F*=0.5, C*=0.4, S*=0.9
  - Journeyman (r=0.75): B*=0.7, F*=0.65, C*=0.55, S*=0.95
  - Master Electrician (r=0.9): B*=0.85, F*=0.75, C*=0.65, S*=0.98
- **Primary Capabilities**: embodied (0.85), agentic (0.10), generative (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 2.4x
- **Notes**: High complexity trade — requires navigating unique building layouts, reading schematics, making judgment calls. Among the LAST trades automated.

### 8.2 Plumbers
- **SOC**: 47-2152
- **Roles**:
  - Apprentice (r=0.5): B*=0.5, F*=0.5, C*=0.4, S*=0.85
  - Journeyman (r=0.75): B*=0.7, F*=0.65, C*=0.55, S*=0.9
- **Primary Capabilities**: embodied (0.85), agentic (0.10), generative (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 2.2x

### 8.3 General Construction
- **SOC**: 47-2061, 47-2031, 47-2051
- **Roles**:
  - Laborer (r=0.35): B*=0.35, F*=0.4, C*=0.25, S*=0.6
  - Carpenter (r=0.6): B*=0.55, F*=0.55, C*=0.4, S*=0.75
  - Heavy Equipment Operator (r=0.6): B*=0.5, F*=0.6, C*=0.4, S*=0.8
- **Primary Capabilities**: agentic (0.45), embodied (0.35), generative (0.20)
- **Deployment Type**: robotics
- **Multiplier**: 2.4x

### 8.4 HVAC
- **SOC**: 49-9021
- **Roles**:
  - Technician (r=0.6): B*=0.55, F*=0.55, C*=0.45, S*=0.85
  - Senior Technician (r=0.75): B*=0.7, F*=0.65, C*=0.55, S*=0.9
- **Primary Capabilities**: embodied (0.85), agentic (0.10), generative (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 2.0x

---

## 9. RETAIL

### 9.1 Cashiers / Floor
- **SOC**: 41-2011, 41-2031
- **Roles**:
  - Cashier (r=0.3): B*=0.3, F*=0.4, C*=0.2, S*=0.3
  - Sales Associate (r=0.4): B*=0.4, F*=0.5, C*=0.3, S*=0.4
- **Primary Capabilities**: embodied (0.60), agentic (0.30), generative (0.10)
- **Deployment Type**: hybrid
- **Multiplier**: 1.2x

### 9.2 Retail Management
- **SOC**: 41-1011, 41-1012
- **Roles**:
  - Store Manager (r=0.65): B*=0.6, F*=0.6, C*=0.5, S*=0.6
  - District Manager (r=0.8): B*=0.75, F*=0.7, C*=0.6, S*=0.7
- **Primary Capabilities**: agentic (0.60), generative (0.25), embodied (0.15)
- **Deployment Type**: software
- **Multiplier**: 1.5x

### 9.3 E-commerce / Fulfillment
- **SOC**: 43-5011, 53-7065
- **Roles**:
  - Fulfillment Worker (r=0.35): B*=0.35, F*=0.45, C*=0.25, S*=0.5
  - E-commerce Coordinator (r=0.6): B*=0.5, F*=0.6, C*=0.4, S*=0.5
- **Primary Capabilities**: agentic (0.55), generative (0.40), embodied (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 1.8x

---

## 10. FOOD SERVICE

### 10.1 Fast Food
- **SOC**: 35-3023, 35-2014
- **Roles**:
  - Counter/Drive-Through (r=0.3): B*=0.3, F*=0.4, C*=0.2, S*=0.4
  - Line Cook (r=0.4): B*=0.35, F*=0.45, C*=0.25, S*=0.5
- **Primary Capabilities**: embodied (0.80), agentic (0.15), generative (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 1.3x

### 10.2 Sit-Down Restaurant
- **SOC**: 35-1012, 35-3031, 35-2014
- **Roles**:
  - Server (r=0.4): B*=0.4, F*=0.4, C*=0.3, S*=0.5
  - Chef (r=0.7): B*=0.6, F*=0.5, C*=0.5, S*=0.6
  - Head Chef (r=0.85): B*=0.8, F*=0.6, C*=0.6, S*=0.7
- **Primary Capabilities**: embodied (0.80), agentic (0.15), generative (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 1.4x

### 10.3 Food Prep / Industrial
- **SOC**: 35-2021, 51-3091, 51-3092
- **Roles**:
  - Food Processing Worker (r=0.35): B*=0.3, F*=0.4, C*=0.2, S*=0.5
- **Primary Capabilities**: embodied (0.80), agentic (0.15), generative (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 1.5x

---

## 11. CREATIVE

### 11.1 Design / Visual
- **SOC**: 27-1024, 27-1025, 27-1014
- **Roles**:
  - Junior Designer (r=0.5): B*=0.4, F*=0.5, C*=0.3, S*=0.3
  - Senior Designer (r=0.8): B*=0.7, F*=0.7, C*=0.6, S*=0.5
  - Art Director (r=0.9): B*=0.85, F*=0.75, C*=0.7, S*=0.6
- **Primary Capabilities**: generative (0.75), agentic (0.20), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 2.5x
- **Notes**: Low Safer thresholds — bad design isn't catastrophic. Gen AI already near threshold for junior roles.

### 11.2 Writing / Content
- **SOC**: 27-3043, 27-3042, 27-3041
- **Roles**:
  - Content Writer (r=0.5): B*=0.4, F*=0.5, C*=0.3, S*=0.3
  - Journalist (r=0.75): B*=0.65, F*=0.6, C*=0.5, S*=0.6
  - Senior Editor (r=0.85): B*=0.8, F*=0.7, C*=0.6, S*=0.7
- **Primary Capabilities**: generative (0.80), agentic (0.15), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 2.0x

### 11.3 Marketing / Advertising
- **SOC**: 13-1161, 27-3031
- **Roles**:
  - Marketing Coordinator (r=0.5): B*=0.4, F*=0.5, C*=0.3, S*=0.3
  - Marketing Manager (r=0.75): B*=0.65, F*=0.65, C*=0.5, S*=0.5
  - CMO/Director (r=0.9): B*=0.85, F*=0.75, C*=0.7, S*=0.7
- **Primary Capabilities**: generative (0.55), agentic (0.40), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 2.3x

### 11.4 Media Production
- **SOC**: 27-4011, 27-4014, 27-4021, 27-4032
- **Roles**:
  - Production Assistant (r=0.4): B*=0.4, F*=0.5, C*=0.3, S*=0.3
  - Editor/Producer (r=0.75): B*=0.65, F*=0.65, C*=0.5, S*=0.5
- **Primary Capabilities**: generative (0.65), agentic (0.20), embodied (0.15)
- **Deployment Type**: software
- **Multiplier**: 2.0x

---

## 12. PROFESSIONAL SERVICES

### 12.1 Consulting
- **SOC**: 13-1111, 13-1199
- **Roles**:
  - Junior Consultant (r=0.6): B*=0.5, F*=0.6, C*=0.4, S*=0.5
  - Senior Consultant (r=0.8): B*=0.7, F*=0.7, C*=0.6, S*=0.7
  - Partner/Director (r=0.95): B*=0.9, F*=0.8, C*=0.75, S*=0.85
- **Primary Capabilities**: agentic (0.50), generative (0.45), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 3.5x

### 12.2 Human Resources
- **SOC**: 13-1071, 13-1075, 11-3121
- **Roles**:
  - HR Coordinator (r=0.5): B*=0.4, F*=0.5, C*=0.3, S*=0.4
  - HR Manager (r=0.7): B*=0.6, F*=0.6, C*=0.5, S*=0.6
- **Primary Capabilities**: agentic (0.65), generative (0.30), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 1.5x

### 12.3 Real Estate
- **SOC**: 41-9022, 41-9021
- **Roles**:
  - Agent (r=0.5): B*=0.5, F*=0.5, C*=0.4, S*=0.4
  - Broker (r=0.75): B*=0.7, F*=0.65, C*=0.55, S*=0.6
- **Primary Capabilities**: agentic (0.40), embodied (0.40), generative (0.20)
- **Deployment Type**: software
- **Multiplier**: 2.0x

### 12.4 Administrative / Clerical
- **SOC**: 43-6014, 43-9061, 43-4051, 43-1011
- **Roles**:
  - Receptionist (r=0.3): B*=0.3, F*=0.4, C*=0.2, S*=0.3
  - Admin Assistant (r=0.45): B*=0.35, F*=0.45, C*=0.25, S*=0.3
  - Executive Assistant (r=0.65): B*=0.55, F*=0.6, C*=0.45, S*=0.5
- **Primary Capabilities**: agentic (0.65), generative (0.30), embodied (0.05)
- **Deployment Type**: software
- **Multiplier**: 1.3x

---

## 13. GOVERNMENT / PUBLIC SECTOR

### 13.1 Federal Civilian
- **SOC**: Various (cross-cutting)
- **Roles**:
  - Clerical/Admin (r=0.4): B*=0.4, F*=0.5, C*=0.3, S*=0.4
  - Analyst/Professional (r=0.7): B*=0.6, F*=0.65, C*=0.5, S*=0.65
  - Senior/Management (r=0.85): B*=0.8, F*=0.75, C*=0.6, S*=0.8
- **Primary Capabilities**: agentic (0.60), generative (0.30), embodied (0.10)
- **Deployment Type**: software
- **Multiplier**: 1.8x
- **Notes**: Government adoption is SLOW. Add extra `lag` of 3-5 years to adoption S-curve. Union protections further slow displacement.

### 13.2 State / Local Government
- **SOC**: Various (cross-cutting)
- **Roles**:
  - Clerical/Admin (r=0.4): B*=0.4, F*=0.5, C*=0.3, S*=0.4
  - Analyst/Professional (r=0.7): B*=0.6, F*=0.65, C*=0.5, S*=0.65
  - Senior/Management (r=0.85): B*=0.8, F*=0.75, C*=0.6, S*=0.8
- **Primary Capabilities**: agentic (0.55), generative (0.30), embodied (0.15)
- **Deployment Type**: software
- **Multiplier**: 1.8x
- **Notes**: Even slower adoption than federal. Varies significantly by state.

### 13.3 Postal / Delivery Services
- **SOC**: 43-5052, 43-5053
- **Roles**:
  - Mail Carrier (r=0.4): B*=0.4, F*=0.5, C*=0.3, S*=0.8
  - Sorting/Processing (r=0.35): B*=0.3, F*=0.5, C*=0.2, S*=0.5
- **Primary Capabilities**: embodied (0.80), agentic (0.15), generative (0.05)
- **Deployment Type**: hybrid
- **Multiplier**: 1.5x

---

## 14. AGRICULTURE

### 14.1 Farm Labor
- **SOC**: 45-2092, 45-2093
- **Roles**:
  - Farmworker (r=0.35): B*=0.35, F*=0.4, C*=0.25, S*=0.5
  - Skilled Agricultural Worker (r=0.55): B*=0.5, F*=0.55, C*=0.4, S*=0.6
- **Primary Capabilities**: embodied (0.85), agentic (0.10), generative (0.05)
- **Deployment Type**: robotics
- **Multiplier**: 1.8x

### 14.2 Equipment Operation
- **SOC**: 45-2091
- **Roles**:
  - Tractor/Harvester Operator (r=0.5): B*=0.4, F*=0.5, C*=0.35, S*=0.7
- **Primary Capabilities**: embodied (0.80), agentic (0.15), generative (0.05)
- **Deployment Type**: autonomous_vehicle
- **Multiplier**: 1.6x

---

## 15. SCIENTIFIC R&D

### 15.1 Lab Research
- **SOC**: 19-1000 through 19-4099
- **Roles**:
  - Lab Technician (r=0.55): B*=0.5, F*=0.6, C*=0.4, S*=0.7
  - Research Scientist (r=0.85): B*=0.8, F*=0.75, C*=0.65, S*=0.85
  - Principal Investigator (r=0.95): B*=0.9, F*=0.8, C*=0.75, S*=0.9
- **Primary Capabilities**: generative (0.40), agentic (0.30), embodied (0.30)
- **Deployment Type**: hybrid
- **Multiplier**: 3.0x

### 15.2 Engineering / Applied Science
- **SOC**: 17-2000 through 17-2199
- **Roles**:
  - Junior Engineer (r=0.6): B*=0.55, F*=0.6, C*=0.45, S*=0.7
  - Senior Engineer (r=0.85): B*=0.8, F*=0.75, C*=0.6, S*=0.85
  - Principal Engineer (r=0.95): B*=0.9, F*=0.8, C*=0.7, S*=0.95
- **Primary Capabilities**: generative (0.45), agentic (0.45), embodied (0.10)
- **Deployment Type**: software
- **Multiplier**: 2.8x

---

## 16. OTHER

### 16.1 Other / Uncategorized
- **SOC**: (none -- catch-all for workers not mapped to the 50 clusters above)
- **Roles**:
  - General Worker (r=0.5): B*=0.55, F*=0.45, C*=0.40, S*=0.30
  - Specialized Worker (r=0.7): B*=0.55, F*=0.45, C*=0.40, S*=0.30
- **Primary Capabilities**: agentic (0.55), generative (0.30), embodied (0.15)
- **Deployment Type**: software
- **Multiplier**: 1.0x
- **Notes**: Catch-all for ~84M workers in occupations not covered by OEWS SOC-level data. Includes self-employed, informal, government (non-federal/state coded), and other hard-to-categorize roles. Employment is computed dynamically as CES total nonfarm minus sum of all OEWS-derived cluster employment.
