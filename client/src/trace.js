module.exports = Trace;

/**
 * Constructs a trace object.
 *
 * @param {number}  module    The module id
 * @param {number}  step      The step id
 * @param {string}  type      The step type
 * @param {number}  [score]   The step score
 * @constructor
 */
function Trace(module, step, type, score) {
  this.module = passCheck(module, 'module', 'number');
  this.step = passCheck(step, 'step', 'number');
  this.type = passCheck(type, 'type', 'string');
  this.score = passCheck(score, 'score', 'number', true) || null;
  this.time = Date.now();
}

function passCheck(argument, name, type, isNullable) {
  var argType = typeof argument;

  if (argType !== 'undefined') {
    if (argType !== type) {
      throw new Error('Argument "' + name + '" must be of type ' + type);
    }

    if (argument === '' || argument === null) {
      throw new Error('Argument "' + name + '" cannot be empty');
    }
  } else if (!isNullable) {
    throw new Error('Argument "' + name + '" must be defined');
  }

  return argument;
}
