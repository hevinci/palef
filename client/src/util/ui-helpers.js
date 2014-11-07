var templates = window.Templates || {};
var utils = module.exports = {};

utils.getTemplate = function (id) {
  if (!templates[id]) {
    throw new Error('Unknown template "' + id + '"');
  }

  return templates[id];
};
