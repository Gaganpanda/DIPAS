import React from "react";
import "./Home.css";

const Home = () => {
  const notices = [
    {
      id: 1,
      title: "Annual Research Symposium 2026",
      date: "28/01/2026",
      pdf: "#",
    },
    {
      id: 2,
      title: "New Safety Protocols Implementation",
      date: "25/01/2026",
      pdf: "#",
    },
    {
      id: 3,
      title: "Project Submission Deadline Extended",
      date: "20/01/2026",
      pdf: "#",
    },
    {
      id: 4,
      title: "Laboratory Maintenance Schedule",
      date: "18/01/2026",
      pdf: "#",
    },
  ];

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
            {notices.map((notice) => (
              <div key={notice.id} className="notice-item">
                <div className="notice-title">{notice.title}</div>

                <div className="notice-footer">
                  <span>{notice.date}</span>
                  <a href={notice.pdf} className="notice-link">
                    View PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
