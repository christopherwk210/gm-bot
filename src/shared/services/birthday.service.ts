import { jsonService } from './json.service';

/**
 * Manages birthday timers
 */
class BirthdayService {
  birthdays: Birthday[] = [];
  /** Load active birthday timers from file */
  init() {
    let loadedBirthdays = jsonService.files['birthdayTimers'];
    if (loadedBirthdays) {
      // do stuff to load timers
    }
  }

  /**
   * add birthday and add to file
   */
  addBirthday() {

  }
}

interface Birthday {
  /** User */
  user: string;

  /** setTimeout for this */
  timer: any;
}

export let birthdayService = new BirthdayService();
