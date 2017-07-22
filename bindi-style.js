(function()
{
  var BINDI_STYLE_CLASS_ADD = bindi.PREFIX + "add";
  var BINDI_STYLE_CLASS_RM = bindi.PREFIX + "rm";

  var BINDI_CONFIG_NAME = "style";
  var BINDI_CONFIG_NAME_ADD = "add";
  var BINDI_CONFIG_NAME_RM = "rm";
  var BINDI_CONFIG_NAME_DURATION = "duration";


  bindi.onInit(function(config, bindi)
  {
    if (config[BINDI_CONFIG_NAME])
    {
      BINDI_STYLE_CLASS_ADD = config[BINDI_CONFIG_NAME][BINDI_CONFIG_NAME_ADD] || BINDI_STYLE_CLASS_ADD;
      BINDI_STYLE_CLASS_RM = config[BINDI_CONFIG_NAME][BINDI_CONFIG_NAME_RM] || BINDI_STYLE_CLASS_RM;
    }
  });

  var addToClassList = function(element, cls)
  {
    if (!element.classList.contains(cls))
      element.classList.add(cls);
  }

  var removeToClassList = function(element, cls)
  {
    if (!element.classList.contains(cls))
      element.classList.remove(cls);
  }

  var addClass = function(element, cls)
  {
    if (cls.constructor === Array)
      {
        for (var i = 0; i < cls.length; i++)
          addToClassList(element, cls[i]);
      }
    else
      addToClassList(element, cls);
  }

  var removeClass = function(element, cls)
  {
    if (cls.constructor === Array)
      {
        for (var i = 0; i < cls.length; i++)
          removeToClassList(element, cls[i]);
      }
    else
      removeToClassList(element, cls);
  }

  bindi.onRemove(function(component)
  {
    removeClass(component.element, BINDI_STYLE_CLASS_ADD);
    addClass(component.element, BINDI_STYLE_CLASS_RM);
  });

  bindi.onAdd(function(component)
  {
    addClass(component.element, BINDI_STYLE_CLASS_ADD);
  });
})();
