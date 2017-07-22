(function()
{
  var BI_DIFFER_NAME = bindi.PREFIX + "differ";

  bindi.register(BI_DIFFER_NAME);
  bindi.onPreBind(function(element, attributes, bindi)
  {
    var attr;
    var attrVal;

    if ((attr = element.getAttribute(BI_DIFFER_NAME)))
    {
      if ((attr = attr.split(/\s+/g)) === null)
        return (undefined);
      for (var i = 0; i < attr.length; i++)
      {
        if ((attrVal = element.getAttribute(bindi.PREFIX + attr[i])) != null)
        {
          bindi.register(bindi.PREFIX + attr[i]);
          element.setAttribute(attr[i], attrVal);
        }
      }
    }
    return (attr);
  });
})();
