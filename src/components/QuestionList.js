function QuestionList({ questions }) {
    return (
      <div>
        {questions.map((q, index) => (
          <div key={index}>
            <h3>{q.title}</h3>
            <p>Tags: {q.tags.join(", ")}</p>
          </div>
        ))}
      </div>
    );
  }
  
  export default QuestionList;
  