import * as path from 'path';
import * as fs from 'fs';
import { jsonService, AsyncWriter } from '../';
import { Snowflake } from 'discord.js';

/**
 * Manages server giveaways, depends on jsonService
 */
class GiveawayService {
  /** Path to the giveaway JSON file */
  giveawayDataPath = path.join(__dirname, '../../../data/giveAwaysData.json');

  /** Async giveaway JSON writer */
  asyncWriter: AsyncWriter;

  /** All current giveaway data */
  giveawayData: GiveawayContainer;

  constructor() {
    this.giveawayData = this.loadExistingData();
    this.asyncWriter = jsonService.getAsyncWriter(this.giveawayDataPath, true);
  }

  /** Loads existing data, or creates it if not present */
  loadExistingData() {
    let exists = fs.existsSync(this.giveawayDataPath);
    if (exists) {
      return fs.readFileSync(this.giveawayDataPath, 'utf8');
    } else {
      fs.writeFileSync(this.giveawayDataPath, '{}', 'utf8');
      return {};
    }
  }

  /** Saves all current giveaway data */
  save() {
    this.asyncWriter(this.giveawayData);
  }

  drawWinner(name: string, count: number) {

  }
}

export let giveawayService = new GiveawayService();

interface GiveawayContainer {
  [key: string]: Giveaway;
}

interface Participant {
  /** Participant ID */
  id: Snowflake;

  /** Participant username */
  username: string;
}

export interface Giveaway {
  /** Date and time the giveaway begins */
  start: Date;

  /** Date and time the giveaway ends */
  end: Date;

  /** Participating users list */
  participants: Participant[]

  /** Participants who have been drawn as winners */
  winners: Participant[];
}
