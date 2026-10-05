import { useRef, useState } from "react";
import "./Resume.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function Resume({ onBack }) {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  const [resumeData, setResumeData] = useState(null);
  const [questions, setQuestions] = useState([]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setMessage("");
    setAnalysisDone(false);
    setResumeData(null);
    setQuestions([]);

    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setMessage("Please select a PDF file only.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setMessage("File size must be less than 5 MB.");
      return;
    }

    setSelectedFile(file);
    setMessage("Resume selected successfully.");
  };

  const removeFile = () => {
    if (loading) return;

    setSelectedFile(null);
    setMessage("");
    setAnalysisDone(false);
    setResumeData(null);
    setQuestions([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeResume = async () => {
    if (!selectedFile) {
      setMessage("Please upload your resume first.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setMessage("Please login before analyzing your resume.");
      return;
    }

    try {
      setLoading(true);
      setAnalysisDone(false);
      setResumeData(null);
      setQuestions([]);
      setMessage("Uploading resume...");

      // ==========================================
      // STEP 1: Upload Resume
      // ==========================================

      const formData = new FormData();

      formData.append("file", selectedFile);

      const uploadResponse = await fetch(
        `${API_BASE_URL}/resume/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData?.detail ||
            "Resume upload failed."
        );
      }

      setResumeData(uploadData);

      const resumeId = uploadData?.id;

      if (!resumeId) {
        throw new Error(
          "Resume uploaded, but resume ID was not returned."
        );
      }

      // ==========================================
      // STEP 2: Generate AI Questions
      // ==========================================

      setMessage(
        "Resume uploaded. AI is analyzing your resume..."
      );

      const questionResponse = await fetch(
        `${API_BASE_URL}/resume/generate-questions/${resumeId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const questionData =
        await questionResponse.json();

      if (!questionResponse.ok) {
        throw new Error(
          questionData?.detail ||
            "AI resume analysis failed."
        );
      }

      setQuestions(
        Array.isArray(questionData?.questions)
          ? questionData.questions
          : []
      );

      setResumeData((previous) => ({
        ...previous,
        ...questionData,
      }));

      setAnalysisDone(true);

      setMessage(
        `AI analysis completed successfully. ${
          questionData?.total_questions || 0
        } questions generated.`
      );

    } catch (error) {
      console.error(
        "Resume analysis error:",
        error
      );

      setMessage(
        error?.message ||
          "Something went wrong during resume analysis."
      );

      setAnalysisDone(false);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-page">

      {/* HEADER */}
      <header className="resume-header">

        <div className="resume-logo">
          <span>✦</span>
          Interview<span>+</span>
        </div>

        <button
          className="resume-back-btn"
          onClick={onBack}
          disabled={loading}
        >
          ← Dashboard
        </button>

      </header>


      {/* MAIN CONTENT */}
      <main className="resume-container">

        {/* PAGE INTRO */}
        <div className="resume-title">

          <p>RESUME ANALYSIS</p>

          <h1>
            Upload Your <span>Resume</span>
          </h1>

          <span>
            Upload your resume and prepare it for
            AI-powered analysis and interview
            preparation.
          </span>

        </div>


        {/* MAIN CARD */}
        <section className="resume-card">

          {/* PROFILE STATUS */}
          <div className="resume-empty-profile">

            <div className="resume-empty-icon">
              📄
            </div>

            <div>

              <h2>
                {analysisDone
                  ? "Resume Analyzed"
                  : "No Resume Uploaded"}
              </h2>

              <p>
                {analysisDone
                  ? "Your resume has been analyzed by AI."
                  : "Upload your latest resume to get started."}
              </p>

            </div>

          </div>


          <div className="resume-divider"></div>


          {/* UPLOAD SECTION */}
          <div className="resume-upload-section">

            <div className="resume-upload-heading">

              <div>

                <p className="resume-mini-label">
                  RESUME DOCUMENT
                </p>

                <h2>
                  Upload your resume
                </h2>

                <p>
                  Upload your latest resume in PDF
                  format. Our AI will analyze your
                  profile and generate personalized
                  interview questions.
                </p>

              </div>

              <div className="resume-upload-symbol">
                ↑
              </div>

            </div>


            {/* HIDDEN FILE INPUT */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileSelect}
              className="resume-file-input"
              disabled={loading}
            />


            {/* BEFORE FILE SELECT */}
            {!selectedFile && (

              <button
                type="button"
                className="resume-drop-zone"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={loading}
              >

                <div className="resume-drop-icon">
                  ↑
                </div>

                <div className="resume-drop-content">

                  <strong>
                    Choose your resume
                  </strong>

                  <span>
                    Click here to upload a PDF file
                  </span>

                </div>

                <span className="resume-drop-arrow">
                  →
                </span>

              </button>

            )}


            {/* AFTER FILE SELECT */}
            {selectedFile && (

              <div className="resume-file-card">

                <div className="resume-file-info">

                  <div className="resume-pdf-icon">
                    PDF
                  </div>

                  <div>

                    <strong>
                      {selectedFile.name}
                    </strong>

                    <span>
                      {(
                        selectedFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </span>

                  </div>

                </div>


                <button
                  type="button"
                  className="resume-remove-btn"
                  onClick={removeFile}
                  disabled={loading}
                >
                  Remove
                </button>

              </div>

            )}


            {/* ANALYZE BUTTON */}
            {selectedFile && !analysisDone && (

              <button
                type="button"
                className="resume-analyze-btn"
                onClick={analyzeResume}
                disabled={loading}
              >

                {loading
                  ? "Analyzing Resume..."
                  : "Analyze Resume"}

                <span>
                  {loading ? "..." : "→"}
                </span>

              </button>

            )}


            {/* SUCCESS MESSAGE */}
            {message && (

              <div
                className={`resume-message ${
                  message.includes("successfully") ||
                  message.includes("selected")
                    ? "success"
                    : "error"
                }`}
              >
                {message}
              </div>

            )}


            <div className="resume-upload-footer">

              <span>PDF only</span>

              <span>•</span>

              <span>Maximum 5 MB</span>

              <span>•</span>

              <span>AI powered</span>

            </div>

          </div>


          {/* AI ANALYSIS RESULT */}
          {analysisDone && (

            <div className="resume-analysis-result">

              <div className="resume-divider"></div>

              <div className="resume-result-heading">

                <p className="resume-mini-label">
                  AI ANALYSIS
                </p>

                <h2>
                  Resume Analysis Complete
                </h2>

                <p>
                  AI has analyzed your resume and
                  generated personalized interview
                  questions.
                </p>

              </div>


              {/* SKILLS */}
              <div className="resume-result-box">

                <h3>
                  Detected Skills
                </h3>

                <p>
                  {resumeData?.skills ||
                    "No skills detected."}
                </p>

              </div>


              {/* INTERVIEW INFO */}
              {resumeData?.interview_id && (

                <div className="resume-result-box">

                  <h3>
                    Resume Interview
                  </h3>

                  <p>
                    Interview ID:{" "}
                    <strong>
                      {resumeData.interview_id}
                    </strong>
                  </p>

                  <p>
                    AI-generated questions:{" "}
                    <strong>
                      {resumeData.total_questions ||
                        questions.length}
                    </strong>
                  </p>

                </div>

              )}


              {/* GENERATED QUESTIONS */}
              {questions.length > 0 && (

                <div className="resume-questions">

                  <h3>
                    AI-Generated Interview Questions
                  </h3>

                  {questions.map(
                    (question, index) => (

                      <div
                        className="resume-question-item"
                        key={
                          question.id ||
                          `resume-question-${index}`
                        }
                      >

                        <div className="resume-question-number">
                          {index + 1}
                        </div>

                        <div>

                          <strong>
                            {question.question}
                          </strong>

                          <span>
                            {question.category ||
                              "Resume Based"}{" "}
                            •{" "}
                            {question.difficulty ||
                              "Medium"}
                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          )}


          {/* INFO CARDS */}
          <div className="resume-info-grid">

            <div className="resume-info-box">

              <div className="resume-info-icon">
                ✦
              </div>

              <div>

                <h3>
                  AI Resume Analysis
                </h3>

                <p>
                  Analyze your skills, projects and
                  professional profile.
                </p>

              </div>

            </div>


            <div className="resume-info-box">

              <div className="resume-info-icon">
                ↗
              </div>

              <div>

                <h3>
                  Interview Preparation
                </h3>

                <p>
                  Generate personalized interview
                  questions from your resume.
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Resume;