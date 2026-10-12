
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  }
});

// Tạo mã sinh viên nếu chưa được cung cấp
studentSchema.pre("save", async function () {
  if (this.studentId) return;

  const lastStudent = await mongoose
    .model("Student")
    .findOne({ studentId: /^SV\d+$/ })
    .sort({ studentId: -1 })
    .select("studentId")
    .lean();

  const lastNumber = lastStudent
    ? parseInt(lastStudent.studentId.slice(2), 10)
    : 0;

  this.studentId = `SV${String(lastNumber + 1).padStart(4, "0")}`;
});

module.exports = mongoose.model("Student", studentSchema);
