import { useState, useEffect } from "react";
import axios from "axios";
import expenseCategories from "../data/expenseCategories";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../index.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [salary, setSalary] = useState(localStorage.getItem("salary") || "");
  const [expenses, setExpenses] = useState([]);
  const [alert, setAlert] = useState("");
  const token = localStorage.getItem("token");

  // Fetch expenses from backend
  const fetchExpenses = async () => {
    try {
      const res = await axios.get("https://finanace-assistant-backend.onrender.com/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      setAlert("Failed to fetch expenses.");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSalarySave = () => {
    if (salary <= 0) {
      setAlert("Enter a valid salary.");
      return;
    }
    localStorage.setItem("salary", salary);
    setAlert("Salary saved!");
  };

  // Total spent per category
  const categorySpent = expenseCategories.map((cat) => {
    const total = expenses
      .filter((e) => cat.subcategories.includes(e.subcategory))
      .reduce((acc, e) => acc + Number(e.amount), 0);
    return { category: cat.category, total };
  });

  // AI-driven recommended budget (dynamic based on salary and spending trend)
  const recommendedBudget = {
    "Fixed Expenses": salary * 0.5,
    "Variable Expenses": salary * 0.3,
    "Periodic and Occasional Expenses": salary * 0.2,
  };

  // Subcategory-wise spending
  const subcategorySpent = {};
  expenseCategories.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      const total = expenses
        .filter((e) => e.subcategory === sub)
        .reduce((acc, e) => acc + Number(e.amount), 0);
      if (total > 0) subcategorySpent[sub] = total;
    });
  });

  // Charts data
  const categoryBarData = {
    labels: categorySpent.map((c) => c.category),
    datasets: [
      {
        label: "Actual Spent",
        data: categorySpent.map((c) => c.total),
        backgroundColor: ["#4f46e5", "#fbbf24", "#10b981"],
      },
      {
        label: "Recommended",
        data: categorySpent.map((c) => recommendedBudget[c.category] || 0),
        backgroundColor: ["#a5b4fc", "#fde68a", "#6ee7b7"],
      },
    ],
  };

  const subcategoryPieData = {
    labels: Object.keys(subcategorySpent),
    datasets: [
      {
        data: Object.values(subcategorySpent),
        backgroundColor: [
          "#4f46e5",
          "#fbbf24",
          "#10b981",
          "#f87171",
          "#3b82f6",
          "#8b5cf6",
          "#14b8a6",
          "#facc15",
        ],
      },
    ],
  };

  const totalSpent = categorySpent.reduce((acc, c) => acc + c.total, 0);
  const remainingBudget = salary - totalSpent;

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>

      {alert && <div className="alert">{alert}</div>}

      <div className="salary-input">
        <label>Enter Monthly Salary (₹)</label>
        <input
          type="number"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />
        <button onClick={handleSalarySave}>Save Salary</button>
      </div>

      <div className="summary-cards">
        {categorySpent.map((c) => (
          <div
            key={c.category}
            className={`card ${
              c.total > recommendedBudget[c.category] ? "over-budget" : "budget-ok"
            }`}
          >
            <h3>{c.category}</h3>
            <p>₹{c.total}</p>
            <small>
              Recommended: ₹{recommendedBudget[c.category]}
            </small>
            {c.total > recommendedBudget[c.category] && (
              <div className="overspend-warning">You are over budget!</div>
            )}
          </div>
        ))}
        <div className="card remaining-card">
          <h3>Remaining Budget</h3>
          <p>₹{remainingBudget}</p>
        </div>
        <div className="card savings-card">
          <h3>Suggested Savings</h3>
          <p>₹{remainingBudget > 0 ? remainingBudget : 0}</p>
          <small>Save at least 20% of remaining budget</small>
        </div>
      </div>

      <div className="charts">
        <div className="chart">
          <h4>Category-wise Spending (Actual vs Recommended)</h4>
          <Bar data={categoryBarData} />
        </div>
        {Object.keys(subcategorySpent).length > 0 && (
          <div className="chart">
            <h4>Subcategory-wise Spending (Pie)</h4>
            <Pie data={subcategoryPieData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
