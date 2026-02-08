import { useState } from "react";
import { Link } from "react-router-dom";

type PricingMode = "group" | "one";

export default function Courses() {
  const [pricingMode, setPricingMode] = useState<PricingMode>("group");

  const getPrice = (group: string, one: string) =>
    pricingMode === "group" ? group : one;

  return (
    <>
      <section className="courses-hero">
        <div className="container">
          <h1>Courses We Offer</h1>
          <p>
            We aim to teach the <b>entirety of each course in 8 weeks</b>, so
            when the school year starts, you’re <b>set up to earn an A</b>.
          </p>

          <div className="pill-row">
            <span className="pill">Small groups (12-15)</span>
            <span className="pill">Live instruction + practice</span>
            <span className="pill">Weekly quizzes + feedback</span>
            <span className="pill">AP-style prep (AP courses)</span>
          </div>

          <div className="hero-cta">
            <Link to="/signup" className="cta-button">
              Get a Free Trial Class
            </Link>
            <a href="/courses#pricing" className="secondary-button">
              See Pricing
            </a>
          </div>
        </div>
      </section>

      <section className="courses-section">
        <div className="container">
          <div className="section-head">
            <h2>Math Courses</h2>
            <p>
              Choose your course below. Each program includes a roadmap,
              practice sets, and guided support.
            </p>
          </div>

          <div className="card-grid">
            <article className="card">
              <div className="course-top">
                <h3>Algebra I</h3>
                <span className="tag">Foundations</span>
              </div>
              <p className="course-desc">
                Build a strong base in equations, functions, graphing, and word
                problems.
              </p>
              <ul className="course-bullets">
                <li>Linear equations & inequalities</li>
                <li>Functions, graphs, and modeling</li>
                <li>Word problems + real applications</li>
              </ul>
              <div className="course-bottom">
                <div className="price">
                  Group: <b>$25/hr</b>
                </div>
                <div className="price">
                  1 on 1: <b>$40/hr</b>
                </div>
                <a
                  className="outline-link"
                  href="outlines/algebra1-outline.pdf"
                  target="_blank"
                >
                  Download course outline (PDF)
                </a>
              </div>
            </article>

            <article className="card">
              <div className="course-top">
                <h3>Geometry</h3>
                <span className="tag">Proofs + Visual Thinking</span>
              </div>
              <p className="course-desc">
                Learn and make sense of proofs, similarity, and all about
                polygons without memorizing random rules.
              </p>
              <ul className="course-bullets">
                <li>Proof strategies + theorems</li>
                <li>Similarity, triangles, circles</li>
                <li>Coordinate geometry + trig intro</li>
              </ul>
              <div className="course-bottom">
                <div className="price">
                  Group: <b>$25/hr</b>
                </div>
                <div className="price">
                  1 on 1: <b>$40/hr</b>
                </div>
                <a
                  className="outline-link"
                  href="outlines/geometry-outline.pdf"
                  target="_blank"
                >
                  Download course outline (PDF)
                </a>
              </div>
            </article>

            <article className="card">
              <div className="course-top">
                <h3>Algebra II</h3>
                <span className="tag">Core High School Math</span>
              </div>
              <p className="course-desc">
                Strengthen algebra skills that show up everywhere: polynomials,
                logs, transformations..
              </p>
              <ul className="course-bullets">
                <li>Polynomials, radicals, rational funcs.</li>
                <li>Exponentials & logarithms</li>
                <li>Sequences, modeling, and tests</li>
              </ul>
              <div className="course-bottom">
                <div className="price">
                  Group: <b>$30/hr</b>
                </div>
                <div className="price">
                  1 on 1: <b>$45/hr</b>
                </div>
                <a
                  className="outline-link"
                  href="outlines/algebra2-outline.pdf"
                  target="_blank"
                >
                  Download course outline (PDF)
                </a>
              </div>
            </article>

            <article className="card">
              <div className="course-top">
                <h3>Precalculus</h3>
                <span className="tag">Calc Readiness</span>
              </div>
              <p className="course-desc">
                Master functions and trig so Calculus feels smooth next year.
                Perfect for students moving into AP Calc.
              </p>
              <ul className="course-bullets">
                <li>Function transformations & inverses</li>
                <li>Trigonometry mastery & intro to polar functions</li>
                <li>Exponentials, logs, and modeling</li>
              </ul>
              <div className="course-bottom">
                <div className="price">
                  Group: <b>$30/hr</b>
                </div>
                <div className="price">
                  1 on 1: <b>$45/hr</b>
                </div>
                <a
                  className="outline-link"
                  href="outlines/precalc-outline.pdf"
                  target="_blank"
                >
                  Download course outline (PDF)
                </a>
              </div>
            </article>

            <article className="card highlight">
              <div className="course-top">
                <h3>AP Calculus AB</h3>
                <span className="tag">Most Popular</span>
              </div>
              <p className="course-desc">
                Learn the full AB curriculum with AP-style practice so the
                school year feels easy and exam prep isn’t scary.
              </p>
              <ul className="course-bullets">
                <li>Limits & continuity</li>
                <li>Derivatives + applications</li>
                <li>Integrals + area/accumulation (AP FRQs)</li>
              </ul>
              <div className="course-bottom">
                <div className="price">
                  Group: <b>$40/hr</b>
                </div>
                <div className="price">
                  1 on 1: <b>$55/hr</b>
                </div>
                <a
                  className="outline-link"
                  href="outlines/calcab-outline.pdf"
                  target="_blank"
                >
                  Download course outline (PDF)
                </a>
              </div>
            </article>

            <article className="card highlight">
              <div className="course-top">
                <h3>AP Calculus BC</h3>
                <span className="tag">Most Popular</span>
              </div>
              <p className="course-desc">
                Everything in AB plus BC-only topics: series, parametric/polar,
                and advanced integration techniques.
              </p>
              <ul className="course-bullets">
                <li>AB content + deeper applications</li>
                <li>Taylor/Maclaurin series + convergence</li>
                <li>Parametric & polar functions (AP FRQs)</li>
              </ul>
              <div className="course-bottom">
                <div className="price">
                  Group: <b>$40/hr</b>
                </div>
                <div className="price">
                  1 on 1: <b>$55/hr</b>
                </div>
                <a
                  className="outline-link"
                  href="outlines/calcbc-outline.pdf"
                  target="_blank"
                >
                  Download course outline (PDF)
                </a>
              </div>
            </article>

            <article className="card highlight">
              <div className="course-top">
                <h3>AP Computer Science A (CSA)</h3>
                <span className="tag">Most Popular</span>
              </div>
              <p className="course-desc">
                Learn Java fundamentals and AP-style problem solving so the
                school year feels easy, plus FRQ practice and debugging drills.
              </p>
              <ul className="course-bullets">
                <li>Java OOP (classes, methods, inheritance)</li>
                <li>Arrays / ArrayLists + common patterns</li>
                <li>FRQ-style practice + debugging strategy</li>
              </ul>
              <div className="course-bottom">
                <div className="price">
                  Group: <b>$30/hr</b>
                </div>
                <div className="price">
                  1 on 1: <b>$45/hr</b>
                </div>
                <a
                  className="outline-link"
                  href="outlines/apcsa-outline.pdf"
                  target="_blank"
                >
                  Download course outline (PDF)
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-head">
            <h2>Pricing At A Glance</h2>
          </div>

          <div className="pricing-toggle">
            <button
              type="button"
              className={
                pricingMode === "group" ? "toggle-btn active" : "toggle-btn"
              }
              onClick={() => setPricingMode("group")}
            >
              Group Classes
            </button>
            <button
              type="button"
              className={
                pricingMode === "one" ? "toggle-btn active" : "toggle-btn"
              }
              onClick={() => setPricingMode("one")}
            >
              1-on-1 Classes
            </button>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Math & Computer Science</h3>
              <p className="muted">
                Algebra I • Geometry • Algebra II • Precalculus • AP CSA
              </p>

              <ul className="pricing-list">
                <li>
                  <span>Algebra I</span>
                  <b>{getPrice("$25/hr", "$40/hr")}</b>
                </li>
                <li>
                  <span>Geometry</span>
                  <b>{getPrice("$25/hr", "$40/hr")}</b>
                </li>
                <li>
                  <span>Algebra II</span>
                  <b>{getPrice("$30/hr", "$45/hr")}</b>
                </li>
                <li>
                  <span>Precalculus</span>
                  <b>{getPrice("$30/hr", "$45/hr")}</b>
                </li>
                <li>
                  <span>AP Computer Science A</span>
                  <b>{getPrice("$30/hr", "$45/hr")}</b>
                </li>
              </ul>
            </div>

            <div className="pricing-card highlight">
              <h3>AP Calculus</h3>
              <p className="muted">AB & BC cohorts</p>

              <ul className="pricing-list">
                <li>
                  <span>AP Calc AB</span>
                  <b>{getPrice("$40/hr", "$55/hr")}</b>
                </li>
                <li>
                  <span>AP Calc BC</span>
                  <b>{getPrice("$40/hr", "$55/hr")}</b>
                </li>
              </ul>

              <p className="tiny muted">
                Premium tiers are available and include on-demand extra classes
                when available, additional AP-style practice sets with full
                solutions, timed mock assessments with feedback, and more.
                Please contact us to learn more.
              </p>
            </div>
          </div>

          <p className="tiny muted pricing-note">
            Group sizes are limited to 12-15 students. 1-on-1 instruction is
            limited and offered at a higher rate due to individualized pacing.
          </p>
        </div>
      </section>

      <section className="courses-cta">
        <div style={{ paddingBottom: "60px" }} className="container cta-box">
          <h2>Ready to register your child?</h2>
          <p style={{ marginBottom: "40px" }}>Fill out our interest form! We'll follow up with more details. We even offer a free trial class.</p>
          <Link to="/signup" className="cta-button">
            I'm Interested
          </Link>
        </div>
      </section>
    </>
  );
}
