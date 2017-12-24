(function()
{
  var BINDI_AS = bindi.PREFIX + "as";
  var BINDI_ID = bindi.PREFIX + "id";
  var BINDI_URL = bindi.PREFIX + 'url';

  var unmatchedComponents = {};
  var ajaxComponents = {};
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

    console.log('in clone', name, sourceModel);
    model.id = oldModelElement.id;
    model.element = tmpModel.element;
    model.element.setAttribute(bindi.COMPONENT_NAME, name);
    oldModelElement.insertAdjacentElement('afterend', model.element)
    oldModelElement.remove();
    tmpComponent = bindi.cloneModelFromModel(model);
    component.id = tmpComponent.id;
    component.element = tmpComponent.element;
  }

  this.cloneFromAjax = function(component, model, url)
  {
    var oldElement = component.element;

    model.element = ajaxComponents[url].model.cloneNode(true, true);
    component.element = ajaxComponents[url].model.cloneNode(true, true);
    oldElement.insertAdjacentElement('afterend', component.element);
    oldElement.remove();
  }

  this.request = function(url, cbSuccess, cbError)
  {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.send(null);
    xhr.onreadystatechange = function () {
      var DONE = 4; // readyState 4 means the request is done.
      var OK = 200; // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status >= 200 && xhr.status <= 300)
          cbSuccess(xhr.responseText);
        else {
          cbError(xhr.responseText);
        }
      }
    }
  }

  this.addComponentToUnmatched = function(name, componentName, component, model)
  {
    if (!unmatchedComponents.hasOwnProperty(name))
      unmatchedComponents[name] = [];
    unmatchedComponents[name].push({component: component, name: componentName, model: model});
  }

  this.getFromAjax = function(url, name, component, model, bindi, next)
  {
    var callback = function(response)
    {
      this.cloneFromAjax(component, ajaxComponents[url].model, url);
    }

    // no ajax request yet
    if (!ajaxComponents.hasOwnProperty(url))
    {
      ajaxComponents[url] = {
        model: undefined,
        done: false,
        listeners: []
      };
      self.request(url, function(response)
      {
        var oldModelElement = model.element;
        var modelWrapper = document.createElement('span');
        var tmpComponent;

        modelWrapper.insertAdjacentHTML('afterBegin', response);
        model.element = modelWrapper.firstChild;
        ajaxComponents[url].done = true;
        ajaxComponents[url].model = model;
        var oldElement = component.element;

        tmpComponent = bindi.cloneModelFromModel(model);
        component.element = tmpComponent.element;
        oldModelElement.insertAdjacentElement('afterend', model.element);
        oldModelElement.remove();
        oldElement.remove();
        next();
      }, function()
      {
        ajaxComponents[url] = undefined;
      });
    }
    // // ajax call processing
    else if (ajaxComponents[url].done != true)
    {
      ajaxComponents[url].listeners.push(callback)
    }
    // ajax call processed
    else
    {
      this.cloneFromAjax(component, model, url);
    }
  }

  this.getFromDOM = function(attr, name, component, model, bindi)
  {
    if (!bindi.getComponents()[attr])
      self.addComponentToUnmatched(attr, name, component, model);
    else
      self.clone(name, attr, component, model, bindi.getComponents()[attr].model);
    if (unmatchedComponents.hasOwnProperty(name))
      cloneUnmatchedFromSource(name, model, bindi);
  }

  bindi.register(BINDI_AS);
  bindi.register(BINDI_ID);
  bindi.register(BINDI_URL);
  bindi.onRegister(function(name, component, model, bindi, next)
  {
    var element = component.element;
    var attr;
    var urlValue;

    if (!(attr = element.getAttribute(BINDI_AS)))
    {
      next();
      return ;
    }
    if (element.getAttribute(BINDI_URL) === "true" || element.getAttribute(BINDI_URL) === true)
      self.getFromAjax(attr, name, component, model, bindi, next);
    else
    {
      self.getFromDOM(attr, name, component, model, bindi);
    }
    next();
  });
})();
