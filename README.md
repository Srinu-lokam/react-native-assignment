# EcoPickup React Native Assignment

This repository contains the completed assignment for the **EcoPickup Platform**, built using **React Native**. It consists of two fully functional apps:

* **CustomerApp** – Users can log in, schedule scrap pickups, and track order history.
* **PartnerApp** – Eco-warrior partners can log in, view assigned pickups, and complete the full pickup workflow.

---

## 📁 Folder Structure

```
App/
├── CustomerApp/         # Code for the customer-facing app
├── PartnerApp/          # Code for the partner-facing app
└── README.md            # Project documentation (this file)
```

---

## 🚀 How to Run the Apps

1. **Clone the repository:**

```bash
git clone https://github.com/Srinu-lokam/react-native-assignment.git
cd react-native-assignment
```

2. **Install dependencies (auto-installs all required packages):**

Each app manages its own dependencies via `package.json`.
Open each folder and run:

```bash
cd CustomerApp
npm install
# or
cd ../PartnerApp
npm install
```

> 📦 This installs everything including additional libraries like `react-native-snap-carousel`, `react-native-picker-select`, etc.

3. **Start the app (with Expo):**

```bash
npm start
```

Use Expo Go (mobile) or emulator to view.

---

## 🔐 Authentication

* Both apps use **phone number + OTP** login.
* OTP is mocked (any `123456` works).
* Session is managed via `AsyncStorage`.

---

## 🔄 Pickup Lifecycle

All pickup requests go through 5 stages:

1. **Pending** – After scheduling.
2. **Accepted** – When partner accepts the job.
3. **In-Process** – After entering the correct pickup code.
4. **Pending for Approval** – After adding scrap items and sending to customer.
5. **Completed** – Once the customer approves.

Both apps reflect **real-time status updates** using **MockAPI.io**.

---

## 📦 Mock API

We used **MockAPI.io** to store and sync data.

* Base URL: `https://6868edb5d5933161d70ce3e4.mockapi.io/axios`
* Endpoints used:

  * `/pickups` for all pickup records

---

## 📱 Features

### CustomerApp

* Phone login + OTP
* Schedule a pickup (date, time, address, map link)
* View recent pickups and order history
* Approve orders when in `Pending for Approval` stage

### PartnerApp

* Phone login + OTP
* View assigned pickups
* Full pickup workflow:

  * Accept → Enter Code → Add Items → Submit for Approval → Complete

---



## 🛠️ Tech Stack

* React Native (Expo)
* React Navigation
* Context API
* Axios
* AsyncStorage
* MockAPI.io

---

## ✅ Status

All requirements from the assignment have been completed:

*

---

## 🙋‍♂️ Author

**Srinu Lokam**
GitHub: [@Srinu-lokam](https://github.com/Srinu-lokam)

---

> Feel free to explore the code and test both apps end-to-end!
