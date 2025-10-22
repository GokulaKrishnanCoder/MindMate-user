import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Tabs,
  Tab,
  Pagination,
  Spinner,
} from "react-bootstrap";
// Import icons from lucide-react, using them for a cleaner, more professional look
import { Trophy, TrendingUp, Users, Award, Activity, Star, Phone, Briefcase, Mail, CheckCircle } from "lucide-react";
import { useTheme } from "../Context/ThemeContext";
import API from "../api";


const CaretakerProfile = () => {
  const PAGE_SIZE = 5;
  const { color, theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [caretaker, setCaretaker] = useState({});
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalPoints: 0,
    activities: [],
    patients: [], // Array of patient IDs/objects from the mongoose model
    rating: 0,
    specialties: [], // Array of strings from the mongoose model
    experience: "", // String from the mongoose model
    phone: "", // String from the mongoose model
    initials: "", // String from the mongoose model (if provided)
  });
  const [todayCounts, setTodayCounts] = useState({ sessions: 0, points: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  // Consistent color mapping for a branded look
  const colorMap = {
    blue: "#3b82f6",
    purple: "#8b5cf6",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    orange: "#f97316",
  };
  const accent = colorMap[color] || "#3b82f6";

  // 1. Fetch caretaker data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCaretaker(JSON.parse(stored));
  }, []);

  // 2. Fetch caretaker stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/caretaker/profile");
        // Ensure all fields are correctly merged and defaulted
        setStats(prev => ({
          ...prev,
          ...res.data,
          ...(res.data.profile || {}),
          specialties: res.data.specialties || [],
          patients: res.data.patients || [],
        }));
      } catch (err) {
        console.error("Error fetching stats:", err);
        // On error, set loading to false to show the profile with default/local data
        // For a real app, you might want a more informative error message
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // 3. Calculate today's counts (runs when stats.activities is updated)
  useEffect(() => {
    const today = new Date();
    let sessions = 0, points = 0;
    (stats.activities || []).forEach((a) => {
      const d = new Date(a.time);
      if (d.toDateString() === today.toDateString()) {
        sessions++;
        points += a.points || 0;
      }
    });
    setTodayCounts({ sessions, points });
  }, [stats.activities]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant={color} />
      </div>
    );

  // Pagination logic remains the same
  const overallActivities = [...(stats.activities || [])];
  const todayActivities = overallActivities.filter(
    (a) => new Date(a.time).toDateString() === new Date().toDateString()
  );
  const totalPages = Math.max(
    1,
    Math.ceil(overallActivities.length / PAGE_SIZE)
  );
  // Sort by time descending and then slice for the current page
  const pagedOverall = overallActivities
    .slice()
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Achievement calculation
  const achievement =
    stats.totalSessions >= 100
      ? {
          title: "Session Pro Badge",
          emoji: "🏆",
          color: "#FFD700",
          desc: "Awarded for completing over 100 patient sessions.",
        }
      : stats.totalSessions >= 20 
      ? {
        title: "Active Therapist Badge",
        emoji: "🏅",
        color: "#C0C0C0",
        desc: "Awarded for completing over 20 patient sessions.",
      }
      : null;
      
  const profileName = caretaker.name || "Unnamed Caretaker";
  // Use initials from stats if available, otherwise generate from name
  const displayInitials = stats.initials || profileName.split(' ').map(n => n[0]).join('');

  // Styles for dark mode
  const cardBg = isDark ? "bg-secondary" : "bg-white";
  const headerBg = isDark ? "bg-dark" : "bg-light";
  const textColor = isDark ? "text-light" : "text-dark";
  const mutedText = isDark ? "text-light-emphasis" : "text-muted";
  const sectionHeader = isDark ? "bg-dark text-light border-bottom border-secondary" : "bg-light text-dark border-bottom";

  return (
    <Container
      fluid
      className={`py-5 min-vh-100 ${
        isDark ? "bg-dark text-light" : "bg-light text-dark"
      }`}
    >
      {/* Profile Header Card */}
      <Card
        className={`mb-4 shadow-lg border-0 ${cardBg} ${textColor}`}
      >
        <Card.Body className="p-4 p-md-5">
          <Row className="align-items-center">
            {/* Profile Info (Left/Top) */}
            <Col
              md={6}
              lg={4}
              className="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-start mb-4 mb-md-0"
            >
              {/* Profile Photo/Initial */}
              {caretaker.photo ? (
                <img
                  src={caretaker.photo}
                  alt="Caretaker"
                  className="rounded-circle mb-3 mb-md-0"
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    border: `4px solid ${accent}`,
                    boxShadow: `0 0 10px ${accent}40`,
                  }}
                />
              ) : (
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3 mb-md-0"
                  style={{
                    width: 100,
                    height: 100,
                    fontSize: "2.5rem",
                    background: accent,
                    color: "#fff",
                    border: `4px solid ${isDark ? "#444" : "#ddd"}`,
                    fontWeight: 'bold',
                  }}
                >
                  {displayInitials.substring(0, 2).toUpperCase() || "?"}
                </div>
              )}
              
              {/* Name and Details */}
              <div className="ms-md-4 text-center text-md-start">
                <h2 className="fw-bold mb-1">{profileName}</h2>
                <p className={`mb-1 ${mutedText}`}>
                  <Mail size={14} className="me-1" /> {caretaker.email}
                </p>
                <p className="mb-1">
                  <Briefcase size={14} className="me-1" /> {caretaker.role || "Caretaker"}
                </p>
                <p className="mb-1">
                  <Phone size={14} className="me-1" /> Phone: {stats.phone || "N/A"}
                </p>
                <p className="mb-1">
                  <Briefcase size={14} className="me-1" /> Experience: {stats.experience || "N/A"}
                </p>
                <p className="mb-2 d-flex align-items-center justify-content-center justify-content-md-start">
                  <Star size={14} className="me-1" color="#FFD700" fill="#FFD700" /> 
                  Rating: {stats.rating?.toFixed(1) || 0.0}
                  <span className="ms-2">
                    <Badge
                      bg={caretaker.status === "Available" ? "success" : "secondary"}
                      className="ms-2"
                    >
                      <CheckCircle size={14} className="me-1" /> {caretaker.status || "Active"}
                    </Badge>
                  </span>
                </p>
                <p className="mb-0 small">
                  Specialties: {stats.specialties.length > 0 ? stats.specialties.map(s => <Badge key={s} bg="info" className="me-1">{s}</Badge>) : "N/A"}
                </p>
              </div>
            </Col>

            {/* Stats (Right/Bottom) - Centered and Spaced */}
            <Col md={6} lg={8}>
              <Row className="g-3">
                {[
                  {label:"Interactions Today", value: stats.chatMessages, icon: <TrendingUp size={20} />},
                  // { label: "Total Sessions", value: stats.totalSessions, icon: <Activity size={20} /> },
                  { label: "Today's Sessions", value: todayCounts.sessions, icon: <Activity size={20} /> },
                  { label: "Assigned Patients", value: stats.patients?.length || 0, icon: <Users size={20} /> },
                ].map((item, i) => (
                  <Col xs={12} sm={6} lg={4} xl={2} className="text-center" key={i}>
                    <Card 
                      className={`${isDark ? 'bg-dark' : 'bg-light'} p-3 shadow-sm border-0`}
                      style={{ borderLeft: `3px solid ${accent}` }}
                    >
                        <div className="d-flex align-items-center justify-content-center flex-column">
                            <span style={{ color: accent }} className="mb-1">
                                {item.icon}
                            </span>
                            <h4 className="fw-bold mb-0" style={{ color: accent }}>{item.value || 0}</h4>
                            <p className="small mb-0 mt-1" style={{ color: isDark ? "#94a3b8" : "#6c757d" }}>
                                {item.label}
                            </p>
                        </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs for Overview and Activity */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || "overview")}
        className={`mb-3 p-2 ${headerBg} rounded shadow-sm`}
        justify
        variant="pills" // Use pills for a more distinct, modern look
      >
        <Tab eventKey="overview" title="Overview" />
        <Tab eventKey="activity" title="Activity Feed" />
      </Tabs>

      {/* Overview Section */}
      {activeTab === "overview" && (
        <Row className="g-4">
          <Col md={6}>
            <Card
              className={`h-100 ${cardBg} ${textColor} shadow-lg border-0`}
            >
              <Card.Header
                className={`fw-bold ${sectionHeader} p-3`}
              >
                <Trophy size={18} className="me-2" style={{ color: accent }} />
                Achievements
              </Card.Header>
              <Card.Body>
                {achievement ? (
                  <div
                    className="d-flex flex-column flex-sm-row align-items-sm-center align-items-start p-3 rounded-lg border"
                    style={{
                      background: isDark ? "#1e293b" : "#f1f3f5",
                      borderColor: accent,
                      gap: "0.5rem",
                    }}
                  >
                    <div className="d-flex align-items-center flex-grow-1">
                      <Award
                        className="me-3 flex-shrink-0"
                        size={30}
                        style={{ color: achievement.color }}
                        fill={achievement.color}
                      />
                      <div>
                        <h6 className="mb-0 fw-bold">
                          {achievement.emoji} {achievement.title}
                        </h6>
                        <p
                          className="small mb-0"
                          style={{ color: mutedText }}
                        >
                          {achievement.desc}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className="align-self-start align-self-sm-center text-uppercase fw-bold"
                      style={{
                        background: achievement.color,
                        color: isDark ? "#1f2937" : "#333",
                        fontSize: "0.85rem",
                        padding: "0.4rem 0.6rem",
                      }}
                    >
                      {stats.totalSessions} sessions
                    </Badge>
                  </div>
                ) : (
                  <p
                    className="text-center m-0 py-5 fw-semibold"
                    style={{ color: mutedText }}
                  >
                    No achievements yet. Keep up the great work to earn your first badge! 🚀
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card
              className={`h-100 ${cardBg} ${textColor} shadow-lg border-0`}
            >
              <Card.Header
                className={`fw-bold ${sectionHeader} p-3`}
              >
                <Users size={18} className="me-2" style={{ color: accent }} />
                Assigned Patients List
              </Card.Header>
              <Card.Body className="d-flex flex-column justify-content-between">
                {stats.patients?.length > 0 ? (
                    stats.patients.map((patient, index) => (
                        <div key={index} className="d-flex align-items-center border-bottom py-2">
                            <Users size={16} className="me-3" color={accent} />
                            <p className="mb-0 fw-semibold">{patient.name || `Patient ID: ${patient._id}`}</p>
                            <Badge bg="secondary" className="ms-auto">{patient.status || 'Active'}</Badge>
                        </div>
                    ))
                ) : (
                    <p className="text-center m-0 py-5 fw-semibold" style={{ color: mutedText }}>
                        No patients currently assigned.
                    </p>
                )}
                {/* Placeholder for 'See All' button or link if list is paginated */}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Activity Section */}
      {activeTab === "activity" && (
        <Row>
          <Col>
            <Card className={`mb-4 ${cardBg} ${textColor} shadow-lg border-0`}>
              <Card.Body>
                <Tabs
                  defaultActiveKey="overall" // Changed default to overall for a richer first view
                  id="activity-subtabs"
                  className="mb-3"
                  variant="underline" // Sub-tabs should be different from main tabs
                >
                  {/* Today's Activity */}
                  <Tab
                    eventKey="today"
                    title={`Today (${todayActivities.length})`}
                  >
                    <div className="p-3">
                      {todayActivities.length > 0 ? (
                        todayActivities
                          .slice()
                          .reverse()
                          .map((a, idx) => (
                            <div
                              key={idx}
                              className={`d-flex align-items-center mb-3 p-2 rounded ${isDark ? 'hover-bg-dark' : 'hover-bg-light'}`}
                              style={{ borderLeft: `3px solid ${accent}` }}
                            >
                              <span style={{ width: 30, fontSize: '1.2rem' }}>🧑‍💻</span>
                              <div className="flex-grow-1 ms-3">
                                <h6 className="mb-0 fw-semibold">
                                  {a.title || "User Assistance Session"}
                                </h6>
                                <p className="small mb-0" style={{ color: mutedText }}>
                                  {new Date(a.time).toLocaleTimeString()}
                                </p>
                              </div>
                              {a.points > 0 && (
                                <Badge
                                  style={{ background: accent }}
                                  className="ms-auto fw-bold"
                                >
                                  +{a.points} pts
                                </Badge>
                              )}
                            </div>
                          ))
                      ) : (
                        <p className="text-center m-0 py-5" style={{ color: mutedText }}>
                          No activity recorded for today.
                        </p>
                      )}
                    </div>
                  </Tab>
                  
                  {/* Overall Activity */}
                  <Tab
                    eventKey="overall"
                    title={`Overall (${overallActivities.length})`}
                  >
                    <div className="p-3">
                      {overallActivities.length === 0 ? (
                        <p className="text-center m-0 py-5" style={{ color: mutedText }}>
                          No activity has been recorded yet.
                        </p>
                      ) : (
                        <>
                          {pagedOverall.map((a, idx) => (
                            <div
                              key={idx}
                              className={`d-flex align-items-center mb-3 p-2 rounded ${isDark ? 'hover-bg-dark' : 'hover-bg-light'}`}
                              style={{ borderLeft: `3px solid ${accent}` }}
                            >
                              <span style={{ width: 30, fontSize: '1.2rem' }}>💬</span>
                              <div className="flex-grow-1 ms-3">
                                <h6 className="mb-0 fw-semibold">
                                  {a.title || "User Support Session"}
                                </h6>
                                <p className="small mb-0" style={{ color: mutedText }}>
                                  {new Date(a.time).toLocaleString()}
                                </p>
                              </div>
                              {a.points > 0 && (
                                <Badge
                                  style={{ background: accent }}
                                  className="ms-auto fw-bold"
                                >
                                  +{a.points} pts
                                </Badge>
                              )}
                            </div>
                          ))}
                          {/* Pagination */}
                          <div className="d-flex justify-content-center mt-4">
                            <Pagination size="sm">
                              <Pagination.First
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                              />
                              <Pagination.Prev
                                onClick={() =>
                                  setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                              />
                              {/* Display a maximum of 5 pages around the current one */}
                              {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p >= currentPage - 2 && p <= currentPage + 2)
                                .map((p) => (
                                  <Pagination.Item
                                    key={p}
                                    active={p === currentPage}
                                    onClick={() => setCurrentPage(p)}
                                  >
                                    {p}
                                  </Pagination.Item>
                                ))}
                              <Pagination.Next
                                onClick={() =>
                                  setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                  )
                                }
                                disabled={currentPage === totalPages}
                              />
                              <Pagination.Last
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                              />
                            </Pagination>
                          </div>
                        </>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CaretakerProfile;