import { useEffect, useState } from "react";
import "./Home.css";

const Home = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/notices")
      .then((res) => res.json())
      .then((data) => setNotices(data))
      .catch((err) => console.error("Failed to fetch notices", err));
  }, []);

  // 🔒 FRONTEND SAFETY: Always show latest notice first
  const sortedNotices = [...notices].sort(
    (a, b) => new Date(b.noticeDate) - new Date(a.noticeDate),
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="home-wrapper">
      <div className="home-container">
        {/* LEFT CONTENT */}
        <div className="home-content">
          <h1>
            Defence Institute of <br />
            <span>Physiology & Allied Sciences</span>
          </h1>

          <p>
            Defence Institute of Physiology & Allied Sciences (DIPAS), a
            laboratory of Defence Research and Development Organisation (DRDO),
            conducts physiological and biomedical research to improve human
            performance in extreme and wartime environments.
          </p>
        </div>

        {/* RIGHT NOTICE BOARD */}
        <aside className="notice-board">
          <h3>Notice Board</h3>

          <div className="notice-list">
            {sortedNotices.length === 0 ? (
              <p className="no-notice">No notices available</p>
            ) : (
              sortedNotices.map((notice) => (
                <div key={notice.id} className="notice-item">
                  {/* Title with tooltip */}
                  <div className="notice-title" title={notice.title}>
                    {notice.title}
                  </div>

                  <div className="notice-footer">
                    <span className="notice-date">
                      {formatDate(notice.noticeDate)}
                    </span>

                    <a
                      href={`http://localhost:8080${notice.pdfUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="notice-link">
                      View PDF
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
