import { useState } from "react";
import "./About.css";

const About = () => {
  const [activeTab, setActiveTab] = useState("vision");

  return (
    <div className="about-wrapper">
      {/* Hero Banner */}

      <div className="about-container">
        {/* TAB NAVIGATION */}
        <div className="about-tabs">
          <button
            className={`about-tab-btn ${activeTab === "vision" ? "active" : ""}`}
            onClick={() => setActiveTab("vision")}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Vision
          </button>
          <button
            className={`about-tab-btn ${activeTab === "mission" ? "active" : ""}`}
            onClick={() => setActiveTab("mission")}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            Mission
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="about-tab-content">
          {activeTab === "vision" && (
            <div className="about-card vision-card">
              <div className="about-card-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div className="about-card-text">
                <h2>Our Vision</h2>
                <div className="about-divider"></div>
                <p>
                  To be a premier centre of excellence in physiological and
                  biomedical research dedicated to enhancing human performance
                  and resilience in extreme and operational environments.
                </p>
              </div>
            </div>
          )}

          {activeTab === "mission" && (
            <div className="about-card mission-card">
              <div className="about-card-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
              </div>
              <div className="about-card-text">
                <h2>Our Mission</h2>
                <div className="about-divider"></div>
                <p>
                  To conduct advanced life sciences research and develop
                  innovative technologies that improve the health, endurance,
                  and survivability of defence personnel across diverse and
                  challenging terrains.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ABOUT DIPAS SECTION */}
        <div className="about-info-section">
          <h2>About DIPAS</h2>
          <div className="about-divider"></div>
          <p>
            Defence Institute of Physiology & Allied Sciences (DIPAS), a premier
            laboratory of the Defence Research and Development Organisation
            (DRDO), is engaged in conducting physiological and biomedical
            research to improve human performance in extreme and wartime
            environments.
          </p>
          <p>
            DIPAS undertakes research on environmental physiology, nutrition and
            work physiology, psychophysiology, biomedical engineering and
            biotechnology. The institute is dedicated to developing life-saving
            interventions, performance enhancement techniques, and health
            monitoring systems for defence personnel.
          </p>
          <div className="about-stats">
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Years of Research</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">200+</span>
              <span className="stat-label">Publications</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="stat-label">Scientists</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">30+</span>
              <span className="stat-label">Patents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
