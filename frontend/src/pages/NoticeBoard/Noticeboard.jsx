import { useEffect, useState } from "react";
import "./NoticeBoard.css";

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/notices");
      if (response.ok) {
        setNotices(await response.json());
      }
    } catch (err) {
      console.error("Error fetching notices:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="notice-board-wrapper">
      <h2 className="notice-board-title">Notice Board</h2>

      {loading ? (
        <div className="notice-loading">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="no-notices-message">No notices available</div>
      ) : (
        <div className="notice-board-scroll">
          {notices.map((n) => (
            <a
              key={n.id}
              href={`http://localhost:8080${n.pdfUrl}`}
              target="_blank"
              rel="noreferrer"
              className="notice-card">
              <div className="notice-card-header">
                <h3>{n.title}</h3>
                <span className="notice-card-date">
                  {formatDate(n.noticeDate)}
                </span>
              </div>
              <div className="notice-card-footer">
                <span className="view-pdf-link">View PDF →</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
