/**
 * Serialized list of helpful resources related to game development
 */
export const resources: ResourceList = {
  'GML Written Articles:': [
    {
      title: 'GMS1.x Documentation',
      url: 'http://docs.yoyogames.com/'
    },
    {
      title: 'GMS2 Documentation',
      url: 'http://manual.yoyogames.com/'
    },
    {
      title: 'Xor Shader Tutorials',
      url: 'https://xorshaders.weebly.com/',
      label: 'Detailed Shader Basics:'
    },
    {
      title: 'Amazon GM Resources',
      url: 'http://m.amazonappservices.com/GameMakerResources',
      label: 'Assorted Gamemaker Articles:'
    },
    {
      title: 'Make a Platformer in Gamemaker. By: Shaun Spalding',
      url: 'http://shaunspalding.co.uk/makeaplatformer.html'
    }
  ],
  'GML Video Tutorials and Channels:': [
    {
      title: 'Official YYG tutorials page',
      url: 'https://www.yoyogames.com/tutorials'
    },
    {
      title: 'Pixelated Pope',
      url: 'https://www.youtube.com/user/PixelatedPope'
    },
    {
      title: 'Shaun Spalding',
      url: 'https://www.youtube.com/user/999Greyfox'
    },
    {
      title: 'HeartBeast',
      url: 'https://www.youtube.com/user/uheartbeast'
    },
    {
      title: 'Friendly Cosmonaut',
      url: 'https://www.youtube.com/channel/UCKCKHxkH8zqV9ltWZw0JFig'
    },
    {
      title: 'Very useful bite sized videos on specific topics',
      url: 'https://www.youtube.com/channel/UCcYKLm0EwyWkfTA6sMn5W7g'
    },
    {
      title: 'Official YYG YouTube channel',
      url: 'https://www.youtube.com/user/yoyogamesltd'
    }
  ],
  'Advanced GML Topics:': [
    {
      title: 'Git based source control with GMS2',
      url: 'https://www.youtube.com/watch?v=6zj86KN8Vco'
    },
    {
      title: 'Debug Mode Basics',
      url: 'https://www.youtube.com/watch?v=iJH_uTq9iOQ'
    }
  ],
  'Pixel Art Articles and Video Resources:': [
    {
      title: 'MortMort',
      url: 'https://www.youtube.com/user/atMNRArt'
    },
    {
      title: 'Basic Guide to Pixel Art',
      url: 'http://pixeljoint.com/forum/forum_posts.asp?TID=11299'
    },
    {
      title: 'Guide on Choosing the Right Canvas Size',
      url: 'https://www.youtube.com/watch?v=AXb-VBZTKDA'
    },
    {
      title: 'Pixel Logic Book',
      url: 'https://pixellogicbook.com/'
    }
  ],
  'Pixel Art Reference Sites and Tutorials:': [
    {
      title: 'Miniboss',
      url: 'http://blog.studiominiboss.com/pixelart'
    },
    {
      title: 'The Spriters Resource',
      url: 'https://www.spriters-resource.com/'
    },
    {
      title: 'Lospec Palette List',
      url: 'https://lospec.com/palette-list',
      label: 'Find colour palettes here:'
    },
    {
      title: 'Guide to Subpixel Animation',
      url: 'https://2dwillneverdie.com/tutorial/give-your-sprites-depth-with-sub-pixel-animation/'
    }
  ],
  'Music Theory and Learning Sites/Channels:': [
    {
      title: 'MusicTheory.net',
      url: 'https://www.musictheory.net/lessons'
    },
    {
      title: '12tone Building Blocks',
      url: 'https://www.youtube.com/playlist?list=PLMvVESrbjBWplAcg3pG0TesncGT7qvO06'
    }
  ],
  'Other Useful Topics and Resources:': [
    {
      title: '"Your First Game Will (and Should) Suck" By: PixelatedPope',
      url: 'https://goo.gl/sgz7d2'
    },
    {
      title: 'Your Game Idea is Too Big',
      url: 'http://yourgameideaistoobig.com'
    },
    {
      title: 'Rubber Duck Debugging',
      url: 'https://rubberduckdebugging.com/'
    }
  ]
};

export interface ResourceList {
  [x: string]: Resource[];
}

interface Resource {
  title: string;
  url: string;
  label?: string;
}
