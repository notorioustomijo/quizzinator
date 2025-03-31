import { useState } from 'react';
import axios from 'axios';

function App() {
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setFeedback(null);
    setAnswers([]);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/generate-quiz`, {
        topic,
        num_questions: 5
      });
      setQuestions(response.data);
    } catch (err) {
      console.error('Error generating quiz:', err);
      alert('Failed to generate quiz');
    }
    setLoading(false);
  }

  const handleAnswerChange = (index, answer) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmitAnswers = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/submit-answers`, {
        questions,
        answers
      });
      setFeedback(response.data);

    } catch (err) {
      console.error('Error submitting answers:', err);
      alert('Failed to submit answers');
    }
    setLoading(false);
  }

  return (
    <div className='app'>
      <h1>AI Quiz Generator</h1>

      {/* Topic Input */}
      {!questions.length && (
        <div>
          <label>
            Enter a topic (e.g. history, science)
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder='e.g. history'
            />
          </label>
          <button onClick={handleGenerateQuiz} disabled={loading || !topic}>
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      )}

      {/* Display Questions */}
      {questions.length > 0 && !feedback && (
        <div>
          <h2>Quiz Questions</h2>
          {questions.map((q, index) => (
            <div key={index} className='question'>
              <p>{q.question}</p>
              {Object.entries(q.options).map(([key, value]) => (
                <label key={key}>
                  <input 
                    type="radio" 
                    name={`question-${index}`}
                    value={key}
                    onChange={() => handleAnswerChange(index, key)}
                    checked={answers[index] === key}
                  />
                  {key}: {value}
                </label>
              ))}
            </div>
          ))}
          <button
            onClick={handleSubmitAnswers}
            disabled={loading || answers.length !== questions.length}
          >
            {loading ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
      )}

      {/* Display Feedback */}
      {feedback && (
        <div>
          <h2>Results</h2>
          <p>
            Score: {feedback.score} / {feedback.total}
          </p>
          {feedback.feedback.map((item, index) => (
            <div key={index} className={item.is_correct ? 'correct' : 'incorrect'}>
              <p>{item.question}</p>
              <p>Your Answer: {item.user_answer}</p>
              <p>Correct Answer: {item.correct_answer}</p>
              <p>{item.is_correct ? 'Correct!' : 'Incorrect'}</p>
            </div>
          ))}
          <button
            onClick={() => {
              setQuestions([]);
              setFeedback(null);
              setAnswers([]);
              setTopic('');
            }}
          >
            Start New Quiz
          </button>
        </div>
      )}
    </div>
  )
}

export default App
