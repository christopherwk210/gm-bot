Hi, I'm GameMakerBot. Here are my available commands:
```
!help        - outputs this message

!role        - toggles a role on and off
               usage: !role [role]
               available roles: 'voip', 'streamy'

!resources   - outputs a list of trusted resources to assist with your GameMaker Studio journey

!docs        - outputs the URL to the documentation of a GML function
               usage: !docs [function_name] [optional: version]
               available versions: 'gms1','gms2'; defaults to 'gms2'
               example: !docs draw_sprite
               example: !docs draw_sprite gms2
               example: !docs draw_sprite gms1

!commandment - outputs a GIF version of one of Pixelated Pope's GameMaker commandments
               usage: !commandment [roman numeral | "list"]
               Using "list" will DM you a list of available commandments
               example: !commandment I
               example: !commandment XII
               example: !commandment list

You can also toggle the streamy role by typing '!streamy' (without quotes).
```

**This is how you add code blocks to your messages in Discord:**
\`\`\`
if (condition) {
  perform_action();
}
\`\`\`

I can also assist you with your code formatting and auto generate GMLive snippets for you:

**To have your code automatically formatted and enable syntax highlighting use the `clean-code` syntax:**
\`\`\`clean-code
if (condition) {
perform_action();
}
\`\`\`

**To generate a GMLive snippet in your message use the** `gmlive` **syntax:**
GMLive is a web-based tool to easily share and test GML code. We recommend it for testing snippets of code.
GMLive was written by @YellowAfterlife. You can read more here: https://yal.cc/introducing-gmlive/

\`\`\`gmlive
#define main
if (true) {
  show_message("Executed");
}
\`\`\`

This command will automatically turn your code into a GMLive link for other users to look at e.g. http://yal.cc/r/gml/?mode=2d&gml=CiNkZWZpbmUgbWFpbgpyZXBlYXQoNSl7CiAgICBzaG93X21lc3NhZ2UoIkV4ZWN1dGVkISIpOwp9Cg==