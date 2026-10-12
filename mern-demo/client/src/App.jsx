
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// URL Backend trên Render
const API_BASE_URL = "https://mern-backend-235612.onrender.com";
const API_URL = `${API_BASE_URL}/api/students`;

const initialFormData = {
  studentId: "",
  name: "",
  email: "",
  age: ""
};

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  // LẤY DANH SÁCH SINH VIÊN
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const response = await axios.get(API_URL);

      if (!Array.isArray(response.data)) {
        throw new Error("API không trả về danh sách sinh viên hợp lệ.");
      }

      setStudents(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);

      setFetchError(
        error.response?.data?.message ||
          error.message ||
          "Không thể kết nối đến Backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // XỬ LÝ NHẬP FORM
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // THÊM / CẬP NHẬT SINH VIÊN
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const studentData = {
        ...formData,
        age: Number(formData.age)
      };

      if (editingId) {
        await axios.put(
          `${API_URL}/${editingId}`,
          studentData
        );

        alert("Cập nhật sinh viên thành công!");
      } else {
        await axios.post(API_URL, studentData);

        alert("Thêm sinh viên thành công!");
      }

      setFormData({ ...initialFormData });
      setEditingId(null);

      await fetchStudents();
    } catch (error) {
      console.error("Lỗi lưu sinh viên:", error);

      alert(
        "Không thể lưu sinh viên: " +
          (error.response?.data?.message ||
            error.message ||
            "Lỗi không xác định")
      );
    }
  };

  // SỬA SINH VIÊN
  const handleEdit = (student) => {
    setEditingId(student._id);

    setFormData({
      studentId: student.studentId || "",
      name: student.name || "",
      email: student.email || "",
      age: student.age ?? ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // HỦY SỬA
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ ...initialFormData });
  };

  // XÓA SINH VIÊN
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa sinh viên này không?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`);

      alert("Xóa sinh viên thành công!");

      if (editingId === id) {
        handleCancelEdit();
      }

      await fetchStudents();
    } catch (error) {
      console.error("Lỗi xóa sinh viên:", error);

      alert(
        "Không thể xóa sinh viên: " +
          (error.response?.data?.message ||
            error.message ||
            "Lỗi không xác định")
      );
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* FORM SINH VIÊN */}
        <div className="form-box">
          <h1>🎓 Quản lý sinh viên - VERSION 2.1</h1>

          <form onSubmit={handleSubmit}>
            <label htmlFor="studentId">MSSV</label>
            <input
              id="studentId"
              type="text"
              name="studentId"
              placeholder="Ví dụ: 123456"
              value={formData.studentId}
              onChange={handleChange}
              required
            />

            <label htmlFor="name">Họ và tên</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Ví dụ: nguyenvana@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="age">Tuổi</label>
            <input
              id="age"
              type="number"
              name="age"
              placeholder="20"
              value={formData.age}
              onChange={handleChange}
              min="1"
              required
            />

            <button type="submit">
              {editingId
                ? "✏️ Cập nhật sinh viên"
                : "＋ Thêm sinh viên"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
              >
                ❌ Hủy sửa
              </button>
            )}
          </form>
        </div>

        {/* DANH SÁCH SINH VIÊN */}
        <h2 className="title">📋 Danh sách sinh viên</h2>

        <div className="student-grid">
          {loading ? (
            <p className="empty">
              Đang tải danh sách sinh viên...
            </p>
          ) : fetchError ? (
            <div className="empty">
              <p>Không tải được danh sách: {fetchError}</p>

              <button
                type="button"
                onClick={fetchStudents}
              >
                🔄 Thử tải lại
              </button>
            </div>
          ) : students.length > 0 ? (
            students.map((student, index) => (
              <div
                className="student-card"
                key={student._id || index}
              >
                <h3>
                  #{index + 1} - {student.name}
                </h3>

                <div className="info">
                  <p>
                    <strong>MSSV:</strong>
                    <br />
                    {student.studentId || "Chưa có"}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {student.email || "Chưa có"}
                  </p>

                  <p>
                    <strong>Tuổi:</strong>{" "}
                    {student.age ?? "Chưa có"}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px"
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleEdit(student)}
                  >
                    ✏️ Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(student._id)}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="empty">
              Chưa có sinh viên nào
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
