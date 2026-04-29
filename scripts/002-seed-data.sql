-- Seed Data for Dental Clinic Management System

-- Insert default users (passwords are bcrypt hashed: admin123 and staff123)
-- admin123 hash: $2a$10$rQnM1v1k5I5Z5Y5Z5Y5Z5uQnM1v1k5I5Z5Y5Z5Y5Z5uQnM1v1k5I5
-- staff123 hash: $2a$10$rQnM1v1k5I5Z5Y5Z5Y5Z5uQnM1v1k5I5Z5Y5Z5Y5Z5uQnM1v1k5I5

INSERT INTO users (email, password_hash, name, role) VALUES
('admin@dentalclinic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.hfJ3GqN.lmZXZq0Ue6', 'Dr. Maria Santos', 'admin'),
('staff@dentalclinic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.hfJ3GqN.lmZXZq0Ue6', 'Juan Dela Cruz', 'staff')
ON CONFLICT (email) DO NOTHING;

-- Insert staff members
INSERT INTO staff (user_id, first_name, last_name, email, phone, specialization, position, hire_date, is_active) VALUES
(1, 'Maria', 'Santos', 'admin@dentalclinic.com', '09171234567', 'General Dentistry', 'Head Dentist', '2020-01-15', true),
(2, 'Juan', 'Dela Cruz', 'staff@dentalclinic.com', '09179876543', NULL, 'Dental Assistant', '2021-03-01', true)
ON CONFLICT DO NOTHING;

-- Insert treatments catalog
INSERT INTO treatments (name, description, category, duration_minutes, price, is_active) VALUES
('Dental Cleaning', 'Professional teeth cleaning and polishing', 'Preventive', 45, 1500.00, true),
('Tooth Extraction (Simple)', 'Simple tooth extraction procedure', 'Oral Surgery', 30, 2000.00, true),
('Tooth Extraction (Surgical)', 'Surgical tooth extraction for impacted teeth', 'Oral Surgery', 60, 5000.00, true),
('Dental Filling (Composite)', 'Tooth-colored composite resin filling', 'Restorative', 45, 2500.00, true),
('Dental Filling (Amalgam)', 'Silver amalgam filling', 'Restorative', 30, 1500.00, true),
('Root Canal Treatment', 'Endodontic treatment to save infected tooth', 'Endodontics', 90, 8000.00, true),
('Dental Crown (Porcelain)', 'Porcelain crown restoration', 'Restorative', 60, 15000.00, true),
('Dental Crown (Metal)', 'Metal crown restoration', 'Restorative', 60, 10000.00, true),
('Teeth Whitening', 'Professional teeth whitening treatment', 'Cosmetic', 60, 5000.00, true),
('Dental X-Ray (Periapical)', 'Single tooth X-ray', 'Diagnostic', 15, 500.00, true),
('Dental X-Ray (Panoramic)', 'Full mouth panoramic X-ray', 'Diagnostic', 20, 1500.00, true),
('Dental Consultation', 'Initial consultation and examination', 'Diagnostic', 30, 500.00, true),
('Dental Braces (Metal)', 'Traditional metal braces installation', 'Orthodontics', 120, 50000.00, true),
('Dental Braces (Ceramic)', 'Ceramic braces installation', 'Orthodontics', 120, 70000.00, true),
('Dental Implant', 'Single tooth implant', 'Oral Surgery', 120, 80000.00, true),
('Dentures (Complete)', 'Full dentures set', 'Prosthodontics', 90, 25000.00, true),
('Dentures (Partial)', 'Partial dentures', 'Prosthodontics', 60, 15000.00, true),
('Gum Treatment', 'Periodontal treatment for gum disease', 'Periodontics', 60, 3000.00, true),
('Fluoride Treatment', 'Fluoride application for cavity prevention', 'Preventive', 15, 800.00, true),
('Dental Sealant', 'Protective sealant for molars', 'Preventive', 20, 1000.00, true)
ON CONFLICT DO NOTHING;

-- Insert sample patients
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, emergency_phone, medical_history, allergies) VALUES
('Jose', 'Rizal', 'jose.rizal@email.com', '09171111111', '1985-06-19', 'Male', '123 Noli St., Manila', 'Maria Rizal', '09172222222', 'No significant medical history', 'None'),
('Andres', 'Bonifacio', 'andres.bonifacio@email.com', '09173333333', '1978-11-30', 'Male', '456 Katipunan Ave., Quezon City', 'Gregoria Bonifacio', '09174444444', 'Hypertension - controlled with medication', 'Penicillin'),
('Gabriela', 'Silang', 'gabriela.silang@email.com', '09175555555', '1990-03-19', 'Female', '789 Revolution Rd., Ilocos Sur', 'Diego Silang', '09176666666', 'Diabetes Type 2', 'Latex'),
('Apolinario', 'Mabini', 'apolinario.mabini@email.com', '09177777777', '1970-07-23', 'Male', '321 Sublime St., Batangas', 'Dionisia Mabini', '09178888888', 'Polio survivor, wheelchair user', 'None'),
('Melchora', 'Aquino', 'melchora.aquino@email.com', '09179999999', '1965-01-06', 'Female', '654 Tandang Sora Ave., Quezon City', 'Juan Aquino', '09170000000', 'Arthritis', 'Aspirin'),
('Emilio', 'Aguinaldo', 'emilio.aguinaldo@email.com', '09181111111', '1982-03-22', 'Male', '987 Independence Blvd., Cavite', 'Hilaria Aguinaldo', '09182222222', 'No significant medical history', 'None'),
('Teresa', 'Magbanua', 'teresa.magbanua@email.com', '09183333333', '1995-10-13', 'Female', '147 Visayas St., Iloilo', 'Pedro Magbanua', '09184444444', 'Asthma - mild', 'Sulfa drugs'),
('Lapu', 'Lapu', 'lapu.lapu@email.com', '09185555555', '1988-04-27', 'Male', '258 Mactan Island, Cebu', 'Datu Lapu', '09186666666', 'No significant medical history', 'None')
ON CONFLICT DO NOTHING;

