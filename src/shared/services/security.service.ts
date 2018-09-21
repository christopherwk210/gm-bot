/**
 * Manages server security
 */
class SecurityService {

  /** Security State */
  private currentSecurityState: boolean;

  constructor() {
    this.currentSecurityState = false;
  }

  init() {
    console.log('Security Service is active.');
  }

  /**
   * Flips the security state.
   */
  toggleSecurityState() {
    this.currentSecurityState = !this.currentSecurityState;
  }

  get securityState(): boolean {
    return this.currentSecurityState;
  }
}

export let securityService = new SecurityService();
