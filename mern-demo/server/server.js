
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/Student");
require("dotenv").config();

const app = express();

// ==================== CORS ====================
const allowedOrigins = [
    process.env.CLIENT_URL ||
        "https://mern-frontend-235612.onrender.com",
    /^https:\/\/.*\.app\.github\.dev$/
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            const isAllowed = allowedOrigins.some((allowed) =>
                allowed instanceof RegExp
                    ? allowed.test(origin)
                    : allowed === origin
            );

            if (isAllowed) {
                return callback(null, true);
            }

            return callback(
                new Error("Origin không được phép bởi CORS")
            );
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());

// ==================== TEST API ====================
app.get("/api/hello", (req, res) => {
    res.json({
        message: "Backend is working!"
    });
});

// ==================== GET STUDENTS ====================
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find().sort({ name: 1 });
        res.json(students);
    } catch (error) {
        console.error("Loi lay danh sach:", error.message);

        res.status(500).json({
            message: "Khong the lay danh sach sinh vien."
        });
    }
});

// ==================== BACKFILL STUDENT IDs ====================
// Tao ma thu nghiem cho sinh vien cu chua co studentId.
// Chi su dung mot lan trong lab.
app.post("/api/students/backfill-ids", async (req, res) => {
    try {
        const students = await Student.find({
            $or: [
                { studentId: { $exists: false } },
                { studentId: null },
                { studentId: "" }
            ]
        }).sort({ _id: 1 });

        const existingIds = await Student.find({
            studentId: /^SV\d+$/
        })
            .select("studentId")
            .lean();

        let lastNumber = existingIds.reduce((max, student) => {
            const number = Number(student.studentId.slice(2));

            return Number.isFinite(number)
                ? Math.max(max, number)
                : max;
        }, 0);

        const updatedStudents = [];

        for (const student of students) {
            lastNumber++;

            student.studentId =
                "SV" + String(lastNumber).padStart(4, "0");

            await student.save();

            updatedStudents.push({
                _id: student._id,
                name: student.name,
                studentId: student.studentId
            });
        }

        res.json({
            message:
                "Da cap nhat " +
                updatedStudents.length +
                " sinh vien.",
            students: updatedStudents
        });
    } catch (error) {
        console.error("Loi cap nhat MSSV:", error.message);

        res.status(500).json({
            message: "Khong the cap nhat MSSV.",
            error: error.message
        });
    }
});

// ==================== POST STUDENT ====================
app.post("/api/students", async (req, res) => {
    try {
        const { studentId, name, age, email } = req.body;

        if (!name || age === undefined || !email) {
            return res.status(400).json({
                message: "Vui long nhap ho ten, tuoi va email."
            });
        }

        const student = await Student.create({
            studentId,
            name,
            age,
            email
        });

        res.status(201).json(student);
    } catch (error) {
        console.error("Loi them sinh vien:", error.message);

        res.status(400).json({
            message: error.code === 11000
                ? "MSSV da ton tai. Vui long kiem tra lai."
                : error.message
        });
    }
});

// ==================== UPDATE STUDENT ====================
app.put("/api/students/:id", async (req, res) => {
    try {
        const { studentId, name, age, email } = req.body;
        const updateData = {};

        if (studentId !== undefined) {
            updateData.studentId = studentId;
        }

        if (name !== undefined) updateData.name = name;
        if (age !== undefined) updateData.age = age;
        if (email !== undefined) updateData.email = email;

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: "Khong tim thay sinh vien."
            });
        }

        res.json(student);
    } catch (error) {
        console.error("Loi cap nhat sinh vien:", error.message);

        res.status(400).json({
            message: error.code === 11000
                ? "MSSV da ton tai."
                : error.message
        });
    }
});

// ==================== DELETE STUDENT ====================
app.delete("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                message: "Khong tim thay sinh vien."
            });
        }

        res.json({
            message: "Xoa sinh vien thanh cong.",
            student
        });
    } catch (error) {
        console.error("Loi xoa sinh vien:", error.message);

        res.status(400).json({
            message: error.message
        });
    }
});

// ==================== ERROR HANDLER ====================
app.use((error, req, res, next) => {
    if (error.message === "Origin không được phép bởi CORS") {
        return res.status(403).json({
            message: error.message
        });
    }

    console.error("Loi server:", error.message);

    res.status(500).json({
        message: "Loi may chu."
    });
});

// ==================== CONNECT MONGODB ====================
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Atlas connected successfully!");

        app.listen(PORT, () => {
            console.log("Server running on port " + PORT);
        });
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);
    });