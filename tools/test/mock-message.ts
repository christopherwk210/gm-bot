/**
 * Returns a basic mock-up message object
 */
export function getMockMessage() {
  let mockMessage: MockMessage = {
    channel: { send: text => Promise.resolve(text) },
    author: { send: text => Promise.resolve(text) },
    delete: () => Promise.resolve(),
    content: '',
    member: {
      send: () => Promise.resolve(mockMessage),
      guild: {
        roles: []
      }
    },
    guild: {
      roles: [],
      emojis: {
        find: () => true
      }
    },
    attachments: { values: () => [] },
    react: () => Promise.resolve(mockMessage)
  };

  return mockMessage;
}

export interface MockMessage {
  channel: { send: any; };
  author: { send: any; };
  delete: any;
  content: string;
  member: {
    send: any;
    guild: {
      roles: any[];
    };
  };
  guild: {
    roles: any[];
    emojis: {
      find: any;
    };
  };
  attachments: { values: any; };
  react: any;
  [key: string]: any;
}
