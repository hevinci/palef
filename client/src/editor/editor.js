var context = typeof window !== 'undefined' ? window : global;

module.exports = context.QuizEditor = QuizEditor;

function QuizEditor(options) {
  options = options || {};
  this.parentElement = options.parentElement || document.body;
  this.listeners = [];
}

QuizEditor.prototype.render = function () {
  this.parentElement.appendChild(this._buildForm());
};

QuizEditor.prototype.on = function (event, callback, context) {
  if (!this.listeners[event]) {
    this.listeners[event] = [];
  }

  if (context) {
    callback = callback.bind(context);
  }

  this.listeners[event].push(callback);
};

QuizEditor.prototype._trigger = function (event, data) {
  if (this.listeners[event]) {
    this.listeners[event].forEach(function (listener) {
      listener(data);
    });
  }
};

QuizEditor.prototype._buildForm = function () {
  var form = document.createElement('form');
  var title = this._buildTitleField();
  var button = this._buildSubmit();
  var currentContent;
  var contents = {};

  form.appendChild(title);
  form.appendChild(button);

  this.on('title-input', function () {
    form.insertBefore(this._buildTypeField(), button);
  }, this);
  this.on('type-selected', function (type) {
    if (!contents[type]) {
      switch (type) {
        case 'type-open':
          // empty element: quiz title is sufficient
          contents[type] = document.createElement('span');
          button.disabled = false;
          break;
        default:
          throw new Error('Unknown quiz type "' + type + '"');
      }
    }

    if (currentContent && currentContent !== contents[type]) {
      form.removeChild(currentContent);
    }

    form.insertBefore(contents[type], button);
    currentContent = contents[type];
  }, this);
  this.on('no-type-selected', function () {
    if (currentContent) {
      form.removeChild(currentContent);
      currentContent = null;
    }
  }, this);
  this.on('saving-quiz', function () {
    console.log('Saving!')
  });

  return form;
};

QuizEditor.prototype._buildTitleField = function () {
  var field = document.createElement('div');
  var label = this._buildLabel('Intitulé', 'quiz-title');
  var text = this._buildTextArea(
    'quiz-title',
    1,
    'Entrez ici le titre ou l\'énoncé de la question'
  );
  field.appendChild(label);
  field.appendChild(text);

  return field;
};

QuizEditor.prototype._buildLabel = function (text, target) {
  var label = document.createElement('label');
  label.textContent = text;
  label.htmlFor = target;

  return label;
};

QuizEditor.prototype._buildTextArea = function (id, rows, placeholder) {
  var self = this;
  var text = document.createElement('textarea');
  var hadInput = false;
  var resize = function () {
    text.style.height = 'auto';
    text.style.height = text.scrollHeight + 'px';
  };
  var delayedResize = function () {
    setTimeout(resize, 0);
  };
  var onInput = function () {
    delayedResize();

    if (!hadInput) {
      hadInput = true;
      self._trigger('title-input');
    }
  };
  text.id = id;
  text.rows = rows;
  text.placeholder = placeholder;

  text.addEventListener('change', resize);
  text.addEventListener('cut', delayedResize);
  text.addEventListener('paste', onInput);
  text.addEventListener('drop', delayedResize);
  text.addEventListener('keydown', onInput);

  return text;
};

QuizEditor.prototype._buildSubmit = function () {
  var self = this;
  var input = document.createElement('input');
  input.type = 'submit';
  input.value = 'Enregistrer';
  input.disabled = true;
  input.addEventListener('click', function (event) {
    event.preventDefault();

    if (!input.disabled) {
      self._trigger('saving-quiz');
    }
  });

  return input;
};

QuizEditor.prototype._buildTypeField = function () {
  var self = this;
  var field = document.createElement('div');
  var label = this._buildLabel('Type', 'quiz-type');
  var select = document.createElement('select');
  var types = {
    'prompt': '-- Sélectionnez un type --',
    'type-open': 'Question ouverte',
    'type-choice': 'Choix multiples'
  };
  var type, option;

  for (type in types) {
    option = document.createElement('option');
    option.value = type;
    option.textContent = types[type];
    select.appendChild(option);
  }

  select.addEventListener('change', function (event) {
    if (event.target.value === 'prompt') {
      self._trigger('no-type-selected');
    } else {
      self._trigger('type-selected', event.target.value);
    }
  });

  field.appendChild(label);
  field.appendChild(select);

  return field;
};