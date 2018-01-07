// Imports
const puppeteer = require('puppeteer');

/**
 * Execute GML through GMLive
 * @param {string} gml GML to execute
 * @param {Function} cb Callback
 */
async function gmlexec(gml, cb) {

  // let trace = '';

  // Fix GML
  gml = gml.replace(/show_debug_message\(/g, 'show_debug_message("gmlex:" + ');
  gml = gml.replace(/trace\(/g, 'trace("gmlex:" + ');
  
  // Launch chrome
  let chrome = await puppeteer.launch();

  // Load a new page
  let page = await chrome.newPage();

  // Selectively listen to console
  let consoleIsListening = false;

  // Output logging
  let gmlExecOutput = { trace: [] };

  let timeOut = null;

  // Listen for console output
  page.on('console', async consoleOutput => {

    // Only deal with gmlex output
    if (consoleOutput.text.indexOf('gmlex:') === 0) {

      // Clean output
      let output = consoleOutput.text.replace('gmlex:', '');

      // Listen for tokens
      switch (output) {
        case 'gmlexbegin':
          consoleIsListening = true;
          break;
        case 'gmlexclose':
          clearTimeout(timeOut);
          await chrome.close();
          // cb(null, trace.substring(0, trace.length - 1));
          cb(null, gmlExecOutput);
          break;
        default:
          if (consoleIsListening) {
            gmlExecOutput.trace.push(output);
            // trace += output + '\n';
          }
          break;
      }

      return;
    } else {
      return;
    }
  });

  // Navigate to local GMLive
  // await page.goto('http://yal.cc/r/gml/');
  await page.goto('http://localhost:8080//gmlive/');

  // Add GML to the page
  await page.exposeFunction('gmlexGML', () => {
    return gml;
  });

  // Add cb to the page
  await page.exposeFunction('gmlexCB', async err => {
    clearTimeout(timeOut);
    cb(err, null);
    await chrome.close();
    return;
  });

  // Inject code
  await page.evaluate(async () => {
    var gmlexgml = await gmlexGML();
    editor.setValue('trace("gmlex:gmlexbegin");' + gmlexgml + ';trace("gmlex:gmlexclose");');

    var statusElement = document.getElementById('ace_status-hint');
    setInterval(() => {
      if (statusElement.classList.length !== 0) {
        gmlexCB(statusElement.textContent);
      }
    }, 1000 / 60);
  });

  // Execute GML
  await page.click('#refresh');

  // Timeout after 60 seconds
  timeOut = setTimeout(() => {
    cb('GML execution timed out. Trace log:\n\n' + JSON.stringify(gmlExecOutput.trace), null);
    await chrome.close();
  }, 1000 * 60);
};

module.exports = gmlexec;
