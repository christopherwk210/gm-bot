# GMLive

> **Matches:** `role-msg-config`

> **Usable by:** Admins

Sets up a message that can distribute roles via reaction.

\`\`\`role-msg-config  
{
  "message": "This is a big old test",
  "roles": [
    { "emojiName": "tophtoken", "description": "This will show next to the emoji", "roleID": "599985724682403863" },
    { "emoji": "💩", "emojiName": "poop", "description": "This will show next to the emoji", "roleID": "599985724682403863" }
  ]
}
\`\`\`

Built-in unicode emoji require the `"emoji"` key be supplied with the unicode symbol (without whitespace!). Guild emojis do not need this (as it would be impossible anyway since they only exist inside discord).
