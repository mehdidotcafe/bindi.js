(function()
{
  var BINDI_CLICK = bindi.PREFIX + "click";

  bindi.register(BINDI_CLICK);
  bindi.onBind(function(component, element, data, bindi)
  {
    var attrValue;
    var expr;

    if (!element.hasAttribute(BINDI_CLICK))
      return ;
    element.addEventListener("click", function()
    {
      attrVal = element.getAttribute(BINDI_CLICK);
      expr = bindi.interpret(attrVal, true);
      expr.args.push({
        key: element,
        def: element
      });
      expr.args.push({
        key: data,
        def: data
      });
      bindi.execExpr(expr, attrVal, data, true);
      bindi.evaluate(component);
    });
  });
})();
