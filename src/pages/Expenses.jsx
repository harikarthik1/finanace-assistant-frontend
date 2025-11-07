import { useState, useEffect } from "react";
import axios from "axios";
import expenseCategories from "../data/expenseCategories";
import "../index.css";

const Expenses = () => {
  const [form, setForm] = useState({ category: "", subcategory: "", amount: "", note: "" });
  const [expenses, setExpenses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const token = localStorage.getItem("token");

  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      const res = await axios.get("https://finanace-assistant-backend.onrender.com/api/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      setAlert({ type: "error", message: "Failed to fetch expenses." });
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Form validation
  const validate = () => {
    if (!form.category || !form.subcategory || !form.amount || form.amount <= 0) {
      setAlert({ type: "error", message: "Please fill all required fields correctly." });
      return false;
    }
    return true;
  };

  // Add or update expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingId) {
        await axios.put(
          `https://finanace-assistant-backend.onrender.com/api/expenses/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAlert({ type: "success", message: "Expense updated successfully!" });
      } else {
        await axios.post("https://finanace-assistant-backend.onrender.com/api/expenses", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ type: "success", message: "Expense added successfully!" });
      }
      setForm({ category: "", subcategory: "", amount: "", note: "" });
      setEditingId(null);
      fetchExpenses();
    } catch (error) {
      console.error(error);
      setAlert({ type: "error", message: "Something went wrong!" });
    }
  };

  // Delete expense
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`https://finanace-assistant-backend.onrender.com/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ type: "success", message: "Expense deleted successfully!" });
      fetchExpenses();
    } catch (error) {
      console.error(error);
      setAlert({ type: "error", message: "Failed to delete expense!" });
    }
  };

  // Edit expense
  const handleEdit = (expense) => {
    setForm({
      category: expense.category,
      subcategory: expense.subcategory,
      amount: expense.amount,
      note: expense.note || "",
    });
    setEditingId(expense._id);
  };

  return (
    <div className="expenses-page">
      <h2 className="expenses-title">Manage Your Expenses</h2>

      {alert.message && <div className={`alert ${alert.type}`}>{alert.message}</div>}

      <form className="expenses-form" onSubmit={handleSubmit}>
        <label>Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })}
        >
          <option value="">Select Category</option>
          {expenseCategories.map((cat) => (
            <option key={cat.category} value={cat.category}>
              {cat.category}
            </option>
          ))}
        </select>

        <label>Subcategory</label>
        <select
          value={form.subcategory}
          onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
          disabled={!form.category}
        >
          <option value="">Select Subcategory</option>
          {form.category &&
            expenseCategories
              .find((c) => c.category === form.category)
              .subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
        </select>

        <label>Amount (₹)</label>
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="Enter amount"
        />

        <label>Note</label>
        <input
          type="text"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="Optional note"
        />

        <div className="form-buttons">
          <button type="submit" className="btn primary-btn">
            {editingId ? "Update Expense" : "Add Expense"}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn cancel-btn"
              onClick={() => {
                setForm({ category: "", subcategory: "", amount: "", note: "" });
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="expenses-table-container">
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Amount (₹)</th>
              <th>Note</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((exp) => (
                <tr key={exp._id}>
                  <td data-label="Category">{exp.category}</td>
                  <td data-label="Subcategory">{exp.subcategory}</td>
                  <td data-label="Amount">₹{exp.amount}</td>
                  <td data-label="Note">{exp.note || "-"}</td>
                  <td data-label="Date">{new Date(exp.createdAt).toLocaleDateString()}</td>
                  <td data-label="Actions">
                    <button className="btn edit-btn" onClick={() => handleEdit(exp)}>
                      Edit
                    </button>
                    <button className="btn delete-btn" onClick={() => handleDelete(exp._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-expenses">
                  No expenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