-- Insert sample appointments for today and upcoming days
INSERT INTO appointments (patient_id, staff_id, treatment_id, appointment_date, start_time, end_time, status, notes) VALUES
(1, 1, 1, CURRENT_DATE, '09:00', '09:45', 'confirmed', 'Regular cleaning appointment'),
(2, 1, 4, CURRENT_DATE, '10:00', '10:45', 'scheduled', 'Filling on lower right molar'),
(3, 1, 6, CURRENT_DATE, '11:00', '12:30', 'in-progress', 'Root canal treatment - second session'),
(4, 1, 12, CURRENT_DATE, '14:00', '14:30', 'scheduled', 'Follow-up consultation'),
(5, 1, 2, CURRENT_DATE + 1, '09:00', '09:30', 'confirmed', 'Extraction of wisdom tooth'),
(6, 1, 9, CURRENT_DATE + 1, '10:00', '11:00', 'scheduled', 'Teeth whitening session'),
(7, 1, 1, CURRENT_DATE + 2, '09:00', '09:45', 'scheduled', 'First dental visit - cleaning'),
(8, 1, 11, CURRENT_DATE + 2, '10:00', '10:20', 'scheduled', 'Panoramic X-ray for assessment'),
(1, 1, 19, CURRENT_DATE + 7, '09:00', '09:15', 'scheduled', 'Fluoride treatment'),
(2, 1, 7, CURRENT_DATE + 14, '09:00', '10:00', 'scheduled', 'Crown fitting')
ON CONFLICT DO NOTHING;

-- Insert sample invoices
INSERT INTO invoices (patient_id, invoice_number, invoice_date, due_date, subtotal, tax, discount, total, amount_paid, status, notes) VALUES
(1, 'INV-2024-0001', CURRENT_DATE - 30, CURRENT_DATE - 15, 1500.00, 180.00, 0, 1680.00, 1680.00, 'paid', 'Dental cleaning'),
(2, 'INV-2024-0002', CURRENT_DATE - 14, CURRENT_DATE, 8000.00, 960.00, 500.00, 8460.00, 4000.00, 'partial', 'Root canal treatment - partial payment'),
(3, 'INV-2024-0003', CURRENT_DATE - 7, CURRENT_DATE + 7, 2500.00, 300.00, 0, 2800.00, 0, 'pending', 'Dental filling'),
(4, 'INV-2024-0004', CURRENT_DATE, CURRENT_DATE + 14, 500.00, 60.00, 0, 560.00, 0, 'pending', 'Consultation fee'),
(5, 'INV-2024-0005', CURRENT_DATE - 45, CURRENT_DATE - 30, 5000.00, 600.00, 0, 5600.00, 0, 'overdue', 'Teeth whitening - unpaid')
ON CONFLICT DO NOTHING;

-- Insert invoice items
INSERT INTO invoice_items (invoice_id, treatment_id, description, quantity, unit_price, total) VALUES
(1, 1, 'Dental Cleaning', 1, 1500.00, 1500.00),
(2, 6, 'Root Canal Treatment', 1, 8000.00, 8000.00),
(3, 4, 'Dental Filling (Composite)', 1, 2500.00, 2500.00),
(4, 12, 'Dental Consultation', 1, 500.00, 500.00),
(5, 9, 'Teeth Whitening', 1, 5000.00, 5000.00)
ON CONFLICT DO NOTHING;

-- Insert sample medical records
INSERT INTO medical_records (patient_id, staff_id, appointment_id, record_date, chief_complaint, diagnosis, treatment_plan, clinical_notes) VALUES
(1, 1, 1, CURRENT_DATE - 30, 'Routine checkup', 'Healthy teeth with minor plaque buildup', 'Regular cleaning every 6 months', 'Patient in good oral health. Advised to continue regular brushing and flossing.'),
(2, 1, NULL, CURRENT_DATE - 14, 'Severe tooth pain on lower right', 'Pulpitis on tooth #30', 'Root canal treatment required', 'X-ray shows infection has reached the pulp. Started root canal treatment.'),
(3, 1, NULL, CURRENT_DATE - 7, 'Cavity on upper left molar', 'Dental caries on tooth #14', 'Composite filling', 'Moderate cavity filled with composite resin. Patient advised on diet changes.')
ON CONFLICT DO NOTHING;
