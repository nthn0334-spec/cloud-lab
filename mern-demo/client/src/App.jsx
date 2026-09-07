import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL =
  "https://glowing-tribble-jjvp5v9wwpjj3qgpx-5000.app.github.dev/api/students";

function App() {
  const [students, setStudents] = useState([]);

  // ID của sinh viên đang được sửa
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    email: "",
    age: ""
  });

  // =========================
  // LẤY DANH SÁCH SINH VIÊN
  // =========================
  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_URL);

      setStudents(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // =========================
  // XỬ LÝ NHẬP FORM
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // =========================
  // THÊM / CẬP NHẬT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Nếu editingId có giá trị
      // => CẬP NHẬT
      if (editingId) {
        const response = await axios.put(
          `${API_URL}/${editingId}`,
          {
            ...formData,
            age: Number(formData.age)
          }
        );

        if (response.status === 200) {
          alert("Cập nhật sinh viên thành công!");

          setFormData({
            studentId: "",
            name: "",
            email: "",
            age: ""
          });

          setEditingId(null);

          fetchStudents();
        }

        return;
      }

      // Nếu không có editingId
      // => THÊM SINH VIÊN
      const response = await axios.post(API_URL, {
        ...formData,
        age: Number(formData.age)
      });

      if (response.status === 201 || response.status === 200) {
        alert("Thêm sinh viên thành công!");

        setFormData({
          studentId: "",
          name: "",
          email: "",
          age: ""
        });

        fetchStudents();
      }
    } catch (error) {
      console.error("Lỗi:", error);

      alert(
        "Lỗi: " +
          (error.response?.data?.message ||
            error.message)
      );
    }
  };

  // =========================
  // BẤM NÚT SỬA
  // =========================
  const handleEdit = (student) => {
    setEditingId(student._id);

    setFormData({
      studentId: student.studentId || "",
      name: student.name || "",
      email: student.email || "",
      age: student.age || ""
    });

    // Cuộn lên đầu trang để sửa
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // =========================
  // HỦY SỬA
  // =========================
  const handleCancelEdit = () => {
    setEditingId(null);

    setFormData({
      studentId: "",
      name: "",
      email: "",
      age: ""
    });
  };

  // =========================
  // XÓA SINH VIÊN
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa sinh viên này không?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/${id}`
      );

      if (
        response.status === 200 ||
        response.status === 204
      ) {
        alert("Xóa sinh viên thành công!");

        // Nếu đang sửa sinh viên vừa bị xóa
        if (editingId === id) {
          handleCancelEdit();
        }

        fetchStudents();
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);

      alert(
        "Lỗi: " +
          (error.response?.data?.message ||
            error.message)
      );
    }
  };

  return (
    <div className="app">
      <div className="container">

        {/* ================= FORM ================= */}
        <div className="form-box">

          <h1>🎓 Quản lý sinh viên - VERSION 2.0</h1>

          <form onSubmit={handleSubmit}>

            <label>MSSV</label>

            <input
              type="text"
              name="studentId"
              placeholder="Ví dụ: 123456"
              value={formData.studentId}
              onChange={handleChange}
              required
            />

            <label>Họ và tên</label>

            <input
              type="text"
              name="name"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Ví dụ: nguyenvana@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Tuổi</label>

            <input
              type="number"
              name="age"
              placeholder="20"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
            />

            {/* NÚT THÊM / CẬP NHẬT */}

            <button type="submit">
              <span>
                {editingId ? "✏️" : "＋"}
              </span>

              {editingId
                ? " Cập nhật sinh viên"
                : " Thêm sinh viên"}
            </button>

            {/* NÚT HỦY */}

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

        {/* ================= DANH SÁCH ================= */}

        <h2 className="title">
          📋 Danh sách sinh viên
        </h2>

        <div className="student-grid">

          {students.length > 0 ? (

            students.map((sv, index) => (

              <div
                className="student-card"
                key={sv._id || index}
              >

                <h3>
                  #{index + 1} - {sv.name}
                </h3>

                <div className="info">

                  <p>
                    <strong>MSSV:</strong>
                    <br />
                    {sv.studentId}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {sv.email}
                  </p>

                  <p>
                    <strong>Tuổi:</strong>{" "}
                    {sv.age}
                  </p>

                </div>

                {/* ================= NÚT SỬA XÓA ================= */}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px"
                  }}
                >

                  <button
                    type="button"
                    onClick={() => handleEdit(sv)}
                  >
                    ✏️ Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(sv._id)
                    }
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