const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("../models/Student");
require("dotenv").config();

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middlewares
app.use(cors());
app.use(express.json());

// Routes Test
app.get("/api/hello", (req, res) => {
    res.json({ message: "Backend is working!" });
});

// GET /api/students - Lấy danh sách sinh viên
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/students - Tạo sinh viên mới
app.post("/api/students", async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/students/:id - Cập nhật sinh viên
app.put("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/students/:id - Xóa sinh viên
app.delete("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json({
            message: "Student deleted successfully",
            student: student
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Connect Database & Start Server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Atlas connected successfully!");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });
    // Ví dụ sửa hàm fetch:
const fetchStudents = async () => {
  try {
    const response = await fetch('https://glowing-tribble-jjvp5v9wwpjj3qgpx-5000.app.github.dev/');
    const data = await response.json();
    setStudents(data);
  } catch (error) {
    console.error(error);
  }
};