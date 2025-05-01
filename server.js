const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 5000;
const HOST = `localhost`;
const ENDPOINT = `http://${HOST}:${PORT}`;

const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./appointments.db");

// Initialize DB
db.run(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    date TEXT,
    time TEXT,
    UNIQUE(date, time)
  )
`);

// Generate time slots
function generateSlots() {
  const slots = [];
  const start = 10;
  const end = 17;
  for (let hour = start; hour < end; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === 13) continue; // skip 1:00–2:00 PM
      const h = String(hour).padStart(2, "0");
      const m = String(min).padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// GET available slots
app.get("/api/slots", (req, res) => {
  const date = req.query.date;
  const allSlots = generateSlots();

  db.all(
    "SELECT time FROM appointments WHERE date = ?",
    [date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const booked = new Set(rows.map((r) => r.time));
      const available = allSlots.filter((time) => !booked.has(time));
      res.json({ available_slots: available });
    }
  );
});

// POST book an appointment
app.post("/api/book", (req, res) => {
  const { name, phone, date, time } = req.body;
  const stmt = db.prepare(
    "INSERT INTO appointments (name, phone, date, time) VALUES (?, ?, ?, ?)"
  );

  stmt.run([name, phone, date, time], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res
          .status(400)
          .json({ success: false, message: "Time slot already booked." });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, message: "Appointment booked successfully." });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at ${ENDPOINT}`);
});
