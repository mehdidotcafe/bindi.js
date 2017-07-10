(function()
{
  var renders = {};

  bindi.addPreRender = function(tagName, variableName, render)
  {
    if (!renders.hasOwnProperty(tagName))
      renders[tagName] = {};
    if (!renders[tagName].hasOwnProperty(variableName))
      renders[tagName][variableName] = [];
    renders[tagName][variableName].push(render);
  }

  bindi.removePreRender = function(tagName, variableName, render)
  {
    if (renders.hasOwnProperty(tagName) && renders[tagName].hasOwnProperty(variableName))
    {
      for (var i = 0; i < renders[tagName][variableName].length;)
        {
          if (renders[tagName][variableName][i] == render)
            renders[tagName][variableName].splice(i, 1);
          else
            i += 1;
        }
    }
  }

  bindi.subscribeOnPreRender(function(tagName, variableName, variableValue)
  {
    var value = variableValue;

    if (renders.hasOwnProperty(tagName) && renders[tagName].hasOwnProperty(variableName))
    {
      for (var i = 0; i < renders[tagName][variableName].length; i++)
        {
          value = renders[tagName][variableName][i](tagName, variableName, variableValue);
        }
    }
    return (value);
  });
})();
