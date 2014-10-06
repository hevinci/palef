module.exports = {
  id: 1,
  title: 'Module 1',
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
      type: 'quiz',
      data: {
        type: "choice-unique",
        challenge: {
          title: "Which answer contains foo ?",
          choices: [
            "This is foo and bar and baz. Lorem ipsum dolor etc.",
            "Another choice: sunc item varibus dona equam.",
            "For the last one, a bit of lorem ipsum but not that much."
          ],
          "solution": 0
        }
      }
    },
    {
      type: 'quiz',
      data: {
        type: "choice-unique",
        challenge: {
          title: "1 + 1 = 2 ?",
          choices: [
            "True",
            "False"
          ],
          "solution": 0
        }
      }
    }
  ]
};
