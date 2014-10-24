module.exports = {
  id: 3,
  title: 'Module 3',
  steps: [
    {
      type: 'text',
      data: 'This is some text for step 1...'
    },
    {
      type: 'text',
      data: 'This is some text for step 2...'
    },
    {
      type: 'text',
      data: 'This is some text for step 3...'
    },
    {
      type: 'quiz-choice',
      data: {
        challenge: {
          uid: 3,
          type: 'single',
          title: "2 * 3 = 9 ?",
          items: [
            { uid: 1, text: "True" },
            { uid: 2, text: "False" }
          ]
        },
        solutions: [
          { uid: 1, score: 2 },
          { uid: 2, score: 0 }
        ]
      }
    }
  ]
};
