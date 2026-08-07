// Change greeting based on the current time

const greeting = document.getElementById("greeting");

const hour = new Date().getHours();

if (hour < 12) {
  greeting.textContent = "Good Morning ☀️";
} else if (hour < 18) {
  greeting.textContent = "Good Afternoon 🌸";
} else {
  greeting.textContent = "Good Evening 🌙";
}

// Set today's date automatically

const dateInput = document.getElementById("date");

dateInput.valueAsDate = new Date();

// =============================
// Expense Storage
// =============================

// This array will temporarily store all expenses
let expenses = [];

let editingExpenseId = null;

// Local Storage Key

const STORAGE_KEY = "cinnabudget_expenses";
const BUDGET_STORAGE_KEY = "cinnabudget_budget";

// =============================
// Form Elements
// =============================

const expenseForm = document.getElementById("expenseForm");
const expenseTable = document.getElementById("expenseTable");
const expenseCount = document.getElementById("expenseCount");

const exportBtn = document.getElementById("exportBtn");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");

const budgetProgress = document.getElementById("budgetProgress");
const budgetPercentage = document.getElementById("budgetPercentage");

exportBtn.addEventListener("click", exportToExcel);

const toast = document.getElementById("toast");

const saveMessages = [
  "🌸 Yay! I saved it for you!",

  "🩵 Another expense safely recorded!",

  "☁️ Got it! I've added your expense.",

  "💙 Saved with care!",

  "✨ Success! Let's stay on track together!",

  "🌷 All done! Your expense is safe with me.",

  "☁️ Cinnabudget tucked your expense away safely!",

  "🫶 Thanks! I've recorded it for you.",

  "🌼 Another expense added to your cozy budget!",

  "💖 Done! Every little peso counts.",
];

const budgetMessages = [
  "💙 Budget saved! Let's make every peso count!",

  "☁️ Your budget is ready for this pay cycle!",

  "🌸 Cinnabudget is ready to help you stay on track!",

  "🩵 Budget updated successfully!",

  "✨ You're all set for a fresh start!",
];

function getRandomBudgetMessage() {
  return budgetMessages[Math.floor(Math.random() * budgetMessages.length)];
}

const totalBudget = document.getElementById("totalBudget");

const budgetSpent = document.getElementById("budgetSpent");

const budgetRemaining = document.getElementById("budgetRemaining");

const budgetStatus = document.getElementById("budgetStatus");

const totalBudgetDisplay = document.getElementById("totalBudgetDisplay");

const budgetSetupSection = document.getElementById("budgetSetupSection");

const editBudgetBtn = document.getElementById("editBudgetBtn");

