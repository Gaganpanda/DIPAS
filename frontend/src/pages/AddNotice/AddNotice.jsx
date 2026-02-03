import { useState } from "react";
import { addNotice } from "../../api/noticeApi";

const AddNotice = () => {
  const [notice, setNotice] = useState({
    title: "",
    pdfUrl: "",
    noticeDate: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addNotice(notice);
    alert("Notice added successfully");
    setNotice({ title: "", pdfUrl: "", noticeDate: "" });
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "40px" }}>
      <h2>Add Notice</h2>

      <input
        placeholder="Title"
        value={notice.title}
        onChange={(e) => setNotice({ ...notice, title: e.target.value })}
        required
      />

      <input
        placeholder="PDF URL"
        value={notice.pdfUrl}
        onChange={(e) => setNotice({ ...notice, pdfUrl: e.target.value })}
        required
      />

      <input
        type="date"
        value={notice.noticeDate}
        onChange={(e) => setNotice({ ...notice, noticeDate: e.target.value })}
        required
      />

      <button type="submit">Save Notice</button>
    </form>
  );
};

export default AddNotice;
