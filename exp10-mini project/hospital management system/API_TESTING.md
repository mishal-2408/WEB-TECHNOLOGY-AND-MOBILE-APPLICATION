# Hospital Management System API Testing Guide

This guide helps you test the application endpoints using Postman or cURL.
Make sure the server is running on `http://localhost:5000`.

## 1. Authentication
**Register an Admin**
- Method: `POST` /api/auth/register
- Body (JSON):
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

**Login Admin**
- Method: `POST` /api/auth/login
- Body (JSON):
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
> **Note:** Save the `token` received from the login response. You must use it as a Bearer Token in the `Authorization` header (`Authorization: Bearer <token>`) for all following requests.

## 2. Patients
**Add Patient**
- Method: `POST` /api/patients
- Auth: Bearer Token
- Body (JSON):
  ```json
  {
    "name": "John Doe",
    "age": 45,
    "gender": "Male",
    "disease": "Diabetes",
    "contact": "1234567890"
  }
  ```

**Get All Patients**
- Method: `GET` /api/patients
- Auth: Bearer Token

## 3. Doctors
**Add Doctor**
- Method: `POST` /api/doctors
- Auth: Bearer Token
- Body (JSON):
  ```json
  {
    "name": "Dr. Smith",
    "specialization": "Cardiologist",
    "availability": ["09:00 AM", "10:00 AM", "11:00 AM"]
  }
  ```

**Get All Doctors**
- Method: `GET` /api/doctors
- Auth: Bearer Token

## 4. Appointments
**Book Appointment**
- Method: `POST` /api/appointments
- Auth: Bearer Token
- Body (JSON):
  ```json
  {
    "patient": "<PatientID_from_above>",
    "doctor": "<DoctorID_from_above>",
    "date": "2024-05-10",
    "timeSlot": "09:00 AM"
  }
  ```
> Try booking exactly the same request twice to test the double-booking prevention feature.

**Get Appointments**
- Method: `GET` /api/appointments
- Auth: Bearer Token

## 5. Medical Records Upload
**Upload Record**
- Method: `POST` /api/records
- Auth: Bearer Token
- Body (form-data):
  - `patient`: `<PatientID>` (Text)
  - `description`: `Blood test report` (Text)
  - `file`: `[Select File]` (File - PDF/Image)

**Get Patient's Records**
- Method: `GET` /api/records/:patientId
- Auth: Bearer Token

## 6. Dashboard Analytics
**Get Stats**
- Method: `GET` /api/dashboard
- Auth: Bearer Token
