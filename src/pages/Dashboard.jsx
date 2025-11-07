import { useState, useEffect } from "react";
import axios from "axios";
import expenseCategories from "../data/expenseCategories";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../index.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [salary, setSalary] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [alert, setAlert] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [totalSavings, setTotalSavings] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const token = localStorage.getItem("token");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentMonthName = new Date(0, currentMonth - 1).toLocaleString("default", { month: "long" });
  const salaryKey = `salary_${currentYear}_${currentMonth}`;

  // ✅ Auto Salary Carry Forward
  useEffect(() => {
    if (initialized) return;

    const currentSalary = localStorage.getItem(salaryKey);
    if (currentSalary) {
      setSalary(currentSalary);
      setInitialized(true);
      return;
    }

    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevKey = `salary_${prevYear}_${prevMonth}`;
    const prevSalary = localStorage.getItem(prevKey);

    if (prevSalary) {
      localStorage.setItem(salaryKey, prevSalary);
      setSalary(prevSalary);
      setInfoMessage(`Salary carried forward from last month (₹${prevSalary})`);
    }

    setInitialized(true);
  }, [initialized, currentMonth, currentYear, salaryKey]);

  // ✅ Fetch all expenses
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(
        "https://finanace-assistant-backend.onrender.com/api/expenses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      setAlert("Failed to fetch expenses.");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ✅ Filter current month’s expenses
  const currentMonthExpenses = expenses.filter((exp) => {
    const date = new Date(exp.createdAt);
    return (
      date.getMonth() + 1 === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  // ✅ Save salary manually
  const handleSalarySave = () => {
    if (salary <= 0) {
      setAlert("Enter a valid salary.");
      return;
    }
    localStorage.setItem(salaryKey, salary);
    setAlert("Salary saved successfully!");
  };

  // ✅ Calculate Monthly and Total Savings
  useEffect(() => {
    // Group expenses by month-year
    const monthMap = {};
    expenses.forEach((exp) => {
      const d = new Date(exp.createdAt);
      const key = `${d.getFullYear()}_${d.getMonth() + 1}`;
      if (!monthMap[key]) monthMap[key] = 0;
      monthMap[key] += Number(exp.amount);
    });

    // Calculate savings for each month
    let cumulativeSavings = 0;
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("salary_")) {
        const salaryValue = Number(localStorage.getItem(key));
        const totalSpent = monthMap[key] || 0;
        const monthSavings = salaryValue - totalSpent;
        if (monthSavings > 0) cumulativeSavings += monthSavings;
      }
    });

    setTotalSavings(cumulativeSavings);
  }, [expenses, salary]);

  // ✅ Category-wise Spending (Current Month)
  const categorySpent = expenseCategories.map((cat) => {
    const total = currentMonthExpenses
      .filter((e) => cat.subcategories.includes(e.subcategory))
      .reduce((acc, e) => acc + Number(e.amount), 0);
    return { category: cat.category, total };
  });

  // ✅ Recommended Budget
  const recommendedBudget = {
    "Fixed Expenses": salary * 0.5,
    "Variable Expenses": salary * 0.3,
    "Periodic and Occasional Expenses": salary * 0.2,
  };

  // ✅ Subcategory Spending
  const subcategorySpent = {};
  expenseCategories.forEach((cat) => {
    cat.subcategories.forEach((sub) => {
      const total = currentMonthExpenses
        .filter((e) => e.subcategory === sub)
        .reduce((acc, e) => acc + Number(e.amount), 0);
      if (total > 0) subcategorySpent[sub] = total;
    });
  });

  // ✅ Charts
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

  const monthlyTotals = Array(12).fill(0);
  expenses.forEach((exp) => {
    const month = new Date(exp.createdAt).getMonth();
    monthlyTotals[month] += Number(exp.amount);
  });

  const lineChartData = {
    labels: Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("default", { month: "short" })
    ),
    datasets: [
      {
        label: "Monthly Spending Trend (₹)",
        data: monthlyTotals,
        borderColor: "#4f46e5",
        backgroundColor: "#6366f1",
        fill: false,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const totalSpent = categorySpent.reduce((acc, c) => acc + c.total, 0);
  const currentSavings = salary - totalSpent;
  const remainingBudget = salary - totalSpent;

  return (
    <div className="dashboard-page">
      <h2>Dashboard - {currentMonthName} {currentYear}</h2>

      {alert && <div className="alert">{alert}</div>}
      {infoMessage && <div className="alert success">{infoMessage}</div>}

      {/* 💼 Monthly Overview */}
      <div className="overview-section">
        <div className="overview-card">
          <h3>Salary</h3>
          <p>₹{salary || 0}</p>
        </div>
        <div className="overview-card">
          <h3>Total Expenses</h3>
          <p>₹{totalSpent}</p>
        </div>
        <div className="overview-card">
          <h3>Savings This Month</h3>
          <p>₹{currentSavings > 0 ? currentSavings : 0}</p>
        </div>
        <div className="overview-card savings-highlight">
          <h3>Total Savings Available</h3>
          <p>₹{totalSavings > 0 ? totalSavings : 0}</p>
          <small>(Your emergency fund)</small>
        </div>
      </div>

      {/* Salary Input */}
      <div className="salary-input">
        <label>Enter Monthly Salary (₹)</label>
        <input
          type="number"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
        />
        <button onClick={handleSalarySave}>Save Salary</button>
      </div>

      {/* Charts */}
      <div className="charts">
        <div className="chart">
          <h4>Category-wise Spending (Actual vs Recommended)</h4>
          <Bar data={categoryBarData} />
        </div>

        {Object.keys(subcategorySpent).length > 0 && (
          <div className="chart">
            <h4>Subcategory-wise Spending</h4>
            <Pie data={subcategoryPieData} />
          </div>
        )}

        <div className="chart">
          <h4>Monthly Expense Trend</h4>
          <Line data={lineChartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
