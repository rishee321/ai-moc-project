import { useState, useEffect, useRef } from "react";
import "./Interview.css";


function Interview({
  role = "Frontend Developer",
  type = "Technical",
  experience = "Fresher",
  difficulty = "Adaptive",
  questions = "10"
  

}) {

  const totalQuestions = Number(questions);

  // SAVED INTERVIEW STATE
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

  const [interviewComplete, setInterviewComplete] = useState(false);

  const [answers, setAnswers] = useState(
    savedInterview?.answers || []
  );

  const [isListening, setIsListening] = useState(false);
  const [aiState, setAiState] = useState("READY");

  const [voiceEnabled, setVoiceEnabled] = useState(
    savedInterview?.voiceEnabled ?? true
  );

  const recognitionRef = useRef(null);


  // QUESTIONS
  const questionList = [
    {
      main: "Tell me about yourself",
      sub: "and your experience."
    },
    {
      main: "You mentioned your experience.",
      sub: "What project are you most proud of?"
    },
    {
      main: "Tell me about that project.",
      sub: "What was your specific contribution?"
    },
    {
      main: "What technical challenge did you face?",
      sub: "How did you solve it?"
    },
    {
      main: "You mentioned your approach.",
      sub: "Why did you choose that solution?"
    },
    {
      main: "How did you test your solution?",
      sub: "What did you learn from it?"
    },
    {
      main: "If you could improve that project,",
      sub: "what would you change?"
    },
    {
      main: "How do you handle difficult problems?",
      sub: "Can you explain your approach?"
    },
    {
      main: "What is one technical skill",
      sub: "you are currently improving?"
    },
    {
      main: "Why should we consider you",
      sub: "for this role?"
    }
  ];

  const currentQuestionData =
    questionList[currentQuestion - 1] || questionList[0];


  // SAVE INTERVIEW STATE
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


  // TIMER
  useEffect(() => {

    if (timeLeft <= 0) {

      setInterviewComplete(true);
      onComplete();


      localStorage.setItem(
        "interviewPage",
        "result"
      );

      localStorage.setItem(
        "interviewAnswers",
        JSON.stringify(answers)
      );

      localStorage.removeItem("interviewState");

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);

  }, [timeLeft]);


  // SPEECH RECOGNITION
  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {

      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      setAnswer((prev) => prev + transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      setAiState("READY");
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        // ignore
      }
    };

  }, []);


  // AI VOICE
  const speakQuestion = (text) => {

    if (
      !voiceEnabled ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };


  // SPEAK QUESTION
  useEffect(() => {

    const questionText =
      currentQuestionData.main +
      " " +
      currentQuestionData.sub;

    if (voiceEnabled) {
      speakQuestion(questionText);
    }

  }, [currentQuestion, voiceEnabled]);


  // STOP VOICE ON EXIT
  useEffect(() => {

    return () => {

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

    };

  }, []);


  // TIMER FORMAT
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime =
    `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;


  // SUBMIT ANSWER
  const handleSubmit = () => {

    if (!answer.trim()) {
      return;
    }

    if (
      recognitionRef.current &&
      isListening
    ) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSubmitted(true);
    setAiState("ANALYZING");

    setTimeout(() => {
      setAiState("NEXT QUESTION");
    }, 1200);
  };


  // NEXT QUESTION
  const handleNext = () => {

    if (!answer.trim()) {
      return;
    }

    const newAnswer = {
      question: currentQuestion,
      questionText:
        currentQuestionData.main +
        " " +
        currentQuestionData.sub,
      answer: answer.trim()
    };

    const updatedAnswers = [
      ...answers,
      newAnswer
    ];

    setAnswers(updatedAnswers);


    // LAST QUESTION
    if (currentQuestion >= totalQuestions) {

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      localStorage.setItem(
        "interviewAnswers",
        JSON.stringify(updatedAnswers)
      );

      localStorage.setItem(
        "interviewPage",
        "result"
      );

      localStorage.removeItem(
        "interviewState"
      );

      setInterviewComplete(true);

      return;
    }


    // NEXT QUESTION
    setCurrentQuestion(
      (prev) => prev + 1
    );

    setAnswer("");
    setSubmitted(false);
    setAiState("READY");
  };


  // VOICE TOGGLE
  const handleVoiceToggle = () => {

    if (voiceEnabled) {

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      setVoiceEnabled(false);

    } else {

      setVoiceEnabled(true);

    }
  };


  // RETRY
  const handleRetry = () => {

    localStorage.removeItem("interviewState");
    localStorage.removeItem("interviewAnswers");

    localStorage.setItem(
      "interviewPage",
      "setup"
    );

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setInterviewComplete(false);
    setCurrentQuestion(1);
    setAnswer("");
    setAnswers([]);
    setSubmitted(false);
    setIsListening(false);
    setAiState("READY");
    setTimeLeft(totalQuestions * 60);
  };


  


  return (
    <div className="interview-page">

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
            {String(currentQuestion).padStart(2, "0")}
          </strong>

          {" / "}

          {questions}

        </div>

        <div className="progress-wrapper">

          <div className="progress-info">

            <span>
              INTERVIEW PROGRESS
            </span>

            <strong>
              {Math.round(
                (currentQuestion /
                  totalQuestions) *
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
                    totalQuestions) *
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
          onClick={handleVoiceToggle}
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
              .replace(" ", "-")}`}
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

            {currentQuestionData.main}

            <span>
              {currentQuestionData.sub}
            </span>

          </h1>


          <p className="question-hint">

            {currentQuestion === 1
              ? "Take your time. Speak naturally and structure your answer clearly."
              : "Your previous answer helped shape this follow-up question."
            }

          </p>


          {/* ANSWER */}
          <div className="answer-box">

            <textarea
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
              placeholder="Type your answer here..."
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

                  if (!recognitionRef.current) {

                    alert(
                      "Speech recognition is not supported in this browser."
                    );

                    return;
                  }

                  if (isListening) {

                    recognitionRef.current.stop();

                    setIsListening(false);
                    setAiState("READY");

                  } else {

                    try {
                      recognitionRef.current.start();

                      setIsListening(true);
                      setAiState("LISTENING");
                    } catch (error) {
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
                  onClick={handleSubmit}
                >
                  Submit Answer
                  <span>→</span>
                </button>

              ) : (

                <button
                  type="button"
                  className="submit-answer"
                  onClick={handleNext}
                >

                  {currentQuestion >=
                  totalQuestions
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
                  Answer received
                </strong>

                <p>
                  AI has analyzed your response.
                  The next question will adapt
                  to your answer.
                </p>

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
              {submitted ? "82" : "—"}
            </strong>

            <p>
              {submitted
                ? "Initial answer analysis completed."
                : "Answer a question to begin analysis."
              }
            </p>

          </div>


          {/* METRICS */}
          <div className="live-metrics">

            <div className="live-metric">

              <div>

                <span>
                  Communication
                </span>

                <strong>
                  {submitted
                    ? "86"
                    : "—"}
                </strong>

              </div>

              <div className="metric-track">

                <span
                  style={{
                    width:
                      submitted
                        ? "86%"
                        : "0%"
                  }}
                ></span>

              </div>

            </div>


            <div className="live-metric">

              <div>

                <span>
                  Technical
                </span>

                <strong>
                  {submitted
                    ? "79"
                    : "—"}
                </strong>

              </div>

              <div className="metric-track">

                <span
                  style={{
                    width:
                      submitted
                        ? "79%"
                        : "0%"
                  }}
                ></span>

              </div>

            </div>


            <div className="live-metric">

              <div>

                <span>
                  Confidence
                </span>

                <strong>
                  {submitted
                    ? "81"
                    : "—"}
                </strong>

              </div>

              <div className="metric-track">

                <span
                  style={{
                    width:
                      submitted
                        ? "81%"
                        : "0%"
                  }}
                ></span>

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

                {aiState === "LISTENING"
                  ? "Listening to you"
                  : aiState === "ANALYZING"
                  ? "Analyzing your answer"
                  : aiState === "NEXT QUESTION"
                  ? "Preparing next question"
                  : "Ready for your answer"
                }

              </strong>

              <p>

                {aiState === "LISTENING"
                  ? "AI is listening to your response."
                  : aiState === "ANALYZING"
                  ? "Evaluating your response and key points."
                  : aiState === "NEXT QUESTION"
                  ? "Generating an adaptive follow-up question."
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
          AI adapts the next question based on your answer.
        </span>

        <span>
          Session protected
        </span>

      </footer>

    </div>
  );
}

export default Interview;