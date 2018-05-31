import { expect } from 'chai';
import { getMockMessage, MockMessage } from '../../../tools/test';
import { Message } from 'discord.js';
import { validateGMS1, validateGMS2, textService } from '..';

// Load function files into memory before testing
textService.loadAllTextFiles();

describe('GML Function Validator', () => {
  it('should correctly validate GMS1 function names', () => {
    expect(validateGMS1('draw_sprite')).to.be.true;
    expect(validateGMS1('draw_self')).to.be.true;
  });

  it('should correctly validate GMS2 exclusive function names', () => {
    expect(validateGMS2('gpu_set_blendenable')).to.be.true;
  });
});
