import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
    return (
        <div className="home-container">
            {/* ================= HEADER NAVBAR ================= */}
            <header className="home-navbar">
                <div className="navbar-brand">
                    <Link to="/" className="brand-logo">
                        <span className="brand-dot" />
                        CodeForges
                    </Link>
                </div>

                <nav className="navbar-links">
                    <a href="#features">Features</a>
                    <a href="#studio">Studio</a>
                    <a href="#ai">AI Assistant</a>
                    <a href="#community">Community</a>
                </nav>

                <div className="navbar-actions">
                    <Link to="/login" className="nav-btn login-nav-btn">
                        Sign In
                    </Link>
                    <Link to="/register" className="nav-btn register-nav-btn">
                        Get Started
                    </Link>
                </div>
            </header>

            {/* ================= HERO SECTION ================= */}
            <section className="hero-section">
                <div className="hero-badge">
                    <span>Collaborative Developer Platform</span>
                </div>

                <h1 className="hero-title">
                    A New Way to Forge Code <br />
                    <span className="hero-highlight">&amp; Collaborate in Real-Time</span>
                </h1>

                <p className="hero-subtitle">
                    CodeForges is the premier platform to practice algorithms, pair-program live with HD video &amp; audio, execute code in real-time, and leverage AI to elevate your software developer skills.
                </p>

                <div className="hero-cta-group">
                    <Link to="/register" className="hero-btn primary-hero-btn">
                        Create Free Account
                    </Link>
                    <Link to="/login" className="hero-btn secondary-hero-btn">
                        Sign In to Studio
                    </Link>
                </div>

                {/* Hero Studio Preview Mockup */}
                <div className="hero-preview-wrapper" id="studio">
                    <div className="preview-window-header">
                        <div className="window-dots">
                            <span className="dot red" />
                            <span className="dot yellow" />
                            <span className="dot green" />
                        </div>
                        <div className="window-title">codeforges.com/room/81LCIT</div>
                        <div className="window-status">Live Sync Active</div>
                    </div>

                    <div className="preview-window-body">
                        {/* Left Sidebar Mock */}
                        <div className="preview-sidebar">
                            <div className="preview-card-title">Problem Statement</div>
                            <div className="preview-problem-name">Reverse Linked List</div>
                            <div className="preview-tag easy">Easy</div>
                            <p className="preview-problem-desc">
                                Given the head of a singly linked list, reverse the list and return its reversed head.
                            </p>
                            <div className="preview-divider" />
                            <div className="preview-video-box">
                                <div className="video-avatar">JS</div>
                                <div className="video-label">Alex (Host)</div>
                            </div>
                        </div>

                        {/* Center Code Editor Mock */}
                        <div className="preview-editor">
                            <div className="editor-tab-bar">
                                <span className="tab active">Main.java</span>
                                <span className="tab-lang">Java 17</span>
                            </div>
                            <pre className="code-block">
<code>{`class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode nextTemp = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nextTemp;
        }
        return prev;
    }
}`}</code>
                            </pre>
                            <div className="preview-console">
                                <div className="console-line success">Status: Accepted | Runtime: 0 ms | Memory: 41.5 MB</div>
                            </div>
                        </div>

                        {/* Right AI Assistant Mock */}
                        <div className="preview-ai">
                            <div className="ai-preview-header">AI Assistant</div>
                            <div className="ai-msg bot">
                                <strong>CodeForge AI:</strong> Your iterative solution operates in O(N) time and O(1) auxiliary space. Excellent approach!
                            </div>
                            <div className="ai-msg user">
                                <strong>You:</strong> What edge cases should I test?
                            </div>
                            <div className="ai-msg bot">
                                <strong>CodeForge AI:</strong> Test with empty list (head = null) and single node (head.next = null).
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= METRICS BAR ================= */}
            <section className="metrics-bar">
                <div className="metric-item">
                    <div className="metric-number">4+</div>
                    <div className="metric-label">Popular Languages</div>
                </div>
                <div className="metric-item">
                    <div className="metric-number">&lt;50ms</div>
                    <div className="metric-label">Real-Time Sync Latency</div>
                </div>
                <div className="metric-item">
                    <div className="metric-number">100%</div>
                    <div className="metric-label">Integrated HD Video &amp; Audio</div>
                </div>
                <div className="metric-item">
                    <div className="metric-number">AI</div>
                    <div className="metric-label">Smart Code Reviews &amp; Hints</div>
                </div>
            </section>

            {/* ================= FEATURES GRID ================= */}
            <section className="features-section" id="features">
                <div className="section-header">
                    <h2 className="section-title">Everything You Need for Collaborative Coding</h2>
                    <p className="section-subtitle">
                        Designed for developer interviews, peer study groups, algorithmic practice, and pair programming.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-box">01</div>
                        <h3>Real-Time Collaborative Studio</h3>
                        <p>
                            Work simultaneously in a shared Monaco editor with multi-cursor support, syntax highlighting, and live synchronization powered by WebSockets.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-box">02</div>
                        <h3>Integrated HD Video &amp; Audio</h3>
                        <p>
                            Conduct technical mock interviews or discuss complex data structures face-to-face with WebRTC video and crystal-clear audio chat.
                        </p>
                    </div>

                    <div className="feature-card" id="ai">
                        <div className="feature-icon-box">03</div>
                        <h3>AI Coding Assistant</h3>
                        <p>
                            Get intelligent test cases, edge case warnings, code reviews, and step-by-step hints without spoiling complete solutions.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-box">04</div>
                        <h3>Multi-Language Code Execution</h3>
                        <p>
                            Execute code instantly in Java, Python, C++, and JavaScript. View real-time standard output, errors, execution time, and memory usage.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-box">05</div>
                        <h3>Custom Private &amp; Public Rooms</h3>
                        <p>
                            Create custom coding sessions with unique room codes, topic tags, custom problems, and role-based permissions for owners and peers.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-box">06</div>
                        <h3>Clean Developer IDE Experience</h3>
                        <p>
                            Enjoy a dark mode design system engineered specifically for developers, with customizable themes, adjustable font sizes, and minimal UI overhead.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= COMMUNITY / BENEFITS SECTION ================= */}
            <section className="benefits-section" id="community">
                <div className="benefits-card">
                    <div className="benefits-content">
                        <h2>Join the Next Generation of Developers</h2>
                        <p>
                            Whether you are preparing for technical interviews, solving competitive programming challenges, or teaching peers, CodeForges provides all the tools you need in one seamless web interface.
                        </p>
                        <ul className="benefits-list">
                            <li>Zero setup required — code directly in your browser.</li>
                            <li>Instant room creation with shareable invite codes.</li>
                            <li>Built-in compilation engine for top programming languages.</li>
                        </ul>
                        <div className="benefits-cta">
                            <Link to="/register" className="hero-btn primary-hero-btn">
                                Start Coding Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CALL TO ACTION BANNER ================= */}
            <section className="cta-banner">
                <h2>Ready to forge your next line of code?</h2>
                <p>Create a room, invite your peers, and start collaborating in seconds.</p>
                <div className="cta-banner-buttons">
                    <Link to="/register" className="hero-btn primary-hero-btn">
                        Get Started Free
                    </Link>
                    <Link to="/login" className="hero-btn secondary-hero-btn">
                        Sign In
                    </Link>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="home-footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="brand-logo">
                            <span className="brand-dot" />
                            CodeForges
                        </div>
                        <p>Real-time collaborative code editor with HD video chat and AI assistance.</p>
                    </div>
                    <div className="footer-links-column">
                        <h4>Platform</h4>
                        <a href="#features">Features</a>
                        <a href="#studio">Studio</a>
                        <a href="#ai">AI Assistant</a>
                    </div>
                    <div className="footer-links-column">
                        <h4>Account</h4>
                        <Link to="/login">Sign In</Link>
                        <Link to="/register">Register</Link>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} CodeForges. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
