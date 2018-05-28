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

  /**
   * Creates a new giveaway and it returns it, false if already exists
   * @param name Giveaway name
   * @param start Start date
   * @param end End date
   */
  createGiveaway(name: string, start: Date, end: Date) {
    if (this.giveawayData[name]) return false;

    this.giveawayData[name] = {
      name,
      start,
      end,
      participants: [],
      winners: []
    };

    this.save();

    return this.giveawayData[name];
  }

  /**
   * Deletes a giveaway
   * @param name Name of the giveaway to delete
   */
  deleteGiveaway(name: string) {
    return delete this.giveawayData[name];
  }

  /** Returns an array of all active giveaways */
  giveawayArray() {
    return Object.values(this.giveawayData);
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
  /** Name of the giveaway */
  name: string;

  /** Date and time the giveaway begins */
  start: Date;

  /** Date and time the giveaway ends */
  end: Date;

  /** Participating users list */
  participants: Participant[]

  /** Participants who have been drawn as winners */
  winners: Participant[];
}