function updateBudgetDashboard() {
  const total = Number(totalBudget.value) || 0;
  let spent = 0;

  expenses.forEach((item) => {
    spent += item.amount;
  });

  const remaining = total - spent;

  totalBudgetDisplay.textContent = `₱${total.toLocaleString()}`;

  budgetSpent.textContent = `₱${spent.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  if (remaining >= 0) {
    budgetRemaining.textContent = `₱${remaining.toLocaleString()}`;
  } else {
    budgetRemaining.textContent = `🌸 Over by ₱${Math.abs(remaining).toLocaleString()}`;
  }

  const percentage = total === 0 ? 0 : Math.min((spent / total) * 100, 100);
  budgetProgress.style.width = `${percentage}%`;

  budgetPercentage.textContent = `${percentage.toFixed(0)}% Used`;

  if (percentage <= 50) {
    budgetProgress.style.background = "#8EC5FC"; // Blue
  } else if (percentage <= 70) {
    budgetProgress.style.background = "#CDB4DB"; // Lavender
  } else if (percentage <= 85) {
    budgetProgress.style.background = "#F8AFCB"; // Pink
  } else {
    budgetProgress.style.background = "#FF8A8A"; // Soft Red
  }

  if (percentage <= 50) {
    budgetStatus.textContent = "🩵 You're doing great! Keep it up!";
  } else if (percentage <= 70) {
    budgetStatus.textContent = "🌸 You're staying on track!";
  } else if (percentage <= 85) {
    budgetStatus.textContent =
      "🌼 Just a little reminder—keep an eye on your budget!";
  } else if (percentage < 100) {
    budgetStatus.textContent =
      "☁️ You're almost at your budget. Plan your next purchases carefully!";
  } else {
    budgetStatus.textContent =
      "💖 You've reached your budget. That's okay! Let's get back on track together!";
  }
}

totalBudget.addEventListener("input", () => {
  updateBudgetDashboard();
});

function saveBudget() {
  const budget = {
    totalBudget: Number(totalBudget.value),
  };

  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budget));

  showToast(getRandomBudgetMessage());
  budgetSetupSection.style.display = "none";

  editBudgetBtn.style.display = "block";
}

function loadBudget() {
  const savedBudget = JSON.parse(localStorage.getItem(BUDGET_STORAGE_KEY));
  if (!savedBudget) return;

  totalBudget.value = savedBudget.totalBudget || 0;

  updateBudgetDashboard();

  if (savedBudget.totalBudget > 0) {
    budgetSetupSection.style.display = "none";

    editBudgetBtn.style.display = "block";
  }
}

// ==========================
// Expense Functions
// ==========================

function validateForm() {
  const date = document.getElementById("date").value;
  const amount = document.getElementById("amount").value;

  if (date === "") {
    showToast("📅 Don't forget to choose a date! ☁️");

    return false;
  }

  if (amount === "") {
    showToast("💰 Please enter an amount! 🩵");

    return false;
  }

  if (Number(amount) <= 0) {
    showToast("🌸 Amount must be greater than ₱0.");

    return false;
  }

  return true;
}

function saveExpense(event) {
  // Prevent page refresh
  event.preventDefault();
  if (!validateForm()) {
    return;
  }

  if (editingExpenseId !== null) {
    const expense = expenses.find((item) => item.id === editingExpenseId);

    expense.date = document.getElementById("date").value;
    expense.category = document.getElementById("category").value;
    expense.paymentMethod = document.getElementById("paymentMethod").value;
    expense.amount = Number(document.getElementById("amount").value);
    expense.notes = document.getElementById("notes").value;

    editingExpenseId = null;

    saveToLocalStorage();
    displayExpenses();
    updateBudgetDashboard();

    showToast("🩵 Expense updated successfully!");

    expenseForm.reset();
    dateInput.valueAsDate = new Date();

    document.querySelector(".save-btn").textContent = "☁️ Save Expense";

    return;
  }

  const expense = {};

  // Save inside the array
  expenses.unshift(expense);
  saveToLocalStorage();
  // Refresh the table
  displayExpenses();

  updateBudgetDashboard();
  showToast();

  // Reset form
  expenseForm.reset();

  // Set today's date again
  dateInput.valueAsDate = new Date();
}

function displayExpenses() {
  expenseTable.innerHTML = "";

  if (expenses.length === 0) {
    expenseTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    ☁️ No expenses recorded yet.
                </td>
            </tr>
        `;
  } else {
    expenses.forEach((expense) => {
      expenseTable.innerHTML += `
                <tr>
                    <td>${expense.date}</td>
                    <td>${expense.category}</td>
                    <td>${expense.paymentMethod}</td>
                    <td>₱${expense.amount.toFixed(2)}</td>
                    <td>${expense.notes}</td>
                    <td>
                        <button
                            class="delete-btn"
                            onclick="deleteExpense(${expense.id})">
                            🗑️
                        </button>
                        <button
                            class="edit-btn"
                            onclick="editExpense(${expense.id})">
                            ✏️
                        </button>
                    </td>
                </tr>
            `;
    });
  }

  expenseCount.textContent = `${expenses.length} Records`;
}

function showToast(message = null) {
  const randomMessage =
    saveMessages[Math.floor(Math.random() * saveMessages.length)];

  toast.textContent = message || randomMessage;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Save expenses into Local Storage

function saveToLocalStorage() {
  localStorage.setItem(
    STORAGE_KEY,

    JSON.stringify(expenses),
  );
}

// Delete an expense

function deleteExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);

  saveToLocalStorage();

  displayExpenses();

  updateBudgetDashboard();
}

// Edit an expense
function editExpense(id) {
  const expense = expenses.find((item) => item.id === id);

  if (!expense) return;

  editingExpenseId = id;

  document.getElementById("date").value = expense.date;
  document.getElementById("category").value = expense.category;
  document.getElementById("paymentMethod").value = expense.paymentMethod;
  document.getElementById("amount").value = expense.amount;
  document.getElementById("notes").value = expense.notes;

  document.querySelector(".save-btn").textContent = "💙 Update Expense";
}

// Load expenses from Local Storage

function loadExpenses() {
  const savedExpenses = localStorage.getItem(STORAGE_KEY);

  if (savedExpenses) {
    expenses = JSON.parse(savedExpenses);
  }

  displayExpenses();
  updateBudgetDashboard();
}

// ==========================
// App Initialization
// ==========================

expenseForm.addEventListener("submit", saveExpense);
saveBudgetBtn.addEventListener("click", saveBudget);
editBudgetBtn.addEventListener("click", () => {
  budgetSetupSection.style.display = "block";

  editBudgetBtn.style.display = "none";
});

loadExpenses();
loadBudget();
updateBudgetDashboard();

function exportToExcel() {
  if (expenses.length === 0) {
    showToast("📭 No expenses to export!");

    return;
  }

  const exportData = expenses.map((expense) => ({
    Date: expense.date,

    Category: expense.category,

    "Payment Method": expense.paymentMethod,

    Amount: expense.amount,

    Notes: expense.notes,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

  XLSX.writeFile(workbook, "Cinnabudget_Expenses.xlsx");

  showToast("📄 Excel exported successfully!");
}
