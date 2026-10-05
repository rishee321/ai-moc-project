import { useState, useEffect, useRef } from "react";
import "./Interview.css";
import { apiRequest } from "./api/api";

function Interview({
  role = "Frontend Developer",
  type = "Technical",
  experience = "Fresher",
  difficulty = "Adaptive",
  questions = "10",
  interviewId,
  onBack,
  onComplete
}) {
  const totalQuestions = Number(questions);

  // --------------------------------------------------
  // BACK BUTTON
  // --------------------------------------------------

  const renderBackButton = () => {
    if (!onBack) return null;

    return (
      <button
        type="button"
        onClick={onBack}
        style={{
          position: "fixed",
          top: "18px",
          left: "18px",
          zIndex: 999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: "10px 17px",
          minWidth: "90px",
          height: "42px",
          background: "#ffffff",
          color: "#0b1220",
          border: "1px solid #cbd5e1",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.18)"
        }}
      >
        ← Back
      </button>
    );
  };

  // --------------------------------------------------
  // SAVED INTERVIEW STATE
  // --------------------------------------------------

  const savedInterview = JSON.parse(
    localStorage.getItem("interviewState") || "null"
  );

  const [answer, setAnswer] = useState(
    savedInterview?.answer || ""
  );

  const [timeLeft, setTimeLeft] = useState(
    savedInterview?.timeLeft > 0
      ? savedInterview.timeLeft
      : totalQuestions * 60
  );

  const [submitted, setSubmitted] = useState(
    savedInterview?.submitted || false
  );

  const [currentQuestion, setCurrentQuestion] = useState(
    savedInterview?.currentQuestion || 1
  );

  const [interviewComplete, setInterviewComplete] =
    useState(false);

  const [answers, setAnswers] = useState(
    savedInterview?.answers || []
  );

  const [isListening, setIsListening] =
    useState(false);

  const [aiState, setAiState] =
    useState("READY");

  const [voiceEnabled, setVoiceEnabled] = useState(
    savedInterview?.voiceEnabled ?? true
  );

  // --------------------------------------------------
  // BACKEND QUESTIONS
  // --------------------------------------------------

  const [questionList, setQuestionList] =
    useState([]);

  const [questionsLoading, setQuestionsLoading] =
    useState(true);

  // --------------------------------------------------
  // ANSWER RESULT
  // --------------------------------------------------

  const [answerScore, setAnswerScore] =
    useState(null);

  const [answerFeedback, setAnswerFeedback] =
    useState("");

  // --------------------------------------------------
  // FINISH LOADING
  // --------------------------------------------------

  const [finishingInterview, setFinishingInterview] =
    useState(false);

  const recognitionRef = useRef(null);

  // --------------------------------------------------
  // COMPLETE INTERVIEW + GENERATE RESULT
  // --------------------------------------------------

  const finishInterview = async (
    finalAnswers = answers
  ) => {
    if (finishingInterview) {
      return;
    }

    setFinishingInterview(true);
    setAiState("COMPLETING");

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (
      recognitionRef.current &&
      isListening
    ) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // ignore
      }

      setIsListening(false);
    }

    localStorage.setItem(
      "interviewAnswers",
      JSON.stringify(finalAnswers)
    );

    localStorage.setItem(
      "interviewPage",
      "result"
    );

    if (interviewId) {
      try {
        const completeData =
          await apiRequest(
            `/interviews/${interviewId}/complete`,
            {
              method: "POST"
            }
          );

        console.log(
          "Interview completed:",
          completeData
        );
      } catch (error) {
        console.error(
          "Interview completion error:",
          error
        );
      }

      try {
        const resultData =
          await apiRequest(
            `/results/generate/${interviewId}`,
            {
              method: "POST"
            }
          );

        console.log(
          "Interview result generated:",
          resultData
        );

        if (resultData) {
          localStorage.setItem(
            "selectedResult",
            JSON.stringify(resultData)
          );
        }
      } catch (error) {
        console.error(
          "Result generation error:",
          error
        );
      }
    }

    localStorage.removeItem(
      "interviewState"
    );

    setInterviewComplete(true);
    setFinishingInterview(false);

    if (onComplete) {
      onComplete();
    }
  };

  // --------------------------------------------------
  // START INTERVIEW + LOAD QUESTIONS
  // --------------------------------------------------

  useEffect(() => {
    const startAndLoadInterview =
      async () => {
        if (!interviewId) {
          console.log(
            "Interview ID missing"
          );

          setQuestionsLoading(false);
          return;
        }

        try {
          try {
            const startData =
              await apiRequest(
                `/interviews/${interviewId}/start`,
                {
                  method: "POST"
                }
              );

            console.log(
              "Interview started:",
              startData
            );
          } catch (error) {
            console.log(
              "Start interview response:",
              error.message
            );
          }

          const data =
            await apiRequest(
              `/interviews/${interviewId}/questions`
            );

          console.log(
            "Interview questions:",
            data
          );

          if (
            Array.isArray(data) &&
            data.length > 0
          ) {
            const selectedQuestions =
              data.slice(
                0,
                totalQuestions
              );

            setQuestionList(
              selectedQuestions
            );
          } else {
            alert(
              "No questions found for this interview."
            );
          }
        } catch (error) {
          console.error(
            "Interview loading error:",
            error
          );

          alert(
            error.message ||
              "Failed to load interview questions."
          );
        } finally {
          setQuestionsLoading(false);
        }
      };

    startAndLoadInterview();
  }, [interviewId, totalQuestions]);

  // --------------------------------------------------
  // CURRENT QUESTION
  // --------------------------------------------------

  const currentQuestionData =
    questionList[
      currentQuestion - 1
    ] || null;

  // --------------------------------------------------
  // SAVE INTERVIEW STATE
  // --------------------------------------------------

  useEffect(() => {
    if (interviewComplete) {
      return;
    }

    localStorage.setItem(
      "interviewState",
      JSON.stringify({
        answer,
        timeLeft,
        submitted,
        currentQuestion,
        answers,
        voiceEnabled
      })
    );
  }, [
    answer,
    timeLeft,
    submitted,
    currentQuestion,
    answers,
    voiceEnabled,
    interviewComplete
  ]);

  // --------------------------------------------------
  // TIMER
  // --------------------------------------------------

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!interviewComplete) {
        finishInterview(answers);
      }

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(
        (prev) => prev - 1
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    timeLeft,
    interviewComplete
  ]);

  // --------------------------------------------------
  // SPEECH RECOGNITION
  // --------------------------------------------------

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (
      event
    ) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0]
            .transcript;
      }

      setAnswer(
        (prev) =>
          prev + transcript
      );
    };

    recognition.onend = () => {
      setIsListening(false);

      if (
        aiState === "LISTENING"
      ) {
        setAiState("READY");
      }
    };

    recognitionRef.current =
      recognition;

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        // ignore
      }
    };
  }, [aiState]);

  // --------------------------------------------------
  // AI VOICE
  // --------------------------------------------------

  const speakQuestion = (
    text
  ) => {
    if (
      !voiceEnabled ||
      !("speechSynthesis" in window) ||
      !text
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(
        text
      );

    speech.lang = "en-US";
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(
      speech
    );
  };

  // --------------------------------------------------
  // SPEAK CURRENT QUESTION
  // --------------------------------------------------

  useEffect(() => {
    if (
      !currentQuestionData ||
      questionsLoading
    ) {
      return;
    }

    if (voiceEnabled) {
      speakQuestion(
        currentQuestionData.question_text
      );
    }
  }, [
    currentQuestion,
    voiceEnabled,
    currentQuestionData,
    questionsLoading
  ]);

  // --------------------------------------------------
  // STOP VOICE ON EXIT
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --------------------------------------------------
  // TIMER FORMAT
  // --------------------------------------------------

  const minutes = Math.floor(
    timeLeft / 60
  );

  const seconds =
    timeLeft % 60;

  const formattedTime =
    `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;

  // --------------------------------------------------
  // SUBMIT ANSWER + AI FOLLOW-UP
  // --------------------------------------------------

  const handleSubmit =
    async () => {
      if (!answer.trim()) {
        alert(
          "Please enter your answer first."
        );
        return;
      }

      if (!currentQuestionData) {
        alert(
          "Question not found."
        );
        return;
      }

      if (
        recognitionRef.current &&
        isListening
      ) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // ignore
        }

        setIsListening(false);
      }

      if (
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }

      try {
        // --------------------------------------------------
        // 1. SAVE + ANALYZE ANSWER
        // --------------------------------------------------

        setAiState("ANALYZING");

        console.log(
          "Submitting answer:",
          {
            question_id:
              currentQuestionData.id,
            answer_text:
              answer.trim()
          }
        );

        const data =
          await apiRequest(
            "/answers/",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                question_id:
                  currentQuestionData.id,
                answer_text:
                  answer.trim()
              })
            }
          );

        console.log(
          "Answer saved successfully:",
          data
        );

        setAnswerScore(
          data?.score ?? null
        );

        setAnswerFeedback(
          data?.feedback || ""
        );

        // --------------------------------------------------
        // 2. GENERATE AI FOLLOW-UP
        // --------------------------------------------------

        try {
          setAiState(
            "GENERATING FOLLOW-UP"
          );

          console.log(
            "🔥 FOLLOW-UP API START"
          );

          console.log(
            "Question ID:",
            currentQuestionData.id
          );

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                300
              )
          );

          const followUpData =
            await apiRequest(
              `/ai/follow-up/${currentQuestionData.id}`,
              {
                method: "POST"
              }
            );

          console.log(
            "🔥 FOLLOW-UP API END"
          );

          console.log(
            "AI Follow-up generated:",
            followUpData
          );

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                1200
              )
          );

          // --------------------------------------------------
          // 3. INSERT FOLLOW-UP
          // --------------------------------------------------

          if (
            followUpData?.follow_up_question &&
            followUpData?.follow_up_question_id
          ) {
            const followUpQuestion =
              {
                id:
                  followUpData.follow_up_question_id,

                interview_id:
                  interviewId,

                question_text:
                  followUpData.follow_up_question,

                category:
                  followUpData.category ||
                  "Adaptive Follow-up",

                difficulty:
                  followUpData.difficulty ||
                  "Adaptive"
              };

            setQuestionList(
              (prev) => {
                const insertIndex =
                  currentQuestion;

                return [
                  ...prev.slice(
                    0,
                    insertIndex
                  ),

                  followUpQuestion,

                  ...prev.slice(
                    insertIndex
                  )
                ];
              }
            );

            console.log(
              "Follow-up added:",
              followUpQuestion
            );
          }
        } catch (
          followUpError
        ) {
          console.warn(
            "AI follow-up could not be generated:",
            followUpError.message
          );
        }

        // --------------------------------------------------
        // 4. ANSWER SUBMITTED
        // --------------------------------------------------

        setSubmitted(true);

        setAiState(
          "NEXT QUESTION"
        );
      } catch (error) {
        console.error(
          "Answer submission error:",
          error
        );

        setAiState("READY");

        alert(
          error.message ||
            "Failed to save your answer. Please try again."
        );
      }
    };

  // --------------------------------------------------
  // NEXT QUESTION
  // --------------------------------------------------

  const handleNext =
    async () => {
      if (!answer.trim()) {
        return;
      }

      if (!currentQuestionData) {
        return;
      }

      const newAnswer = {
        question:
          currentQuestionData.id,

        questionNumber:
          currentQuestion,

        questionText:
          currentQuestionData.question_text,

        answer:
          answer.trim(),

        score:
          answerScore,

        feedback:
          answerFeedback
      };

      const updatedAnswers =
        [
          ...answers,
          newAnswer
        ];

      setAnswers(
        updatedAnswers
      );

      if (
        currentQuestion >=
        questionList.length
      ) {
        await finishInterview(
          updatedAnswers
        );

        return;
      }

      setCurrentQuestion(
        (prev) => prev + 1
      );

      setAnswer("");
      setSubmitted(false);
      setAnswerScore(null);
      setAnswerFeedback("");
      setAiState("READY");
    };

  // --------------------------------------------------
  // VOICE TOGGLE
  // --------------------------------------------------

  const handleVoiceToggle =
    () => {
      if (voiceEnabled) {
        if (
          "speechSynthesis" in
          window
        ) {
          window.speechSynthesis.cancel();
        }

        setVoiceEnabled(false);
      } else {
        setVoiceEnabled(true);
      }
    };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (questionsLoading) {
    return (
      <div
        className="interview-page"
        style={{
          position: "relative"
        }}
      >
        {renderBackButton()}

        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            flexDirection:
              "column",
            gap: "12px",
            padding: "20px",
            textAlign: "center"
          }}
        >
          <h2>
            Preparing your interview...
          </h2>

          <p>
            Loading questions from AI Interview Coach
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // NO QUESTIONS
  // --------------------------------------------------

  if (
    !questionsLoading &&
    questionList.length === 0
  ) {
    return (
      <div
        className="interview-page"
        style={{
          position: "relative"
        }}
      >
        {renderBackButton()}

        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            flexDirection:
              "column",
            gap: "12px",
            padding: "20px",
            textAlign: "center"
          }}
        >
          <h2>
            No interview questions found.
          </h2>

          <p>
            Please create a new interview and try again.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // FINISHING SCREEN
  // --------------------------------------------------

  if (finishingInterview) {
    return (
      <div
        className="interview-page"
        style={{
          position: "relative"
        }}
      >
        {renderBackButton()}

        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            flexDirection:
              "column",
            gap: "12px",
            padding: "20px",
            textAlign: "center"
          }}
        >
          <h2>
            Completing your interview...
          </h2>

          <p>
            Generating your interview result.
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // MAIN INTERVIEW
  // --------------------------------------------------

  return (
    <div
      className="interview-page"
      style={{
        position: "relative"
      }}
    >

      {/* GUARANTEED BACK BUTTON */}
      {renderBackButton()}

      {/* HEADER */}
      <header className="interview-header">

        <div className="logo">

          <div className="logo-icon">
            ✦
          </div>

          <span>
            Interview
            <span className="logo-plus">
              +
            </span>
          </span>

        </div>

        <div className="interview-status">
          <span className="status-dot"></span>
          LIVE INTERVIEW
        </div>

        <div className="question-count">

          QUESTION{" "}

          <strong>
            {String(
              currentQuestion
            ).padStart(2, "0")}
          </strong>

          {" / "}

          {questionList.length}

        </div>

        <div className="progress-wrapper">

          <div className="progress-info">

            <span>
              INTERVIEW PROGRESS
            </span>

            <strong>
              {Math.round(
                (currentQuestion /
                  questionList.length) *
                  100
              )}
              %
            </strong>

          </div>

          <div className="progress-bar">

            <span
              style={{
                width:
                  `${(currentQuestion /
                    questionList.length) *
                    100}%`
              }}
            ></span>

          </div>

        </div>

        {/* VOICE */}
        <button
          type="button"
          className={`voice-toggle ${
            voiceEnabled
              ? "voice-on"
              : "voice-off"
          }`}
          onClick={
            handleVoiceToggle
          }
        >
          {voiceEnabled
            ? "🔊 AI Voice"
            : "🔇 AI Voice"}
        </button>

        {/* TIMER */}
        <div
          className={`interview-timer ${
            timeLeft <= 60
              ? "warning"
              : ""
          }`}
        >
          ⏱️ {formattedTime}
        </div>

      </header>

      {/* MAIN */}
      <main className="interview-container">

        {/* LEFT */}
        <section className="interview-main">

          <div
            className={`ai-state ai-${aiState
              .toLowerCase()
              .replaceAll(
                " ",
                "-"
              )}`}
          >
            <span className="status-dot"></span>

            AI INTERVIEWER · {aiState}
          </div>

          {/* AI AVATAR */}
          <div className="ai-avatar">

            <div className="avatar-ring ring-one"></div>

            <div className="avatar-ring ring-two"></div>

            <div className="avatar-core">
              ✦
            </div>

          </div>

          <div className="interview-context">
            {role} · {type} · {experience}
          </div>

          {/* QUESTION */}
          <h1>
            {
              currentQuestionData.question_text
            }
          </h1>

          <p className="question-hint">

            {currentQuestion === 1
              ? "Take your time. Speak naturally and structure your answer clearly."
              : currentQuestionData.category ===
                "Adaptive Follow-up"
              ? "This follow-up question was generated based on your previous answer."
              : "Your previous answer helped shape this interview question."
            }

          </p>

          {/* ANSWER */}
          <div className="answer-box">

            <textarea
              value={answer}
              onChange={(e) =>
                setAnswer(
                  e.target.value
                )
              }
              placeholder="Type your answer here..."
              disabled={submitted}
            />

            <div className="answer-controls">

              {/* MICROPHONE */}
              <button
                type="button"
                className={`mic-button ${
                  isListening
                    ? "recording"
                    : ""
                }`}
                onClick={() => {

                  if (submitted) {
                    return;
                  }

                  if (
                    !recognitionRef.current
                  ) {
                    alert(
                      "Speech recognition is not supported in this browser."
                    );

                    return;
                  }

                  if (
                    isListening
                  ) {
                    try {
                      recognitionRef.current.stop();
                    } catch (
                      error
                    ) {
                      // ignore
                    }

                    setIsListening(
                      false
                    );

                    setAiState(
                      "READY"
                    );
                  } else {
                    try {
                      recognitionRef.current.start();

                      setIsListening(
                        true
                      );

                      setAiState(
                        "LISTENING"
                      );
                    } catch (
                      error
                    ) {
                      // ignore duplicate start
                    }
                  }
                }}
              >
                🎙
              </button>

              {/* RECORDING STATUS */}
              <div
                className={`recording-text ${
                  isListening
                    ? "active-recording"
                    : ""
                }`}
              >

                <span className="record-dot"></span>

                {isListening
                  ? "Recording..."
                  : "Ready to answer"}

              </div>

              {/* SUBMIT / NEXT */}
              {!submitted ? (

                <button
                  type="button"
                  className="submit-answer"
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    aiState ===
                      "ANALYZING" ||
                    aiState ===
                      "GENERATING FOLLOW-UP"
                  }
                >
                  {aiState ===
                  "ANALYZING"
                    ? "Analyzing..."
                    : aiState ===
                      "GENERATING FOLLOW-UP"
                    ? "Generating..."
                    : "Submit Answer"}

                  <span>→</span>
                </button>

              ) : (

                <button
                  type="button"
                  className="submit-answer"
                  onClick={
                    handleNext
                  }
                  disabled={
                    finishingInterview
                  }
                >

                  {currentQuestion >=
                  questionList.length
                    ? "View Results"
                    : "Next Question"}

                  <span>→</span>

                </button>

              )}

            </div>

          </div>

          {/* FEEDBACK */}
          {submitted && (

            <div className="answer-feedback">

              <div className="feedback-icon">
                ✓
              </div>

              <div>

                <strong>
                  Answer saved successfully
                </strong>

                <p>
                  Your answer has been saved to
                  the interview backend.
                </p>

                {answerScore !==
                  null && (
                  <p>
                    Score:{" "}
                    <strong>
                      {answerScore}
                    </strong>
                  </p>
                )}

                {answerFeedback && (
                  <p>
                    {answerFeedback}
                  </p>
                )}

              </div>

            </div>
          )}

        </section>

        {/* RIGHT INTELLIGENCE */}
        <aside className="live-intelligence">

          <div className="intelligence-heading">

            <div>

              <span>LIVE</span>

              <strong>
                Interview Intelligence
              </strong>

            </div>

            <div className="live-badge">
              ● LIVE
            </div>

          </div>

          {/* SESSION INFO */}
          <div className="session-info">

            <div>

              <span>ROLE</span>

              <strong>
                {role}
              </strong>

            </div>

            <div>

              <span>DIFFICULTY</span>

              <strong>
                {difficulty}
              </strong>

            </div>

          </div>

          {/* SCORE */}
          <div className="live-score">

            <span>
              CURRENT PERFORMANCE
            </span>

            <strong>
              {submitted &&
              answerScore !==
                null
                ? answerScore
                : "—"}
            </strong>

            <p>
              {submitted
                ? answerScore !==
                  null
                  ? "Backend answer analysis completed."
                  : "Answer saved successfully."
                : "Answer a question to begin analysis."
              }
            </p>

          </div>

          {/* METRICS */}
          <div className="live-metrics">

            <div className="live-metric">

              <div>

                <span>
                  CURRENT ANSWER SCORE
                </span>

                <strong>
                  {submitted &&
                  answerScore !== null
                    ? answerScore
                    : "—"}
                </strong>

              </div>

              <div className="metric-track">

                <span
                  style={{
                    width:
                      submitted &&
                      answerScore !== null
                        ? `${answerScore}%`
                        : "0%"
                  }}
                ></span>

              </div>

            </div>

            <div className="live-metric">

              <div>

                <span>
                  AI EVALUATION
                </span>

                <strong>
                  {submitted
                    ? "DONE"
                    : "—"}
                </strong>

              </div>

            </div>

            <div className="live-metric">

              <div>

                <span>
                  ADAPTIVE AI
                </span>

                <strong>
                  {aiState ===
                  "GENERATING FOLLOW-UP"
                    ? "WORKING"
                    : submitted
                    ? "READY"
                    : "—"}
                </strong>

              </div>

            </div>

          </div>

          {/* AI STATUS */}
          <div className="ai-status-card">

            <div className="status-icon">
              ✦
            </div>

            <div>

              <span>
                AI STATUS
              </span>

              <strong>

                {aiState ===
                "LISTENING"
                  ? "Listening to you"
                  : aiState ===
                    "ANALYZING"
                  ? "Saving and analyzing answer"
                  : aiState ===
                    "GENERATING FOLLOW-UP"
                  ? "Generating adaptive question"
                  : aiState ===
                    "COMPLETING"
                  ? "Completing interview"
                  : aiState ===
                    "NEXT QUESTION"
                  ? "Answer saved"
                  : "Ready for your answer"
                }

              </strong>

              <p>

                {aiState ===
                "LISTENING"
                  ? "AI is listening to your response."
                  : aiState ===
                    "ANALYZING"
                  ? "Sending your answer to the backend."
                  : aiState ===
                    "GENERATING FOLLOW-UP"
                  ? "AI is creating a follow-up based on your answer."
                  : aiState ===
                    "COMPLETING"
                  ? "Finishing interview and preparing your result."
                  : aiState ===
                    "NEXT QUESTION"
                  ? "Your answer has been saved successfully."
                  : "Start answering when you're ready."
                }

              </p>

            </div>

          </div>

        </aside>

      </main>

      {/* FOOTER */}
      <footer className="interview-footer">

        <span>
          AI adapts the interview based on your answers.
        </span>

        <span>
          Session protected
        </span>

      </footer>

    </div>
  );
}

export default Interview;