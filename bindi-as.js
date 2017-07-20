(function()
{
  var BINDI_AS = "bi-as";
  var BINDI_ID = "bi-id";

  var unmatchedComponents = {};
  var self = this;

  this.cloneUnmatchedFromSource = function(name, sourceModel, bindi)
  {
    var model;
    var component;

    for (var i = 0; i < unmatchedComponents[name].length; i++)
    {
      model = unmatchedComponents[name][i].model;
      component = unmatchedComponents[name][i].component;
      this.clone(unmatchedComponents[name][i].name, name, component, model, sourceModel)
    }
    unmatchedComponents[name] = []
  }

  this.clone = function(name, modelName, component, model, sourceModel)
  {
    var tmpModel = bindi.cloneModelFromModel(sourceModel);
    var tmpComponent;
    var oldModelElement = model.element;

    model.id = oldModelElement.id;
    model.element = tmpModel.element;
    model.element.setAttribute("bi-name", name);
    oldModelElement.insertAdjacentElement('afterend', model.element)
    oldModelElement.remove();
    tmpComponent = bindi.cloneModelFromModel(model);
    component.id = tmpComponent.id;
    component.element = tmpComponent.element;
    // model.element.insertAdjacentElement('afterend', component.element)
  }

  this.addComponentToUnmatched = function(name, componentName, component, model)
  {
    if (!unmatchedComponents.hasOwnProperty(name))
      unmatchedComponents[name] = [];
    unmatchedComponents[name].push({component: component, name: componentName, model: model});
  }

  bindi.register(BINDI_AS);
  bindi.onRegister(function(name, component, model, bindi)
  {
    var element = component.element;
    var attr;

    if (!(attr = element.getAttribute(BINDI_AS)))
      return ;
    if (!bindi.getComponents()[attr])
      self.addComponentToUnmatched(attr, name, component, model);
    else
      self.clone(name, attr, component, model, bindi.getComponents()[attr].model);
    if (unmatchedComponents.hasOwnProperty(name))
      cloneUnmatchedFromSource(name, model, bindi);
  });
})();
