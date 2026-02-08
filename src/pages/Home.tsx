import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const reviews = [
  {
    quote: "This course is amazing! I learned so much in just a few weeks.",
    name: "Emma Wilson",
  },
  {
    quote: "The instructors are so friendly and patient. Highly recommend!",
    name: "Liam Carter",
  },
  {
    quote: "These classes made coding super easy to understand.",
    name: "Sophia Brown",
  },
  {
    quote: "I never thought I’d enjoy coding this much. Great camp!",
    name: "Noah Reed",
  },
  {
    quote: "The quizzes and practice problems really helped me improve.",
    name: "Ava Johnson",
  },
  {
    quote: "Learning JavaScript has been so much fun here!",
    name: "Logan Davis",
  },
  {
    quote: "This was my first coding camp, and I loved it!",
    name: "Harper Lee",
  },
  {
    quote: "I can now build my own projects. Thanks for this amazing course!",
    name: "Oliver Green",
  },
  {
    quote: "The explanations are clear, and the lessons are well-structured.",
    name: "Mia Clark",
  },
  {
    quote: "I finally understand coding, and it’s all thanks to this camp!",
    name: "Lucas Wright",
  },
  {
    quote: "This course is perfect for beginners. I learned so much!",
    name: "Ella Adams",
  },
  {
    quote: "I got a 5 on my AP Computer Science A exam.",
    name: "Elijah Hall",
  },
  {
    quote: "The best instructors I’ve ever had for coding!",
    name: "Amelia Walker",
  },
  {
    quote: "My confidence in coding has grown so much.",
    name: "Henry King",
  },
  {
    quote: "This is the best camp for anyone interested in programming.",
    name: "Isabella Scott",
  },
  {
    quote: "The lessons were fun and easy to follow.",
    name: "William Barnes",
  },
  {
    quote: "I’m excited to use these skills in my school projects!",
    name: "Charlotte Young",
  },
  {
    quote: "The Zoom classes were engaging and informative.",
    name: "James Evans",
  },
  {
    quote: "I can’t believe how much I learned in such a short time!",
    name: "Grace Hill",
  },
  {
    quote: "The practice problems really helped me improve my skills.",
    name: "Benjamin Carter",
  },
  {
    quote: "I would recommend this course to anyone!",
    name: "Abigail Mitchell",
  },
  {
    quote: "The instructors made coding so much fun!",
    name: "Alexander Turner",
  },
  {
    quote: "I feel so confident about coding now. Thank you!",
    name: "Emily Roberts",
  },
  {
    quote: "Such an amazing course for kids and teens.",
    name: "Jackson Cooper",
  },
  {
    quote: "The support from the instructors was incredible!",
    name: "Chloe Price",
  },
  {
    quote: "This camp made me love coding even more.",
    name: "Matthew Peterson",
  },
  {
    quote: "The lessons were super clear, and I learned a lot.",
    name: "Sofia Bell",
  },
  {
    quote: "I loved how interactive and fun the classes were.",
    name: "Owen Hughes",
  },
  {
    quote: "This was such a great experience for me!",
    name: "Avery Morgan",
  },
  {
    quote: "I learned JavaScript faster than I expected!",
    name: "Caleb Perry",
  },
  {
    quote: "The curriculum was fun and easy to follow.",
    name: "Zoe Sanders",
  },
  {
    quote: "I’m now confident enough to build my own apps.",
    name: "Levi Murphy",
  },
  {
    quote: "The teachers really care about helping you succeed.",
    name: "Lily Ward",
  },
  {
    quote: "Learning Java was easier than I thought it would be!",
    name: "Samuel Brooks",
  },
  {
    quote: "This camp made coding so exciting and fun.",
    name: "Ella Foster",
  },
  {
    quote: "The lessons were very well-structured and helpful.",
    name: "Daniel Powell",
  },
  {
    quote: "Thanks to this camp, I’m a much better coder now.",
    name: "Sophie Simmons",
  },
  {
    quote: "The instructors explained everything so clearly.",
    name: "Carter Bennett",
  },
  {
    quote: "I loved every minute of this coding camp!",
    name: "Hannah Russell",
  },
  {
    quote: "I can’t wait to take another course with these instructors.",
    name: "Luke Rivera",
  },
  {
    quote: "This is the best online coding camp I’ve ever attended!",
    name: "Layla Cox",
  },
  {
    quote: "The quizzes were challenging but fun to solve.",
    name: "Ezra Howard",
  },
  {
    quote: "The instructors were always there to help me out.",
    name: "Ellie Morris",
  },
  {
    quote: "Now I feel like a real programmer!",
    name: "Isaac Bell",
  },
  {
    quote: "This was a fantastic way to spend my summer!",
    name: "Stella Torres",
  },
  {
    quote: "The coding challenges were so much fun!",
    name: "Nathan Hayes",
  },
  {
    quote: "I’ll definitely recommend this camp to my friends.",
    name: "Aubrey Watson",
  },
  {
    quote: "This camp made me fall in love with coding.",
    name: "Julian Barnes",
  },
  {
    quote: "The most helpful part were the practice quizzes.",
    name: "Victoria Cook",
  },
  {
    quote: "I feel so proud of what I’ve learned.",
    name: "Gabriel Lopez",
  },
];

