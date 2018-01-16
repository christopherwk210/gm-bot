Hi, I'm GameMakerBot. Here are my available commands:
```
!help        - outputs this message

!role        - toggles a role
               usage: !role [role]
               available roles: 'voip', 'streamy', '3d'

!resources   - outputs a list of trusted resources to assist with your GameMaker Studio journey

!docs        - outputs the URL to the documentation of a GML function
               usage: !docs [function_name] [version] [-i]
               versions: 'gms1','gms2'; defaults to 'gms2'
               example: !docs draw_sprite
               example: !docs draw_sprite gms1 -i
               using -i will upload an image of the docs page

!commandment - outputs a GIF version of one of Pixelated Pope's GameMaker commandments
               usage: !commandment [roman numeral | "list"]
               Using "list" will DM you a list of all commandments
               example: !commandment XI

!changelog   - outputs a screenshot of the latest release notes

!resize      - use when uploading an image to scale it
               usage: !resize [scale_factor] [-b]
               uses nearest neighbor scaling unless -b is used, in which case it will use bilinear
```
**This is how you add code blocks to your messages in Discord:**
\`\`\`
if (condition) { do_thing(); }
\`\`\`
**To have your code automatically formatted and enable syntax highlighting use the `clean-code` syntax:**
\`\`\`clean-code
if (condition) {do_thing();}
\`\`\`
**To generate a GMLive snippet in your message use the** `gmlive` **syntax:**
GMLive is a web tool to easily share & test GML code. We recommend it for testing snippets of code.
GMLive was written by @YellowAfterlife. You can read more here: https://yal.cc/introducing-gmlive/
\`\`\`gmlive
#define main
if (true) {
  trace("Executed");
}
\`\`\`
This command will turn your code into a GMLive link for other users to look at e.g. http://yal.cc/r/gml/?mode=2d&gml=CiNkZWZpbmUgbWFpbgpyZXBlYXQoNSl7CiAgICBzaG93X21lc3NhZ2UoIkV4ZWN1dGVkISIpOwp9Cg==
