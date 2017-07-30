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
        def: undefined
      });
      expr.args.push({
        key: data,
        def: undefined
      });
      bindi.execExpr(expr, attrVal, data);
      bindi.evaluate(component);
    });
  });
})();