export default function Home() {
  const [/* reviewIndex */, setReviewIndex] = useState(() =>
    Math.floor(Math.random() * reviews.length)
  );

  useEffect(() => {
    // rotate to a random review every 3s
    const interval = setInterval(() => {
      setReviewIndex(Math.floor(Math.random() * reviews.length));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // const review = reviews[reviewIndex];

  return (
    <>
      <div style={{ background: "linear-gradient(180deg, #3496ff, #007bff)" }}>
        <div className="hero">
          <h1>Master Math This Summer!</h1>
          <p>
            Interactive live classes designed to prepare students to excel in Math & CS over the school year.
          </p>
          <Link to="/signup" className="cta-button" style={{ margin: "5px" }}>
            I'm Interested
          </Link>
          <Link to="mailto:[your-email]" className="cta-button" style={{ margin: "5px" }}>
            Contact Us
          </Link>
        </div>
        <section className="stats">
          <div className="container stats-grid">
            <div className="stat-card">
              <div className="stat-num">1 on 1</div>
              <div className="stat-label">Private classes available</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">12-15</div>
              <div className="stat-label">Students per group class</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">Live</div>
              <div className="stat-label">Via Google Meets</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">Math + CS</div>
              <div className="stat-label">One program, two tracks</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">Free</div>
              <div className="stat-label">Trial class available</div>
            </div>
          </div>
        </section>

        <section className="courses-preview">
          <div className="container">
            <div className="section-head">
              <h2>Courses We Offer</h2>
            </div>

            <div className="card-grid">
              <div className="card">
                <h3>AP Computer Science A</h3>
                <p>
                  Java OOP, arrays, ArrayLists, FRQs, debugging and problem
                  solving.
                </p>
              </div>
              <div className="card">
                <h3>Algebra I</h3>
                <p>Linear equations, functions, graphing, word problems.</p>
              </div>
              <div className="card">
                <h3>Geometry</h3>
                <p>
                  Proofs, similarity, polygons, circles, intro to trigonometry.
                </p>
              </div>
              <div className="card">
                <h3>Algebra II</h3>
                <p>Polynomials, logs, matrices, inverse functions.</p>
              </div>
              <div className="card">
                <h3>AP Precalculus</h3>
                <p>Functions + trig mastery so Calc feels easy next year.</p>
              </div>
              <div className="card">
                <h3>AP Calculus AB</h3>
                <p>
                  Limits, derivatives, integrals, AP-style practice + strategy.
                </p>
              </div>
              <div className="card">
                <h3>AP Calculus BC</h3>
                <p>
                  AP Calc AB content + advanced integration techniques, infinite
                  series, and parametric & polar topics.
                </p>
              </div>
            </div>

            <div className="center">
              <Link to="/courses" className="cta-button">
                See Full Details
              </Link>
            </div>
          </div>
        </section>

        <section className="how">
          <div className="container">
            <div className="section-head">
              <h2>How It Works</h2>
              <p>It's actually very simple:</p>
            </div>

            <div className="how-grid">
              <div className="how-card">
                <span className="pill">Step 1</span>
                <h3>Sign up & register</h3>
                <p>Register your student and we will provide a schedule for them.</p>
              </div>
              <div className="how-card">
                <span className="pill">Step 2</span>
                <h3>Live Classes via Google Meets</h3>
                <p>
                  Interactive teaching + guided practice + Q&A; 3-5 times a
                  week over 8 weeks.
                </p>
              </div>
              <div className="how-card">
                <span className="pill">Step 3</span>
                <h3>Weekly Check-ins</h3>
                <p>Mini quizzes + feedback so parents can see progress.</p>
              </div>
            </div>
          </div>
        </section>
        <section
          className="wcu"
          style={{ background: "linear-gradient(180deg, #2664a5, #0a498d)" }}
        >
          <h2 className="wcu">⏰ Why Choose Us?</h2>
          <p className="wcu-sub">
            We aim to teach the <b>entirety of each course in 8 weeks</b>, so
            when school starts, you’re <b>set up for an A</b>.
          </p>

          <div className="wcu-grid">
            <div className="wcu-card">
              <h3>🧠 Full-Course in 8 Weeks</h3>
              <p>
                We follow a structured roadmap that covers the full curriculum,
                not just some random tutoring.
              </p>
              <ul className="wcu-bullets">
                <li>Curriculum that covers the entire course</li>
                <li>Notes, practice sets, quizzes to assess progress</li>
                <li>Built to make the school year feel easy</li>
              </ul>
            </div>

            <div className="wcu-card">
              <h3>👥 Small Groups (12-15 Students)</h3>
              <p>
                Students have the opportunity to socialize while also getting
                feedback from their peers.
              </p>
              <ul className="wcu-bullets">
                <li>Live questions, direct participation</li>
                <li>Frequent check-ins</li>
                <li>Help targeted to weak spots</li>
              </ul>
            </div>

            <div className="wcu-card">
              <h3>1️⃣ on 1️⃣ Private Instruction</h3>
              <p>
                Students are also able to register for 1 on 1 private,
                personalized tutoring to help guarantee understanding.
              </p>
              <ul className="wcu-bullets">
                <li>Personalized instruction</li>
                <li>Direct, personalized feedback</li>
                <li>Personalized practice questions</li>
              </ul>
            </div>

            <div className="wcu-card">
              <h3>🎯 AP Prep When Applicable</h3>
              <p>
                For AP courses (Calc AB/BC, CSA), we include AP-style practice
                and strategy.
              </p>
              <ul className="wcu-bullets">
                <li>MCQ + FRQ-style questions</li>
                <li>Timed practice</li>
                <li>Test-taking strategy + common traps</li>
              </ul>
            </div>
          </div>

          <div style={{ paddingBottom: "50px" }}>
            <div className="border"></div>
            <h3 className="wcu">
              ⏰ What are you waiting for?
              <p className="sm">Fill out our interest form today. We will contact you with follow up information!</p>
            </h3>
            <Link to="/signup" className="cta-button">
              Get Started!
            </Link>
          </div>
        </section>
        <section className="how">
          <div className="container">
            <div className="section-head">
              <h2>FAQ</h2>
            </div>

            <div className="how-grid">
              <div className="how-card">
                <h3>Who can join?</h3>
                <p>Students aged 12-18 with an interest in math.</p>
              </div>
              <div className="how-card">
                <h3>What tools are needed?</h3>
                <p>
                  A computer, internet connection, and enthusiasm to learn!
                </p>
              </div>
              <div className="how-card">
                <h3>How are classes conducted?</h3>
                <p>Live via Google Meets with interactive math sessions.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
