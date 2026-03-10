# IoT Display Todo List

A work-in-progress project that syncs a todo list from a web app to a physical IoT e-ink display device using AWS as the backbone.

## What This Is

The idea is simple: you manage your todo list from a website, and a physical ESP32-based e-ink display on your desk automatically updates to show your tasks in real time — no manual refresh, no polling, no IP addresses to manage.

---

## Architecture Components

### 1. Frontend
A web app where users can create/manage todo lists and link their physical display device by entering a setup code shown on the screen.

### 2. Backend — AWS Lambda + API Gateway
- Single Lambda function (Node.js, ARM/Graviton2) handling all routes
- Organized by table: `lists.mjs`, `tasks.mjs`, `users.mjs`, `devices.mjs`
- API Gateway (HTTP API) routes requests to the Lambda
- On data changes, Lambda also publishes an MQTT message to the device's topic

### 3. Database — MariaDB (RDS, us-east-2)
See schema below.

### 4. IoT Layer — AWS IoT Core
- Fleet Provisioning with claim certificates
- Every device ships with the same bootstrap cert
- On first boot, AWS assigns a unique permanent identity to the device
- Device subscribes to its own MQTT topic and displays whatever is published to it

### 5. IoT Device — ESP32 + e-ink Display
- On first boot: registers with AWS, receives permanent cert, displays setup code
- On every boot after: connects with permanent cert, subscribes to topic, displays tasks
- Built with PlatformIO + Arduino framework

## Device Provisioning Flow

```
First Boot (Register):
  Device ──► AWS IoT Core (with shared claim cert)
          ◄── unique permanent cert + device_id
  Device saves cert to flash memory
  Device displays setup code on e-ink screen
  User types setup code into website → links device to account

Every Boot After (Login):
  Device ──► AWS IoT Core (with permanent cert)
  AWS recognizes device → subscribes to topic
  Backend publishes tasks → device displays them
```

---

## AWS Services Used

| Service | Purpose |
|---|---|
| API Gateway (HTTP) | Routes HTTP requests to Lambda |
| Lambda (Node.js, ARM) | Backend logic + DB reads/writes |
| RDS MariaDB | Relational database |
| AWS IoT Core | MQTT broker + device management |
| IoT Fleet Provisioning | Automatic device registration |

---

## Build Order

**MVP (current sprint)**
- [x] Database schema designed
- [x] RDS tables created (Users, Devices, Lists, Tasks)
- [x] IoT Fleet Provisioning template configured
- [ ] Lambda CRUD for tasks by device_id
- [ ] API Gateway routes
- [ ] Frontend — enter code + manage tasks
- [ ] IoT Rule + MQTT publish on task change
- [ ] ESP32 firmware — provisioning + display

**Phase 2 (post-MVP)**
- [ ] User accounts + login
- [ ] Multiple lists per user
- [ ] Device linking to user account
- [ ] Frontend expanded with full account management