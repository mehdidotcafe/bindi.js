// deprecated module
(function()
{
  var renders = {};

  function addPreRenderOne(compName, tagName, variableName, phase, render)
  {
    if (!renders.hasOwnProperty(compName))
      renders[compName] = {};
    if (!renders[compName].hasOwnProperty(tagName))
      renders[compName][tagName] = {};
    if (!renders[compName][tagName].hasOwnProperty(variableName))
      renders[compName][tagName][variableName] = [];
    renders[compName][tagName][variableName].push({
      render: render,
      phase: phase
    });
  }

  bindi.addPreRender = function(compNames, tagNames, variableNames, phase, render)
  {
    if (compNames.constructor !== Array)
      compNames = [compNames];
    if (tagNames.constructor !== Array)
      tagNames = [tagNames];
    if (variableNames.constructor !== Array)
      variableNames = [variableNames];
    for (var i = 0; i < compNames.length; i++)
    {
      for (var j = 0; j < tagNames.length; j++)
      {
        for (var k = 0; k < variableNames.length; k++)
        {
          addPreRenderOne(compNames[i], tagNames[j], variableNames[k], phase, render);
        }
      }
    }
  }

  bindi.removePreRender = function(compName, tagName, variableName, render)
  {
    if (renders.hasOwnProperty(compName) && renders[compName].hasOwnProperty(tagName) && renders[compName][tagName].hasOwnProperty(variableName))
    {
      for (var i = 0; i < renders[compName][tagName][variableName].length;)
        {
          if (renders[compName][tagName][variableName][i].render == render)
            renders[compName][tagName][variableName].splice(i, 1);
          else
            i += 1;
        }
    }
  }

  bindi.onPreRender(function(compName, tagName, variableName, variableValue, phase)
  {
    var value = variableValue;

    if (renders.hasOwnProperty(compName) && renders[compName].hasOwnProperty(tagName) && renders[compName][tagName].hasOwnProperty(variableName))
    {
      for (var i = 0; i < renders[compName][tagName][variableName].length; i++)
        {
          if ((renders[compName][tagName][variableName][i].phase & phase) != 0)
          {
            value = renders[compName][tagName][variableName][i].render(compName, tagName, variableName, variableValue);
          }
        }
    }
    return (value);
  });
})();
