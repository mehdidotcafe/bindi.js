var Bind = new function()
{
  var BIND_HTML_VALUE = "html";
  var BIND_LOADED = "bind-loaded";
  var BIND_NAME = "bind-name";
  var BIND_ATTR = "bind-attr";
  var BIND_HTML = "bind-html";
  var INTERPOLATION_START_TOKEN = "%";
  var INTERPOLATION_END_TOKEN = "%";
  var LIST_SEPARATOR_TOKEN = " ";
  var BIND_DEF_VALUE_TOKEN = ":";
  var BIND_INTERPOLATION_REGEX_START = '[' + INTERPOLATION_START_TOKEN + '](';
  var BIND_INTERPOLATION_REGEX_END = ')('  + BIND_DEF_VALUE_TOKEN + '([^' + INTERPOLATION_END_TOKEN + ']*))?[' + INTERPOLATION_END_TOKEN + ']';

  var self = this;

  function ComponentModel(e)
  {
    var id;
    this._id = 0;
    this.element = e;

    this._id += 1;
    id = this._id;
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

  this.clearComponents = function()
  {
    components = {};
  }

  this.remove = function(name)
  {
    for (var i = 0; i < components[name][0].elements.length; i++)
    {
      components[name][0].elements[i].element.remove();
    }
    components[name][0].elements = [];
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

  this.addComponentToCollection = function(name, component)
  {
    var newComponent = new ComponentModel(component);
    if (!this.contains(component))
    {
      components[name][0].elements.push(newComponent);
      componentsList.push(newComponent);
    }
  }

  // DEPRECATED
  this.cloneNodeWithEvents = function(element, param)
  {
    var nelement = element.cloneNode(param);
    var listeners = ['onclick'];

    for (var i = 0; i < listeners.length; i++)
    {
      nelement[listeners[i]] = element[listeners[i]];
    }
    return (nelement);
  }

  this.registerComponent = function(name, element)
  {
    var component = new ComponentModel(element);

    if (!components.hasOwnProperty(name))
    {
      components[name] = [
        {
          model: this.cloneNodeWithEvents(element, true),
          // model: element.cloneNode(true),
          parent: element.parentElement,
          elements: [component]
        }
      ];
      componentsList.push(element);
    }
    else
      {
        this.addComponentToCollection(name, element);
      }
    if (this.bindComponentWithDefault(element) > 0)
      element.setAttribute(BIND_LOADED, true);
    else
      this.remove(name);
  }

  var foreachJson = function(obj, fx)
  {
    for (var key in obj)
    {
      if (obj.hasOwnProperty(key))
      {
        fx(key, obj[key]);
      }
    }
  }

  var getBinding = function(str)
  {
    if (str === undefined) str = "\\w+";
    return (new RegExp(BIND_INTERPOLATION_REGEX_START + str + BIND_INTERPOLATION_REGEX_END));
  }

  this.bindAttributes = function(component, data)
  {
    var str;
    var attr = component.getAttribute(BIND_ATTR);
    var attrValue;
    var matches;
    var occurences = 0;

    if (attr && attr != "")
    {
      attr = attr.split(LIST_SEPARATOR_TOKEN);
      if (data !== undefined)
      {
        foreachJson(data, function(key, value)
        {
          for (var i = 0; i < attr.length; i++)
          {
            if (attr[i] == BIND_HTML_VALUE)
              this.bindText(component, data);
            else
            {
              attrValue = component.getAttribute(attr[i]);
              component.setAttribute(attr[i], component.getAttribute(attr[i]).replace(getBinding(key), value));
            }
          }
        });
      }
      else
      {
        for (var i = 0; i < attr.length; i++)
        {
          while ((matches = component.getAttribute(attr[i]).match(getBinding())) !== null)
            {
              if (matches[matches.length - 1])
              {
                ++occurences;
                str = matches[matches.length - 1];
              }
              else
                str = '';
              component.setAttribute(attr[i], component.getAttribute(attr[i]).replace(matches[0], str));
            }
        }
      }
    }
    return (occurences);
  }

  this.bindText = function(component, data)
  {
    var str;
    var occurences = 0;
    var attr = component.hasAttribute(BIND_HTML);
    if (attr === true)
    {
      if (data !== undefined)
      {
        foreachJson(data, function(key, value)
        {
          component.textContent = component.textContent.replace(getBinding(key), value);
        });
      }
      else
      {
        while ((matches = component.textContent.match(getBinding())) !== null)
          {

            if (matches[matches.length - 1])
            {
              ++occurences;
              str = matches[matches.length - 1];
            }
            else
              str = '';
            component.textContent = component.textContent.replace(matches[0], str);
          }
      }
    }
    component.setAttribute(BIND_LOADED, true);
    return (occurences);
  }

  this.bindComponentWithDefault = function(element)
  {
    var occurences = 0;

    for (var i = 0; i < element.children.length; i++)
      occurences += this.bindComponentWithDefault(element.children[i]);
    occurences += this.bindText(element, undefined);
    occurences += this.bindAttributes(element, undefined);
    this.attachDataToComponent(element, undefined);
    return (occurences);
  }


  this.bindComponentWithData = function(component, data)
  {
    for (var i = 0; i < component.children.length; i++)
      this.bindComponentWithData(component.children[i], data);
      this.bindAttributes(component, data);
    this.bindText(component, data);
    this.attachDataToComponent(component, data);
    return (component);
  }

  this.attachDataToComponent = function(element, data)
  {
    element.Bind = data;
  }

  this.cloneModel = function(componentName)
  {
    return (new ComponentModel(this.cloneNodeWithEvents(components[componentName][0].model, true)));
  }

  this.addFromObject = function(componentName, object)
  {
    newComponent = this.cloneModel(componentName);

    this.bindComponentWithData(newComponent.element, object);
    newComponent.element.setAttribute(BIND_LOADED, true);
    components[componentName][0].parent.appendChild(newComponent.element);
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

  this.refresh = function(componentName, data)
  {
    this.remove(componentName);
    this.add(componentName, data);
  }

  this.init = function()
  {
    var elements = document.querySelectorAll('[' + BIND_NAME + ']');

    for (var i = 0; i < elements.length; i++)
    {
      if (!self.contains(elements[i]))
      {
        self.registerComponent(elements[i].getAttribute(BIND_NAME), elements[i]);
      }
    }
  }

  return (this);
};

Bind.init();
