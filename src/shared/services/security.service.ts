/**
 * Manages server security
 */
class SecurityService {

  /** Security State */
  private currentSecurityState: boolean;

  constructor() {
    /** Default security state set to true. */
    this.currentSecurityState = true;
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
