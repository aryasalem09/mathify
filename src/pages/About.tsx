import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <section className="about-hero">
        <div className="container">
          <h1>About Mathlify</h1>
          <p>
            We’re a team of high school instructors who make math (and AP CS)
            finally click. Our goal is simple: teach the{" "}
            <b>full course roadmap in 8 weeks</b> so students start the school
            year <b>set up to earn an A</b>—with confidence, structure, and
            practice.
          </p>

          <div className="about-badges">
            <div className="badge">
              <div className="badge-num">1 on 1</div>
              <div className="badge-label">Private classes available</div>
            </div>
            <div className="badge">
              <div className="badge-num">6–8</div>
              <div className="badge-label">Students per group</div>
            </div>
            <div className="badge">
              <div className="badge-num">8</div>
              <div className="badge-label">Week Roadmap</div>
            </div>
            <div className="badge">
              <div className="badge-num">3-5x</div>
              <div className="badge-label">Live sessions/week</div>
            </div>
            <div className="badge">
              <div className="badge-num">Weekly</div>
              <div className="badge-label">Quizzes + feedback</div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="two-col">
            <div className="panel">
              <h2>Our Teaching Style</h2>
              <p>
                We don’t “talk at” students. Because we have deep conceptual
                understanding, not only do we teach "how to solve problems", but
                we thoroughly teach the concept, practice together, then make
                sure you can do it on your own.
              </p>
              <ul className="checklist">
                <li>🧠 The goal is understanding, not memorization.</li>
                <li>✅ Clear explanations with step-by-step examples</li>
                <li>📝 Guided practice + targeted help</li>
                <li>⌛ Weekly quizzes to track progress</li>
                <li>🎯 AP-style problems for AP courses (when applicable)</li>
              </ul>
            </div>

            <div className="panel">
              <h2>Why Parents Trust Us</h2>
              <p>
                We’re transparent and structured. Every course has a roadmap,
                assignments, and weekly check-ins. Small groups mean your
                student gets real attention.
              </p>
              <ul className="checklist">
                <li>👥 Small groups (6–8 max)</li>
                <li>🎯 1 on 1 available</li>
                <li>🛣️ Full-course roadmap (8 weeks)</li>
                <li>📝 Practice sets + answer keys</li>
              </ul>
              <p className="tiny muted">
                Note: Results vary based on attendance and effort. We provide
                structure, practice, and feedback, but we can’t guarantee
                specific grades or exam scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <div className="section-head">
            <h2>Meet the Team</h2>
            <p>Real students. Real results. Friendly teaching, serious structure.</p>
          </div>

          <div className="team-grid">
            {/* Instructor card template: duplicate this for each teacher */}
            <article className="team-card">
              <img
                className="team-img"
                src="/Images/team/yourname.jpg"
                alt="Instructor photo"
              />
              <div className="team-body">
                <h3>Your Name</h3>
                <p className="role">Lead Instructor — AP Calculus (AB/BC)</p>
                <ul className="mini-list">
                  <li>• AP Calc focus: AB & BC</li>
                  <li>• Teaches: Calc, Precal, Alg II</li>
                  <li>• Style: clear steps + lots of practice</li>
                </ul>
              </div>
            </article>

            <article className="team-card">
              <img
                className="team-img"
                src="/Images/team/friend.jpg"
                alt="Instructor photo"
              />
              <div className="team-body">
                <h3>Friend Name</h3>
                <p className="role">Instructor — Geometry / Foundations</p>
                <ul className="mini-list">
                  <li>• Proofs + geometry intuition</li>
                  <li>• Teaches: Geometry, Alg I/II</li>
                  <li>• Style: visual explanations + strategy</li>
                </ul>
              </div>
            </article>

            <article className="team-card">
              <img
                className="team-img"
                src="/Images/team/csa.jpg"
                alt="Instructor photo"
              />
              <div className="team-body">
                <h3>Instructor Name</h3>
                <p className="role">Instructor — AP Computer Science A</p>
                <ul className="mini-list">
                  <li>• Java OOP + Arrays/ArrayLists</li>
                  <li>• FRQ practice + debugging drills</li>
                  <li>• Style: learn-by-building + patterns</li>
                </ul>
              </div>
            </article>
          </div>

          <div className="about-cta">
            <Link to="/signup" className="cta-button">
              Get a Free Trial Class
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
