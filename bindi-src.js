(function()
{
  var BINDI_SRC = "bi-src";
  var SRC_HTML = "src";

  bindi.register(BINDI_SRC);
  bindi.onBind(function(element, bindi)
  {
    if (element.hasAttribute(BINDI_SRC))
    {
      element.setAttribute(SRC_HTML, element.getAttribute(BINDI_SRC));
    }
  });
})();
