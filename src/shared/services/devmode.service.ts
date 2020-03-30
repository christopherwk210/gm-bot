/**
 * Prevents accidental running of bot in production mode
 */
class DevModeService {

  /** Security State */
  private devMode: boolean;

  constructor() {

    /** Default developer mode state set to true */
    this.devMode = true;
  }

  /** Allows easy getting of developer mode state */
  isDevMode(): boolean {
    return this.devMode;
  }

  /** Allows easy setting of developer mode state */

  setDevMode(devModeState: boolean): void {
    this.devMode = devModeState;
  }

}

export let devModeService = new DevModeService();
