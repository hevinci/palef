var QuizPlayer = require('./quiz/player.js');

player = new QuizPlayer(document.getElementById('container'));
player.setHandlers({
  'choice-unique': require('./quiz/handler/choice.js')
});

player.play({
  "metadata": {
    "author": {
      "name": "John Doe",
      "id": 123
    },
    "created": "2014-06-15",
    "language": "fr",
    "categories": ["arithmetic"]
  },
  "type": "choice-unique",
  "challenge": {
    "title": "Which answer contains foo ?",
    "choices": [
      "This is foo and bar and baz. Lorem ipsum dolor etc.",
      "Another choice: sunc item varibus dona equam.",
      "For the last one, a bit of lorem ipsum but not that much."
    ],
    "solution": 0
  }
});
