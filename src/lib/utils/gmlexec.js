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

  // Listen for console output
  page.on('console', async msg => {

    // Only deal with gmlex output
    if (msg.text.indexOf('gmlex:') === 0) {

      // Clean output
      let output = msg.text.replace('gmlex:', '');

      // Listen for tokens
      switch (output) {
        case 'gmlexbegin':
          consoleIsListening = true;
          break;
        case 'gmlexclose':
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

  // Navigate to GMLive
  await page.goto('http://yal.cc/r/gml/');

  // Add GML to the page
  await page.exposeFunction('gmlexGML', () => {
    return gml;
  });

  // Add cb to the page
  await page.exposeFunction('gmlexCB', async err => {
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
};

module.exports = gmlexec;
