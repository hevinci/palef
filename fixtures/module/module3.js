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
      type: 'quiz',
      data: {
        type: "choice-unique",
        challenge: {
          title: "2 * 3 = 9 ?",
          choices: [
            "True",
            "False"
          ],
          "solution": 1
        }
      }
    }
  ]
};
