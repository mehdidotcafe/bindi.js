var bindi = new function()
{
  var BINDI_HTML_VALUE = "html";
  var BINDI_LOADED = "bi-loaded";
  var BINDI_NAME = "bi-name";
  var BINDI_ATTR = "bi";
  var BINDI_AS = "bi-as";
  var INTERPOLATION_START_TOKEN = "%";
  var INTERPOLATION_END_TOKEN = "%";
  var LIST_SEPARATOR_TOKEN = " ";
  var BINDI_DEF_VALUE_TOKEN = ":";
  var BINDI_INTERPOLATION_REGEX_START = '[' + INTERPOLATION_START_TOKEN + '](';
  var BINDI_INTERPOLATION_REGEX_END = ')('  + BINDI_DEF_VALUE_TOKEN + '([^' + INTERPOLATION_END_TOKEN + ']*))?[' + INTERPOLATION_END_TOKEN + ']';
  var FX_CALL_REGEX = {
      interpolationModel: ".*([" + INTERPOLATION_START_TOKEN + "](.*)[" + INTERPOLATION_END_TOKEN + "]).*",
      fxCallModel: "\\S+",
      fxCallIndicator: "g"
    }

  var registerListeners = [];
  var preRenderListeners = [];
  var initListeners = []
  var postRenderListeners = [];
  var cloneListeners = [];
  var bindListeners = [];
  var addListeners = [];
  var removeListeners = [];

  var self = this;

  this.DEFAULT_PHASE = 0x1;
  this.UPDATE_PHASE = 0x2;

  var componentModelId= 0;

  this.ComponentModel = function(e)
  {
    this.id = ++componentModelId;
    this.element = e;
  };
  /** --interface
  * {
  *   componentName: [
  *     {
  *       elements: [<componentModel>],
  *       model: <ShadowElement>
  *     }
  *   ]
  * }
  *
  */
  var components = {};
  var componentsList = [];
  var bindiAttributes = [];

  this.getComponents = function()
  {
    return (components);
  }

  this.clearComponents = function()
  {
    components = {};
  }

   var removeElementTimeout = function(element)
  {
    return function()
    {
      element.remove();
    };
  }


  this.getMaxElementDelay = function(element)
  {
    var durationProperties = ["animation-duration", "transition-duration"];
    var delayProperties = ["animation-delay", "transition-delay"];
    var delay = 0;
    var tmpDelay;
    var tmpDuration;

    for (var i = 0; i < delayProperties.length; i++)
    {
      tmpDuration = getComputedStyle(element)[durationProperties[i]];
      tmpDuration = parseFloat(tmpDuration) * (tmpDuration.substr(-2) == "ms" ? 1 : 1000);
      tmpDelay = getComputedStyle(element)[delayProperties[i]];
      tmpDelay = parseFloat(tmpDelay) * (tmpDelay.substr(-2) == "ms" ? 1 : 1000);
      tmpDelay += tmpDuration;
      if (tmpDelay > delay)
        delay = tmpDelay;
    }
    return (delay);
  }

  this.remove = function(name)
  {
    for (var i = 0; i < components[name].elements.length; i++)
    {
      this.notifyRemoveSusbcribers(components[name].elements[i]);
      setTimeout(removeElementTimeout(components[name].elements[i].element), this.getMaxElementDelay(components[name].elements[i].element));
    }
    components[name].elements = [];
  }

  this.contains = function(element)
  {
    for (var i = 0; i < componentsList.length; i++)
      {
        if (componentsList[i].element == element)
        {
          return (true);
        }
      }
    return (false);
  }

  this.register = function(attribute)
  {
    for (var i = 0; i < bindiAttributes.length; i++)
    {
      if (bindiAttributes[i] == attribute)
        return ;
    }
    bindiAttributes.push(attribute);
  }

  this.addComponentToCollection = function(name, component)
  {
    var newComponent = new this.ComponentModel(component);
    if (!this.contains(component))
    {
      components[name].elements.push(newComponent);
      componentsList.push(newComponent);
    }
  }

  this.getElementIndex = function(element)
  {
    var k = 0;
    var elem = element;
    while(elem.previousElementSibling)
    {
      k++;
      elem = elem.previousElementSibling;
    }
    return k;
  }

  this.insertElementAfterModel = function(collection, name, element)
  {
    var elem = collection.model.element;

    for (var i = 0; i < collection.elements.length; i++)
      elem = elem.nextElementSibling;
    elem.insertAdjacentElement('afterend', element);

  }

  this.insertElementAtIndex = function(collection, element)
  {
    var parent = collection.parent;
    var index = collection.index;
    if (!index) index = 0;
    if (index >= parent.children.length)
    {
      parent.appendChild(element);
    } else {
      parent.insertBefore(element, parent.children[index + collection.elements.length]);
    }
  }

  this.insertElement = function(collection, element)
  {
    var next = collection.next;
    var previous = collection.previous;
    var parent = collection.parent;

    if (next)
      next.insertAdjacentElement('beforebegin', element);
    else if (previous)
      previous.insertAdjacentElement('afterend', element);
    else if (parent)
      parent.append(element);
  }

  this.cloneNode = function(element, param)
  {
    return (element.cloneNode(param));
  }

  this.onClone = function(onClone)
  {
    cloneListeners.push(onClone);
  }

  this.onBind = function(onBind)
  {
    bindListeners.push(onBind);
  }

  this.onPreRender = function(onPreRender)
  {
    preRenderListeners.push(onPreRender);
  }

  this.onRegister = function(onRegister)
  {
    registerListeners.push(onRegister);
  }

  this.onInit = function(onInit)
  {
    initListeners.push(onInit);
  }

  this.onAdd = function(onAdd)
  {
    addListeners.push(onAdd);
  }

  this.onRemove = function(onRemove)
  {
    removeListeners.push(onRemove);
  }

  this.notifyPreRenderSubscribers = function(componentName, tagName, variableName, variableValue, phase)
  {
    for (var i = 0; i < preRenderListeners.length; i++)
      variableValue = preRenderListeners[i](componentName, tagName, variableName, variableValue, phase);
    return (variableValue);
  }

  this.notifyRegisterSubscribers = function(name, component, model, element)
  {
    for (var i = 0; i < registerListeners.length; i++)
      registerListeners[i](name, component, model, self);
  }

  this.notifyInitSubscribers = function(config)
  {
    for (var i = 0; i < initListeners.length; i++)
      initListeners[i](config, self);
  }

  this.notifyCloneSubscribers = function(component)
  {
    for (var i = 0; i < cloneListeners.length; i++)
      cloneListeners[i](component, self);
  }

  this.notifyBindSubscribers = function(element)
  {
    for (var i = 0; i < bindListeners.length; i++)
      bindListeners[i](element, self);
  }

  this.notifyRemoveSusbcribers = function(element)
  {
    var maxDuration = undefined;
    var duration;

    for (var i = 0; i < removeListeners.length; i++)
    {
      duration = removeListeners[i](element, self);
      if (duration && (!maxDuration || (parseInt(duration) > maxDuration)))
        maxDuration = duration;
    }
    return (maxDuration || 0);
  }

  this.notifyAddSusbcribers = function(element)
  {
    for (var i = 0; i < addListeners.length; i++)
      addListeners[i](element, self);
  }

  this.registerComponent = function(name, element)
  {
    var model = new this.ComponentModel(element);
    var component = this.cloneModelFromModel(model);
    var parent = element.parentElement;

    if (!components.hasOwnProperty(name))
    {
      this.notifyRegisterSubscribers(name, component, model);
      components[name] = {
        model: model,
        previous: element.previousElementSibling,
        next: element.nextElementSibling,
        // index: this.getElementIndex(element),
        parent: parent,
        elements: []
      };
    }
    if (this.bindComponentWithDefault(name, component.element) > 0)
    {
      this.insertElement(components[name], component.element);
      component.element.setAttribute(BINDI_LOADED, true);
      components[name].elements.push(component);
      componentsList.push(component.element);
    }
    model.element.remove();
  }

  this.foreachJson = function(obj, fx)
  {
    for (var key in obj)
    {
      if (obj.hasOwnProperty(key))
      {
        fx(key, obj[key]);
      }
    }
  }

  this.escapeBinding = function(str)
  {
    return str.replace('%', '%%');
  }

  var getBinding = function(str)
  {
    if (str === undefined) str = "\\w+";
    return (new RegExp(BINDI_INTERPOLATION_REGEX_START + str + BINDI_INTERPOLATION_REGEX_END));
  }

  this.interpret = function(str)
  {
    var istr;
    var expr = {
      name: undefined,
      def: undefined,
      expr: undefined,
      args: []
    };
    var defValue;

    if ((istr = str.match(new RegExp(FX_CALL_REGEX.interpolationModel))) === null)
      return (undefined);
    expr.expr = istr[1];
    str = istr[2];
    matches = str.match(new RegExp(FX_CALL_REGEX.fxCallModel, FX_CALL_REGEX.fxCallIndicator));
    if (!matches)
      return (undefined);
    for (var i = 0; i < matches.length; i++)
    {
      matches[i] = matches[i].trim();
      if (i == 0)
        expr.name = matches[i];
      else
      {
        defValue = matches[i].split(BINDI_DEF_VALUE_TOKEN);
        expr.args.push({
          key: defValue[0],
          def: defValue[1]
        });
      }
    }
    if (expr.args == 0)
      {
        defValue = expr.name.split(BINDI_DEF_VALUE_TOKEN);
        expr.name = defValue[0];
        expr.def = defValue[1];
      }
    return (expr);
  }

  this.replaceBinding = function(componentName, element, tagName, variableName, variableValue, bindings, phase)
  {
    var oldVariableValue = variableValue;

    variableValue = this.notifyPreRenderSubscribers(componentName, tagName, variableName, variableValue, phase);
    if (tagName != BINDI_HTML_VALUE)
      element.setAttribute(tagName, element.getAttribute(tagName).replace(bindings, variableValue));
    else
    {
      element.textContent = element.textContent.replace(bindings, variableValue);
    }
    return (oldVariableValue == variableValue ? 0 : 1);
  }

  this.splitConcat = function(attr)
  {
    if (attr && attr != "")
      attr = attr.split(LIST_SEPARATOR_TOKEN);
    else
      attr = [];
    attr = attr.concat(bindiAttributes);
    return (attr);
  }

  this.bindAttributes = function(componentName, component, data)
  {
    var attr = component.getAttribute(BINDI_ATTR);
    var occurences = 0;

    attr = this.splitConcat(attr);
    for (var i = 0; i < attr.length; i++)
    {
      if (attr[i] == BINDI_HTML_VALUE)
        occurences += self.bindAttr(componentName, component, attr[i], data, function()
        {
          return (component.textContent);
        }, function(v)
        {
          component.textContent = v;
        });
      else
        occurences += self.bindAttr(componentName, component, attr[i], data, function()
        {
          return component.getAttribute(attr[i]);
        }, function(v)
        {
          component.setAttribute(attr[i], v);
        });
    }
    return (occurences);
  }


  this.dataOrDefault = function(expr, data)
  {
    for (var i = 0; i < expr.args.length; i++)
    {
      if (data && data[expr.args[i].key])
        expr.args[i].value = data[expr.args[i].key];
      else
        expr.args[i].value = expr.args[i].def;
    }
  }

  this.execFx = function(expr)
  {
    return (window[expr.name].apply(this, expr.args.map(function(obj)
    {
      return (obj.value);
    })));
  }

  this.bindAttr = function(componentName, element, attr, data, get, set)
  {
    var attrValue = get();
    var expr;
    var value;
    var occurences = 0;

    if (attrValue === null)
      return (occurences);
    while ((expr = this.interpret(attrValue)) !== undefined)
    {
      // expression is a function call
      if (expr.args.length > 0)
      {
        this.dataOrDefault(expr, data);
        value = this.execFx(expr);
      }
      else if (window[expr.name])
        value = this.execFx(expr);
      else
        value = (data && data[expr.name]) || expr.def;
      attrValue = attrValue.replace(expr.expr, value);
      set(attrValue);
      if (expr.args.length > 0 || expr.def)
        ++occurences;
    }
    return (occurences);
  }

  this.bindComponentWithDefault = function(componentName, element)
  {
    var occurences = 0;
    var occurencesElement = 0;

    for (var i = 0; i < element.children.length; i++)
      occurences += this.bindComponentWithDefault(componentName, element.children[i]);
    occurencesElement += this.bindAttributes(componentName, element, undefined);
    this.attachDataToComponent(element, undefined);
    if (occurencesElement > 0)
      this.notifyBindSubscribers(element);
    return (occurences + occurencesElement);
  }


  this.bindComponentWithData = function(componentName, element, data)
  {
    for (var i = 0; i < element.children.length; i++)
      this.bindComponentWithData(componentName, element.children[i], data);
    this.bindAttributes(componentName, element, data);
    this.attachDataToComponent(element, data);
    this.notifyBindSubscribers(element);
    return (element);
  }

  this.attachDataToComponent = function(element, data)
  {
    element.bindi = data;
  }

  this.cloneModel = function(componentName)
  {
    return (new this.ComponentModel(this.cloneNode(components[componentName].model.element, true)));
  }

  this.cloneModelFromModel = function(model)
  {
    return (new this.ComponentModel(this.cloneNode(model.element, true)));
  }

  this.addFromObject = function(componentName, object)
  {
    newComponent = this.cloneModel(componentName);

    this.bindComponentWithData(componentName, newComponent.element, object);
    newComponent.element.setAttribute(BINDI_LOADED, true);
    this.notifyAddSusbcribers(newComponent);
    this.insertElement(components[componentName], newComponent.element);
    this.addComponentToCollection(componentName, newComponent.element);
  }

  this.addFromArray = function(componentName, array)
  {
    for (var i = 0; i < array.length; i++)
      this.addFromObject(componentName, array[i]);
  }

  this.add = function(componentName, data)
  {
    if (data.constructor === Array)
      self.addFromArray(componentName, data);
    else
      self.addFromObject(componentName, data);
  }

  this.update = function(componentName, data)
  {
    this.remove(componentName);
    this.add(componentName, data);
  }

  this.init = function(config)
  {
    var elements = document.querySelectorAll('[' + BINDI_NAME + ']');

    if (config !== null && typeof config === 'object')
      this.notifyInitSubscribers(config);
    for (var i = 0; i < elements.length; i++)
    {
      if (!self.contains(elements[i]))
      {
        self.registerComponent(elements[i].getAttribute(BINDI_NAME), elements[i]);
      }
    }
  }

  return (this);
};
