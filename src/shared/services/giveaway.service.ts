import * as path from 'path';
import * as fs from 'fs';
import { Snowflake, GuildMember } from 'discord.js';
import { jsonService, AsyncWriter } from '../';
import '../utils/choose';

/**
 * Manages server giveaways
 */
class GiveawayService {
  /** Path to the giveaway JSON file */
  private giveawayDataPath = path.join(__dirname, '../../../data/giveAwaysData.json');

  /** Async giveaway JSON writer */
  private asyncWriter: AsyncWriter;

  /** All current giveaway data */
  private giveawayData: GiveawayContainer;

  constructor() {
    this.giveawayData = this.loadExistingData();
    this.asyncWriter = jsonService.getAsyncWriter(this.giveawayDataPath, true);
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
    delete this.giveawayData[name];
    this.save();
  }

  /** Returns an array of all active giveaways */
  giveawayArray() {
    return Object.values(this.giveawayData);
  }

  /**
   * Sign a user up for the giveaway
   * @param name Name of giveaway to sign-up for
   * @param user 
   * @returns Error message, if any
   */
  signup(name: string, user: GuildMember) {
    let now = Date.now();
    let giveaway = this.giveawayData[name];

    // Account for errors
    if (!giveaway) return `A giveaway for ${name} doesn't exist!`;
    if (now < giveaway.start.getTime()) return `The ${name} giveaway hasn't started yet!`;
    if (now > giveaway.end.getTime()) return `The ${name} giveaway signup period has concluded!`;
    if (!giveaway.participants.find(entry => entry.id === user.id)) return 'No duplicate entries!';

    // Add user to giveaway
    giveaway.participants.push({
      id: user.id,
      name: user.displayName
    });

    this.save();
    return null;
  }

  /**
   * Draw winners for a giveaway
   * @param name Giveaway name
   * @param count Number of winners to draw, default 1
   * @returns Array of newly drawn winners, or error string
   */
  drawWinner(name: string, count: number = 1) {
    let giveaway = this.giveawayData[name];

    // Account for errors
    if (!giveaway) return `A giveaway for ${name} doesn't exist!`;
    if (!giveaway.participants.length) return `The ${name} giveaway has no entries!`;

    // Don't overdraw!
    count = Math.min(count, giveaway.participants.length);

    let newWinners: Participant[] = [];

    for (let i = 0; i < count; i++) {
      // Choose a winner
      let winner = giveaway.participants.choose();

      // Remove winer from participants array
      giveaway.participants = giveaway.participants.filter(entry => entry.id !== winner.id);

      // Add them to the winner circle
      giveaway.winners.push(winner);
      newWinners.push(winner);
    }

    this.save();
    return newWinners;
  }

  /** Loads existing data, or creates it if not present */
  private loadExistingData() {
    let exists = fs.existsSync(this.giveawayDataPath);
    if (exists) {
      return fs.readFileSync(this.giveawayDataPath, 'utf8');
    } else {
      fs.writeFileSync(this.giveawayDataPath, '{}', 'utf8');
      return {};
    }
  }

  /** Saves all current giveaway data */
  private save() {
    this.asyncWriter(this.giveawayData);
  }
}

export let giveawayService = new GiveawayService();

interface GiveawayContainer {
  [key: string]: Giveaway;
}

interface Participant {
  /** Participant ID */
  id: Snowflake;

  /** Participant display name */
  name: string;
}

export interface Giveaway {
  /** Name of the giveaway */
  name: string;

  /** Date and time the giveaway begins */
  start: Date;

  /** Date and time the giveaway ends */
  end: Date;

  /** Participating users list */
  participants: Participant[];

  /** Participants who have been drawn as winners */
  winners: Participant[];
}
