declare function gmlexGML();
declare function gmlexCB(text);
declare let editor;

// Imports
import * as puppeteer from 'puppeteer';

/**
 * Execute GML through GMLive
 * @param gml GML to execute
 * @param cb Callback
 */
export async function executeGML(gml: string, cb: (err: string, data: { trace: any[] }) => void) {
  // Fix GML
  gml = gml.replace(/show_debug_message\(/g, 'trace("gmlex:",');
  gml = gml.replace(/trace\(/g, 'trace("gmlex:",');

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

    let args = [];
    for (let argument of consoleOutput.args()) {
      let arg = await argument.jsonValue();
      args.push(arg);
    }

    // Only deal with gmlex output
    if (args[0] && args[0].indexOf('gmlex:') === 0) {

      // Clean output
      let output = args[1];

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
    }
  });

  // Navigate to local GMLive
  await page.goto('http://localhost:8080//gmlive/');

  // Add GML to the page
  await page.exposeFunction('gmlexGML', () => gml);

  // Add cb to the page
  await page.exposeFunction('gmlexCB', async err => {
    clearTimeout(timeOut);
    cb(err, null);
    await chrome.close();
  });

  // Inject code
  await page.evaluate(() => {

    gmlexGML().then(gmlexgml => {
      editor.setValue(`trace("gmlex:","gmlexbegin");${gmlexgml};trace("gmlex:","gmlexclose");`);

      let statusElement = document.getElementById('ace_status-hint');
      setInterval(() => {
        if (statusElement.classList.length !== 0) {
          gmlexCB(statusElement.textContent);
        }
      }, 1000 / 60);
    });

  });

  // Execute GML
  await page.click('#refresh');

  // Timeout after 60 seconds
  timeOut = setTimeout(async () => {
    cb(`GML execution timed out. Trace log:\n\n${JSON.stringify(gmlExecOutput.trace)}`, null);
    await chrome.close();
  }, 1000 * 60);
}
