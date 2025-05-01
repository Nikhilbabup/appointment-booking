(function () {
  const scriptTag = document.currentScript;
  const container = document.createElement("div");
  container.innerHTML = `
      <div class="appt-widget">
        <h3>Book an Appointment</h3>
        <input type="text" id="name" placeholder="Your Name" />
        <input type="tel" id="phone" placeholder="Phone Number" />
        <input type="date" id="date" />
        <select id="slots"><option>Select a date</option></select>
        <button id="bookBtn">Book</button>
        <p id="status"></p>
      </div>
    `;
  scriptTag.parentNode.insertBefore(container, scriptTag);

  const apiUrl = "http://localhost:3000/api";

  const nameInput = container.querySelector("#name");
  const phoneInput = container.querySelector("#phone");
  const dateInput = container.querySelector("#date");
  const slotsSelect = container.querySelector("#slots");
  const bookBtn = container.querySelector("#bookBtn");
  const statusText = container.querySelector("#status");

  dateInput.addEventListener("change", async function () {
    const selectedDate = this.value;
    const res = await fetch(`${apiUrl}/slots?date=${selectedDate}`);
    const data = await res.json();
    slotsSelect.innerHTML = data.available_slots.length
      ? data.available_slots
          .map((slot) => `<option value="${slot}">${slot}</option>`)
          .join("")
      : `<option disabled>No slots available</option>`;
  });

  bookBtn.addEventListener("click", async function () {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const date = dateInput.value;
    const time = slotsSelect.value;

    if (!name || !phone || !date || !time) {
      statusText.textContent = "Please fill in all fields.";
      statusText.style.color = "red";
      return;
    }

    const res = await fetch(`${apiUrl}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, date, time }),
    });

    const result = await res.json();
    statusText.textContent = result.message;
    statusText.style.color = result.success ? "green" : "red";
  });
})();
