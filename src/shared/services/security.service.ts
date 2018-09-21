/**
 * Manages server security
 */
class SecurityService {

  /** Security State */
  private currentSecurityState: boolean;

  constructor() {
    this.currentSecurityState = false;
  }

  /**
   * Flips the security state.
   */
  toggleSecurityState() {
    this.currentSecurityState = !this.currentSecurityState;
  }

  /**
   * Returns the current Sercurity State
   */
  get securityState(): boolean {
    return this.currentSecurityState;
  }
}

export let securityService = new SecurityService();
