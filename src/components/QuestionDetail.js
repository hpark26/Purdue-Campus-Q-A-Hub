function QuestionDetail({ question }) {
    return (
      <div>
        <h2>{question.title}</h2>
        <p>{question.description}</p>
        <p>Tags: {question.tags.join(", ")}</p>
      </div>
    );
  }
  
  export default QuestionDetail;
  