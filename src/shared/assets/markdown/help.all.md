Hi, I'm GameMakerBot. Here are some of my available commands:
```
!help        - outputs this message

!resources   - outputs a list of trusted resources to assist with your GameMaker Studio journey

!docs        - outputs the URL to the documentation of a GML function
               usage: !docs [function_name] [version] [-i]
               versions: gms1,gms2; defaults to gms2
               example: !docs draw_sprite
               example: !docs draw_sprite gms1 -i
               using -i will upload an image of the docs page

!changelog   - outputs a screenshot of the latest release notes

!resize      - use when uploading an image to scale it
               usage: !resize [scale_factor] [-b] [-o]
               uses nearest neighbor scaling unless -b is used, in which case it will use bilinear
               also uploads the original if -o is used

!marketplace - searches the YYG marketplace for an asset
               usage: !marketplace "[query]"
               example: !marketplace "asset name"
```
**To have your code automatically formatted and enable syntax highlighting use the `clean-code` syntax with your code blocks:**
\`\`\`clean-code
if (condition) {do_thing();}
\`\`\`
**To generate a GMLive snippet in your message use the** `gmlive` **syntax:**
GMLive is a web tool to easily share & test GML code. We recommend it for testing snippets of code.
You can read more here: https://yal.cc/introducing-gmlive/
\`\`\`gmlive
#define main
if (true) {
  trace("Executed");
}
\`\`\`
This command will turn your code into a GMLive link e.g. http://yal.cc/r/gml/?mode=2d&gml=CiNkZWZpbmUgbWFpbgpyZXBlYXQoNSl7CiAgICBzaG93X21lc3NhZ2UoIkV4ZWN1dGVkISIpOwp9Cg==
