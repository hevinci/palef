module.exports = {
  id: 1,
  title: 'Module 1',
  steps: [
    {
      id: 1,
      type: 'text',
      data: 'This is some text for step 1...'
    },
    {
      id: 2,
      type: 'text',
      data: 'This is some text for step 2...'
    },
    {
      id: 3,
      type: 'video',
      data: {
        url: 'video/sample.mp4',
        type: 'video/mp4'
      }
    },
    {
      id: 4,
      type: 'quiz-choice',
      data: {
        challenge: {
          uid: 1,
          type: 'multiple',
          title: "Which answer(s) contain(s) foo ?",
          items: [
            { uid: 1, text: "This is foo and bar and baz. Lorem ipsum dolor foo etc."},
            { uid: 2, text: "Sunc item varibus dona equam."},
            { uid: 3, text: "Velleam nictur sorit nunc est foo bellis."}
          ]
        },
        solutions: [
          { uid: 1, score: 3 },
          { uid: 2, score: 0 },
          { uid: 3, score: 2 }
        ]
      }
    },
    {
      id: 5,
      type: 'quiz-choice',
      data: {
        type: "choice",
        challenge: {
          uid: 2,
          type: 'single',
          title: "1 + 1 = 2 ?",
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
